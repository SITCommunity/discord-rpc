'use strict';

const util = require('./util');

module.exports = {
  RpcClient: require('./client'),
  register(id) {
    return util.register(`discord-${id}`);
  },
};