'use strict';

// Import module
const { RpcClient } = require('dc-rpc');

// Spy on console.log before test
beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { });
});

// Reset all mock after test
afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
});

// Test code
describe('Discord RPC Tests', () => {
    test('Test IPC RPC', async () => {
        const Id = '1314548864682037259';
        const client = new RpcClient({ transport: 'ipc' });

        await client.login({ clientId: Id });

        client.on('ready', () => {
            console.log('Logged in as', client.application);
            console.log('Authed for user', client.user);

            client.setActivity({ state: 'it work!!!', details: 'Testing Strivo RPC', startTimestamp: Date.now() });
        });

        await new Promise(resolve => setTimeout(resolve, 3000));

        client.destroy();
    })
});