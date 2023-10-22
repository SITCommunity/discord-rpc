'use strict';

const RpcError = require("./RpcError");

/*!
 * ignore
 */

class RpcTimeout extends RpcError { }

Object.defineProperty(RpcTimeout.prototype, 'name', {
  value: 'RpcTimeout'
});

module.exports = RpcTimeout;