'use strict';

import util from './util';

export const Client = require('./client').default;
export function register(id) {
    return util.register(`discord-${id}`);
}