'use strict';

/*!
 * ignore
 */

class RpcRangeError extends RangeError { }

Object.defineProperty(RpcRangeError.prototype, 'name', {
  value: 'RpcRangeError'
});

module.exports = RpcRangeError;