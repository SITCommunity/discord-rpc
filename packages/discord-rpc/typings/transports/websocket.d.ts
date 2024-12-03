import { EventEmitter } from 'events';

declare namespace WebSocketTransportNamespace {
    interface WebSocketEvent {
        wasClean?: boolean;
        error?: Error;
        data?: string;
    }

    interface ClientOptions {
        origin?: string;
    }

    interface Client {
        clientId: string;
        options: ClientOptions;
    }

    type PackFunction = (data: unknown) => string;
    type UnpackFunction = (data: string) => unknown;
}

export declare class WebSocketTransport extends EventEmitter {
    client: WebSocketTransportNamespace.Client;
    ws: WebSocket | null;
    tries: number;

    constructor(client: WebSocketTransportNamespace.Client);

    connect(): Promise<void>;
    onOpen(): void;
    onClose(event: WebSocketTransportNamespace.WebSocketEvent): void;
    onError(event: WebSocketTransportNamespace.WebSocketEvent): void;
    onMessage(event: WebSocketTransportNamespace.WebSocketEvent): void;
    send(data: unknown): void;
    ping(): void;
    close(): Promise<void>;
}

declare const pack: WebSocketTransportNamespace.PackFunction;
declare const unpack: WebSocketTransportNamespace.UnpackFunction;

export { pack, unpack };
