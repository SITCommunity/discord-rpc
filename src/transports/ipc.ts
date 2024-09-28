// =================================================================

import net from 'net';
import EventEmitter from 'events';
import fetch from 'node-fetch';
import { uuid } from '../functions/util';
import { RpcError, RpcSocketError } from '../../lib/error';

// =================================================================

interface OPCode {
    [key: string]: number;
};

// =================================================================

const OPCodes: OPCode = {
    HANDSHAKE: 0,
    FRAME: 1,
    CLOSE: 2,
    PING: 3,
    PONG: 4,
};

// =================================================================

async function fetchData(url: string, opts: any = {}): Promise<any> {
    const response = await fetch(url, opts);
    const data = await response.json();
    return data;
}

function getIPCPath(id: number) {
    if (process.platform === 'win32') {
        return `\\\\?\\pipe\\discord-ipc-${id}`;
    };
    const { env: { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP } } = process;
    const prefix = XDG_RUNTIME_DIR || TMPDIR || TMP || TEMP || '/tmp';
    return `${prefix.replace(/\/$/, '')}/discord-ipc-${id}`;
};

function getIPC(id: number = 0) {
    return new Promise((resolve, reject) => {
        const path = getIPCPath(id);
        const onerror = () => {
            if (id < 10) {
                resolve(getIPC(id + 1));
            } else {
                reject(new RpcError('Could not connect'));
            };
        };
        const sock = net.createConnection(path, () => {
            sock.removeListener('error', onerror);
            resolve(sock);
        });
        sock.once('error', onerror);
    });
};

async function findEndpoint(tries: number = 0) {
    if (tries > 30) {
        throw new RpcError('Could not find endpoint');
    };
    const endpoint = `http://127.0.0.1:${6463 + (tries % 10)}`;
    try {
        const r = await fetchData(endpoint);
        if (r.status === 404) {
            return endpoint;
        };
        return findEndpoint(tries + 1);
    } catch (e) {
        return findEndpoint(tries + 1);
    };
};

export function encode(op: number, data: string): Buffer {
    data = JSON.stringify(data);
    const len = Buffer.byteLength(data);
    const packet = Buffer.alloc(8 + len);
    packet.writeInt32LE(op, 0);
    packet.writeInt32LE(len, 4);
    packet.write(data, 8, len);
    return packet;
};

const working = {
    full: '',
    op: undefined,
};

async function decode(socket: any, callback: any) {
    const packet = await socket.read();
    if (!packet) {
        return;
    };

    let { op } = working;
    let raw: any;
    if (working.full === '') {
        op = working.op = packet.readInt32LE(0);
        const len = packet.readInt32LE(4);
        raw = packet.slice(8, len + 8);
    } else {
        raw = packet.toString();
    };

    try {
        const data = JSON.parse(working.full + raw);
        callback({ op, data }); // eslint-disable-line callback-return
        working.full = '';
        working.op = undefined;
    } catch (err) {
        working.full += raw;
    };

    decode(socket, callback);
};

class IPCTransport extends EventEmitter {
    client: any;
    socket: any;
    constructor(client: any) {
        super();
        this.client = client;
        this.socket = null;
    };

    async connect() {
        const socket = this.socket = await getIPC();
        if (socket instanceof net.Socket) {
            socket.on('close', this.onClose.bind(this));
            socket.on('error', this.onClose.bind(this));
            this.emit('open');
            socket.write(encode(OPCodes.HANDSHAKE, JSON.stringify({
                v: 1,
                client_id: this.client.clientId,
            })));
            socket.pause();
            socket.on('readable', () => {
                decode(socket, ({ op, data }) => {
                    switch (op) {
                        case OPCodes.PING:
                            this.send(data, OPCodes.PONG);
                            break;
                        case OPCodes.FRAME:
                            if (!data) {
                                return;
                            };
                            if (data.cmd === 'AUTHORIZE' && data.evt !== 'ERROR') {
                                findEndpoint()
                                    .then((endpoint) => {
                                        this.client.request.endpoint = endpoint;
                                    }).catch((e) => {
                                        this.client.emit('error', e);
                                    });
                            };
                            this.emit('message', data);
                            break;
                        case OPCodes.CLOSE:
                            this.emit('close', data);
                            break;
                        default:
                            break;
                    };
                });
            });
        } else {
            throw new RpcSocketError('Socket is not an instance of net.Socket');
        };
    };

    onClose(e: any) {
        this.emit('close', e);
    };

    send<T extends string>(data: T, op: number = OPCodes.FRAME) {
        this.socket.write(encode(op, data));
    };

    async close() {
        return new Promise((r) => {
            this.once('close', r);
            this.send('', OPCodes.CLOSE);
            this.socket.end();
        });
    };

    ping() {
        this.send(uuid(), OPCodes.PING);
    };
};

// =================================================================

export {
    IPCTransport
};

// =================================================================