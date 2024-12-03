/**
 * @author brokenedtzjs
 * @license Apache-2.0
 * @copyright brokenedtzjs
 * @file index.js
 */

'use strict';

const util = require('./functions/util');

// Client classes
exports.RpcClient = require('./functions/client');

// Errors
exports.AfkError = require('./error/errorBase').AfkError;
exports.AfkTypeError = require('./error/errorBase').AfkTypeError;
exports.errorCode = require('./error/errorCode');

// Rpc Register
exports.register(id) = util.register(`discord-${id}`);

// discord-rpc versions
exports.versions = `${require("../package.json").version}`;