'use strict';

const util = require('./util').default;

module.exports = {
  Client: require('./client'),
  register(id) {
    return util.register(`discord-${id}`);
  },
};