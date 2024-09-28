/**
 * @author brokenedtzjs
 * @license Apache-2.0
 * @copyright brokenedtzjs
 * @file index.js
 */

'use strict';

// =================================================================

class RpcError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.body = undefined;
        this.data = undefined;
        this.code = undefined;
    };
};

Object.defineProperty(RpcError.prototype, 'name', {
    value: 'RpcError',
});

// =================================================================

class RpcRangeError extends RangeError { };

Object.defineProperty(RpcRangeError.prototype, 'name', {
    value: 'RpcRangeError',
});

// =================================================================

class RpcTimeout extends RpcError { };

Object.defineProperty(RpcTimeout.prototype, 'name', {
    value: 'RpcTimeout',
});

// =================================================================

class RpcTypeError extends TypeError { };

Object.defineProperty(RpcTypeError.prototype, 'name', {
    value: 'RpcTypeError',
});

// =================================================================

class RpcSocketError extends Error { };

Object.defineProperty(RpcSocketError.prototype, 'name', {
    value: 'RpcSocketError',
});

// =================================================================

class RpcTransportError extends Error { };

Object.defineProperty(RpcTransportError.prototype, 'name', {
    value: 'RpcTransportError',
});

// =================================================================

module.exports = {
    RpcError,
    RpcRangeError,
    RpcTimeout,
    RpcTypeError,
    RpcSocketError,
    RpcTransportError,
};

// =================================================================