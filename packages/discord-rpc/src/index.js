/**
 * @author brokenedtzjs
 * @license Apache-2.0
 * @copyright brokenedtzjs
 * @file index.js
 */

'use strict';

const util = require('./functions/util');

// Rpc Register & Client classes
module.exports = {
    RpcClient: require('./functions/client'),
    register(id) {
        return util.register(`discord-${id}`);
    },
};

// Errors
exports.AfkError = require('./error/errorBase').AfkError;
exports.AfkTypeError = require('./error/errorBase').AfkTypeError;
exports.errorCode = require('./error/errorCode');

// discord-rpc versions
exports.versions = `${require("../package.json").version}`;