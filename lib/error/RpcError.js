'use strict';

/*!
 * ignore
 */

class RpcError extends Error { }

Object.defineProperty(RpcError.prototype, 'name', {
  value: 'RpcError'
});

module.exports = RpcError;