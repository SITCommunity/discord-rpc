import { EventEmitter } from 'events';
import { Socket } from 'net';

declare namespace IPC {
    enum OPCodes {
        HANDSHAKE = 0,
        FRAME = 1,
        CLOSE = 2,
        PING = 3,
        PONG = 4,
    }

    interface RPCData {
        [key: string]: any;
    }

    interface DecodeCallback {
        op: OPCodes;
        data: RPCData;
    }

    function getIPCPath(id: number): string;
    function getIPC(id?: number): Promise<Socket>;
    function findEndpoint(tries?: number): Promise<string>;
    function encode(op: OPCodes, data: RPCData): Buffer;
    function decode(socket: Socket, callback: (data: DecodeCallback) => void): void;
}

export declare class IPCTransport extends EventEmitter {
    client: { clientId: string; request: { endpoint?: string } };
    socket: Socket | null;

    constructor(client: { clientId: string });

    connect(): Promise<void>;
    onClose(e: any): void;
    send(data: IPC.RPCData, op?: IPC.OPCodes): void;
    close(): Promise<void>;
    ping(): void;
}

export const encode: typeof IPC.encode;
export const decode: typeof IPC.decode;
