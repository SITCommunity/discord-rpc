'use strict';

/*!
 * ignore
 */

class RpcTypeError extends TypeError { }

Object.defineProperty(RpcTypeError.prototype, 'name', {
  value: 'RpcTypeError'
});

module.exports = RpcTypeError;