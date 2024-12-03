/**
 * @author brokenedtzjs
 * @license MIT
 * @copyright brokenedtzjs
 * @file errorBase.js
 */

'use strict';

/**
 * @typedef {Object} ErrorCode
 * 
 * @property {'RpcTimeout'} RpcTimeout
 * @property {'RpcSocketError'} RpcSocketError
 * @property {'RpcTransportError'} RpcTransportError
 * @property {'InvalidTransport'} InvalidTransport
 * @property {'FetchError'} FetchError
 * @property {'ConnectionError'} ConnectionError
 * @property {'MessageError'} MessageError
 * @property {'TimestampError'} TimestampError
 * @property {'ConnectionFailed'} ConnectionFailed
 * @property {'MissingEndpoint'} MissingEndpoint
 * @property {'FailLoadProtocol'} FailLoadProtocol
 * @property {'WsError'} WsError
 */

const keys = [
    'RpcTimeout',
    'SocketError',
    'TransportError',
    'InvalidTransport',
    'FetchError',
    'ConnectionError',
    'MessageError',
    'TimestampError',
    'ConnectionFailed',
    'MissingEndpoint',
    'FailLoadProtocol',
    'WsError',
];

/**
 * @type {DiscordRpcError}
 */
module.exports = Object.fromEntries(keys.map((key) => [key, key]));
