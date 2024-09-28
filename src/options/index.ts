// =================================================================

class RpcClientOptions {
    transport?: 'ipc' | 'websocket';
    constructor(transport: 'ipc' | 'websocket') {
        /**
         * @param {string} transport
         * RPC transport. one of `ipc` or `websocket`
         * You must provide a transport
         */
        this.transport = transport;
    };
};

// =================================================================

class RpcLoginOptions {
    clientId: string;
    clientSecret: string;
    accessToken: string;
    rpcToken: string;
    tokenEndpoint: string;
    scopes: string[];

    constructor(clientId: string, clientSecret: string, accessToken: string, rpcToken: string, tokenEndpoint: string, scopes: string[]) {
        /**
         * @param {string} clientId Client ID
         */
        this.clientId = clientId;
        /**
         * @param {string} clientSecret Client secret
         */
        this.clientSecret = clientSecret;
        /**
         * @param {string} accessToken Access token
         */
        this.accessToken = accessToken;
        /**
         * @param {string} rpcToken RPC token
         */
        this.rpcToken = rpcToken;
        /**
         * @param {string} tokenEndpoint Token endpoint
         */
        this.tokenEndpoint = tokenEndpoint;
        /**
         * @param {string[]} scopes Scopes to authorize with
         */
        this.scopes = scopes;
    }
}

// =================================================================

export {
    RpcClientOptions,
    RpcLoginOptions
};

// =================================================================