/**
 * @author brokenedtzjs
 * @license Apache-2.0
 * @copyright brokenedtzjs
 * @file index.js
 */

'use strict';

// =================================================================

import * as util from './functions/util';
import { RpcClient } from './functions/client';

export const register = (id: string): string => {
    return util.register(`discord-${id}`);
};

export { RpcClient };

// =================================================================