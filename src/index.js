/**
 * @author brokenedtzjs
 * @license Apache-2.0
 * @copyright brokenedtzjs
 * @file index.js
 */

'use strict';

// =================================================================

const util = require('./functions/util');

module.exports = {
  RpcClient: require('./functions/client'),
  register(id) {
    return util.register(`discord-${id}`);
  },
};

// =================================================================