// =================================================================

import { RpcTypeError, RpcError, RpcRangeError, RpcTimeout, RpcTransportError } from '../../lib/error';
import { RpcClientOptions, RpcLoginOptions } from '../options';
import EventEmitter from 'events';
import { setTimeout, clearTimeout } from 'timers';
import fetch from 'node-fetch';
import * as transports from '../transports';
import { RPCCommands, RPCEvents, RelationshipTypes } from './constants';
import { pid as getPid, uuid } from './util';

// =================================================================

function subKey(event: string, args: any): string {
    return `${event}${JSON.stringify(args)}`;
};

// =================================================================

/**
 * The main hub for interacting with Discord RPC
 * @extends {EventEmitter}
 */
class RpcClient extends EventEmitter {
    options: RpcClientOptions;
    accessToken: string | null;
    clientId: string | null;
    application: any;
    user: any;
    fetch: any;
    transport: any;
    _expecting: Map<string, { resolve: Function, reject: Function }>;
    _connectPromise: Promise<RpcClient> | undefined;
    private _subscriptions: Map<string, Function>;

    /**
     * @extends {ClientOptions}
     * @param {RpcClientOptions} options Options for the client.
     */
    constructor(options: RpcClientOptions = {}) {
        super();

        this.options = options;
        this.accessToken = null;
        this.clientId = null;
        this.application = null;
        this.user = null;
        this._subscriptions = new Map<string, Function>();

        function TransportDefined(options: RpcClientOptions): options is Required<RpcClientOptions> {
            return this.options.transport !== undefined;
        };

        if (TransportDefined(this.options)) {
            console.log(this.options.transport);
            const Transport = transports[this.options.transport as keyof typeof transports];
            console.log(Transport);
            if (!Transport) {
                throw new RpcTransportError(`RPC_INVALID_TRANSPORT: "${this.options.transport}". valid transport is "ipc" or "websocket"`);
            };
            this.fetch = (method: string, path: string, { data, query }: any = {}) => fetch(`${this.fetch.endpoint}${path}${query ? new URLSearchParams(query) : ''}`,
                {
                    method,
                    body: data,
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                }).then(async (r: any) => {
                    const body = await r.json();
                    if (!r.ok) {
                        const e = new RpcError(r.status);
                        e.body = body;
                        throw e;
                    };
                    return body;
                });
            this.fetch.endpoint = 'https://discord.com/api';

            this.transport = new Transport(this);
            this.transport.on('message', this._onRpcMessage.bind(this));

            this._expecting = new Map();
            this._connectPromise = undefined;
        } else {
            throw new RpcTransportError(`RPC_INVALID_TRANSPORT: "${this.options.transport}". please insert a valid transport "ipc" or "websocket"`);
        };
    };

    /**
     * Search and connect to RPC
     */
    connect(clientId: string): Promise<RpcClient> {
        if (this._connectPromise) {
            return this._connectPromise;
        };
        this._connectPromise = new Promise((resolve, reject) => {
            this.clientId = clientId;
            const timeout = setTimeout(() => reject(new RpcTimeout('RPC_CONNECTION_TIMEOUT')), 10e3);
            timeout.unref();
            this.once('connected', () => {
                clearTimeout(timeout);
                resolve(this);
            });
            this.transport.once('close', (event: any) => {
                this._expecting.forEach((e) => {
                    e.reject(new RpcError(`${event.code}: ${event.reason}. connection closed`));
                });
                this.emit('disconnected');
                reject(new RpcError(`${event.code}: ${event.reason}. connection closed`));
            });
            this.transport.connect().catch(reject);
        });
        return this._connectPromise;
    };

    async login(loginOptions: RpcLoginOptions): Promise<RpcClient> {
        const { clientId, clientSecret } = loginOptions;
        if (clientId && clientSecret) {
            await this.connect(clientId);
            if (!loginOptions.scopes) {
                this.emit('ready');
                return this;
            };
            const accessToken = await this.authorize({
                clientId,
                clientSecret,
                scopes: loginOptions.scopes,
            });
            return this.authenticate(accessToken);
        } else {
            throw new RpcError('Client ID is required for login.');
        };
    };

    async request(cmd: string, args: any, evt?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const nonce = uuid();
            this.transport.send({ cmd, args, evt, nonce });
            this._expecting.set(nonce, { resolve, reject });
        });
    }

    _onRpcMessage(message: any): void {
        if (message.cmd === RPCCommands.DISPATCH && message.evt === RPCEvents.READY) {
            if (message.data.user) {
                this.user = message.data.user;
            };
            this.emit('connected');
        } else if (this._expecting.has(message.nonce)) {
            const expectation = this._expecting.get(message.nonce);
            if (expectation) {
                const { resolve, reject } = expectation;
                if (message.evt === 'RpcError') {
                    const e = new RpcError(message.data.message);
                    e.code = message.data.code;
                    e.data = message.data;
                    reject(e);
                } else {
                    resolve(message.data);
                };
                this._expecting.delete(message.nonce);
            };
        } else {
            this.emit(message.evt, message.data);
        };
    };

    async authorize({ scopes, clientSecret, rpcToken, redirectUri, prompt }: any = {}): Promise<string> {
        if (!this.clientId) {
            throw new RpcError('Client ID is not set.');
        };

        if (clientSecret && rpcToken === true) {
            const body = await this.fetch('POST', '/oauth2/token/rpc', {
                data: new URLSearchParams({
                    client_id: this.clientId,
                    client_secret: clientSecret,
                }),
            });
            rpcToken = body.rpc_token;
        };

        const { code } = await this.request('AUTHORIZE', {
            scopes,
            client_id: this.clientId,
            prompt,
            rpc_token: rpcToken,
        });

        const response = await this.fetch('POST', '/oauth2/token', {
            data: new URLSearchParams({
                client_id: this.clientId,
                client_secret: clientSecret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
            }),
        });
        return response.access_token;
    };

    async authenticate(accessToken: string): Promise<RpcClient> {
        return this.request('AUTHENTICATE', { access_token: accessToken })
            .then(({ application, user }: any) => {
                this.accessToken = accessToken;
                this.application = application;
                this.user = user;
                this.emit('ready');
                return this;
            }).catch(e => {
                throw new RpcTypeError(e);
            });
    }

    getGuild(id: string, timeout?: number): Promise<any> {
        return this.request(RPCCommands.GET_GUILD, { guild_id: id, timeout });
    }

    getGuilds(timeout?: number): Promise<any> {
        return this.request(RPCCommands.GET_GUILDS, { timeout });
    }

    getChannel(id: string, timeout?: number): Promise<any> {
        return this.request(RPCCommands.GET_CHANNEL, { channel_id: id, timeout });
    }

    async getChannels(id?: string, timeout?: number): Promise<any> {
        const { channels } = await this.request(RPCCommands.GET_CHANNELS, {
            timeout,
            guild_id: id,
        });
        return channels;
    }

    setCertifiedDevices(devices: any[]): Promise<any> {
        return this.request(RPCCommands.SET_CERTIFIED_DEVICES, {
            devices: devices.map((d) => ({
                type: d.type,
                id: d.uuid,
                vendor: d.vendor,
                model: d.model,
                related: d.related,
                echo_cancellation: d.echoCancellation,
                noise_suppression: d.noiseSuppression,
                automatic_gain_control: d.automaticGainControl,
                hardware_mute: d.hardwareMute,
            })),
        });
    }

    setUserVoiceSettings(id: string, settings: any): Promise<any> {
        return this.request(RPCCommands.SET_USER_VOICE_SETTINGS, {
            user_id: id,
            pan: settings.pan,
            mute: settings.mute,
            volume: settings.volume,
        });
    };

    selectVoiceChannel(id: string, { timeout, force = false }: { timeout?: number, force?: boolean } = {}): Promise<any> {
        return this.request(RPCCommands.SELECT_VOICE_CHANNEL, { channel_id: id, timeout, force });
    };

    selectTextChannel(id: string, { timeout }: any = {}): Promise<any> {
        return this.request(RPCCommands.SELECT_TEXT_CHANNEL, { channel_id: id, timeout });
    };

    async getVoiceSettings(): Promise<any> {
        return this.request(RPCCommands.GET_VOICE_SETTINGS, {}).then((s: any) => ({
            automaticGainControl: s.automatic_gain_control,
            echoCancellation: s.echo_cancellation,
            noiseSuppression: s.noise_suppression,
            qos: s.qos,
            silenceWarning: s.silence_warning,
            deaf: s.deaf,
            mute: s.mute,
            input: {
                availableDevices: s.input.available_devices,
                device: s.input.device_id,
                volume: s.input.volume,
            },
            output: {
                availableDevices: s.output.available_devices,
                device: s.output.device_id,
                volume: s.output.volume,
            },
            mode: {
                type: s.mode.type,
                autoThreshold: s.mode.auto_threshold,
                threshold: s.mode.threshold,
                shortcut: s.mode.shortcut,
                delay: s.mode.delay,
            },
        }));
    };

    setVoiceSettings(args: any): Promise<any> {
        return this.request(RPCCommands.SET_VOICE_SETTINGS, {
            automatic_gain_control: args.automaticGainControl,
            echo_cancellation: args.echoCancellation,
            noise_suppression: args.noiseSuppression,
            qos: args.qos,
            silence_warning: args.silenceWarning,
            deaf: args.deaf,
            mute: args.mute,
            input: args.input ? {
                device_id: args.input.device,
                volume: args.input.volume,
            } : undefined,
            output: args.output ? {
                device_id: args.output.device,
                volume: args.output.volume,
            } : undefined,
            mode: args.mode ? {
                type: args.mode.type,
                auto_threshold: args.mode.autoThreshold,
                threshold: args.mode.threshold,
                shortcut: args.mode.shortcut,
                delay: args.mode.delay,
            } : undefined,
        });
    };

    async captureShortcut(callback: Function): Promise<Function> {
        const subid = subKey(RPCEvents.CAPTURE_SHORTCUT_CHANGE, {});
        const stop = () => {
            this._subscriptions.delete(subid);
            return this.request(RPCCommands.CAPTURE_SHORTCUT, { action: 'STOP' });
        };
        this._subscriptions.set(subid, ({ shortcut }: any) => {
            callback(shortcut, stop);
        });
        return this.request(RPCCommands.CAPTURE_SHORTCUT, { action: 'START' }).then(() => stop);
    };

    setActivity(args: any = {}, pid: number = getPid()!): Promise<any> {
        let timestamps;
        let assets;
        let party;
        let secrets;
        if (args.startTimestamp || args.endTimestamp) {
            timestamps = {
                start: args.startTimestamp,
                end: args.endTimestamp,
            };
            if (timestamps.start instanceof Date) {
                timestamps.start = Math.round(timestamps.start.getTime());
            };
            if (timestamps.end instanceof Date) {
                timestamps.end = Math.round(timestamps.end.getTime());
            };
            if (timestamps.start > 2147483647000) {
                throw new RpcRangeError('timestamps.start must fit into a unix timestamp');
            };
            if (timestamps.end > 2147483647000) {
                throw new RpcRangeError('timestamps.end must fit into a unix timestamp');
            };
        };
        if (
            args.largeImageKey || args.largeImageText
            || args.smallImageKey || args.smallImageText
        ) {
            assets = {
                large_image: args.largeImageKey,
                large_text: args.largeImageText,
                small_image: args.smallImageKey,
                small_text: args.smallImageText,
            };
        };
        if (args.partySize || args.partyId || args.partyMax) {
            party = { id: args.partyId };
            if (args.partySize || args.partyMax) {
                party.size = [args.partySize, args.partyMax];
            };
        };
        if (args.matchSecret || args.joinSecret || args.spectateSecret) {
            secrets = {
                match: args.matchSecret,
                join: args.joinSecret,
                spectate: args.spectateSecret,
            };
        };

        return this.request(RPCCommands.SET_ACTIVITY, {
            pid,
            activity: {
                state: args.state,
                details: args.details,
                timestamps,
                assets,
                party,
                secrets,
                buttons: args.buttons,
                instance: !!args.instance,
            },
        });
    };

    clearActivity(pid: number = getPid()!): Promise<any> {
        return this.request(RPCCommands.SET_ACTIVITY, {
            pid,
        });
    };

    sendJoinInvite(user: any): Promise<any> {
        return this.request(RPCCommands.SEND_ACTIVITY_JOIN_INVITE, {
            user_id: user.id || user,
        });
    };

    sendJoinRequest(user: any): Promise<any> {
        return this.request(RPCCommands.SEND_ACTIVITY_JOIN_REQUEST, {
            user_id: user.id || user,
        });
    };

    closeJoinRequest(user: any): Promise<any> {
        return this.request(RPCCommands.CLOSE_ACTIVITY_JOIN_REQUEST, {
            user_id: user.id || user,
        });
    };

    createLobby(type: any, capacity: any, metadata: any): Promise<any> {
        return this.request(RPCCommands.CREATE_LOBBY, {
            type,
            capacity,
            metadata,
        });
    };

    updateLobby(lobby: any, { type, owner, capacity, metadata }: any = {}): Promise<any> {
        return this.request(RPCCommands.UPDATE_LOBBY, {
            id: lobby.id || lobby,
            type,
            owner_id: (owner && owner.id) || owner,
            capacity,
            metadata,
        });
    };

    deleteLobby(lobby: any): Promise<any> {
        return this.request(RPCCommands.DELETE_LOBBY, {
            id: lobby.id || lobby,
        });
    };

    connectToLobby(id: any, secret: any): Promise<any> {
        return this.request(RPCCommands.CONNECT_TO_LOBBY, {
            id,
            secret,
        });
    };

    sendToLobby(lobby: any, data: any): Promise<any> {
        return this.request(RPCCommands.SEND_TO_LOBBY, {
            id: lobby.id || lobby,
            data,
        });
    }

    disconnectFromLobby(lobby: any): Promise<any> {
        return this.request(RPCCommands.DISCONNECT_FROM_LOBBY, {
            id: lobby.id || lobby,
        });
    };

    updateLobbyMember(lobby: any, user: any, metadata: any): Promise<any> {
        return this.request(RPCCommands.UPDATE_LOBBY_MEMBER, {
            lobby_id: lobby.id || lobby,
            user_id: user.id || user,
            metadata,
        });
    };

    getRelationships(): Promise<any> {
        const types = Object.keys(RelationshipTypes);
        return this.request(RPCCommands.GET_RELATIONSHIPS, {})
            .then((o: any) => o.relationships.map((r: any) => ({
                ...r,
                type: types[r.type],
            })));
    };

    async subscribe(event: string, args?: any): Promise<any> {
        await this.request(RPCCommands.SUBSCRIBE, args, event);
        return {
            unsubscribe: () => this.request(RPCCommands.UNSUBSCRIBE, args, event),
        };
    };

    async destroy(): Promise<any> {
        await this.transport.close();
    };
};

// =================================================================

export {
    RpcClient,
};

// =================================================================