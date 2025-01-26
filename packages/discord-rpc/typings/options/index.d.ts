export class RpcLoginOptions extends Object {
    /**
     * @param {string} clientId Client ID
     */
    clientId: string;
    /**
     * @param {string} clientSecret Client secret
     */
    clientSecret: string;
    /**
     * @param {string} accessToken Access token
     */
    accessToken: string;
    /**
     * @param {string} rpcToken RPC token
     */
    rpcToken: string;
    /**
     * @param {string} tokenEndpoint Token endpoint
     */
    tokenEndpoint: string;
    /**
     * @param {string[]} scopes Scopes to authorize with
     */
    scopes: string[];

    constructor(clientId: string, clientSecret: string, accessToken: string, rpcToken: string, tokenEndpoint: string, scopes: string[]);
}