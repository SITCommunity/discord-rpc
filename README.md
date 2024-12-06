<div align="center">
  <p>
    <a href="https://www.npmjs.com/package/dc-rpc" target="_blank" rel="noopener noreferrer"><img src="https://nodei.co/npm/dc-rpc.png?downloads=true&downloadRank=true&stars=true"></a>
  </p>
  <p>
    <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer"><img alt="node-current" src="https://img.shields.io/node/v/distube"></a>
    <a href="https://www.npmjs.com/package/dc-rpc" target="_blank" rel="noopener noreferrer"><img alt="npm" src="https://img.shields.io/npm/dt/dc-rpc"></a>
    <a href="https://www.npmjs.com/package/dc-rpc" target="_blank" rel="noopener noreferrer"><img alt="npm latest" src="https://img.shields.io/npm/v/dc-rpc/latest?color=blue&label=dc-rpc%40latest&logo=npm"></a>
    <a href="https://github.com/skick1234/SITCommunity/discord-rpc" target="_blank" rel="noopener noreferrer"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/SITCommunity/discord-rpc"></a>
    <a href="https://discord.gg/qpT2AeYZRN" target="_blank" rel="noopener noreferrer"><img alt="Discord" src="https://img.shields.io/discord/887650006977347594?label=EterNomm&logo=discord"></a>
    <a href="https://discord.cyrateam.xyz" target="_blank" rel="noopener noreferrer"><img alt="Discord" src="https://img.shields.io/discord/984857299858382908?label=SITCommunity&logo=discord"></a>
    <a href="https://github.com/SITCommunity/discord-rpc" target="_blank" rel="noopener noreferrer"><img alt="Visitor" src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2FCyraTeam%2Fdiscord-rpc&countColor=%2337d67a&style=flat"></a>
    <a href="https://github.com/SITCommunity/discord-rpc/issues" target="_blank" rel="noopener noreferrer"><img alt="Issues" src="https://img.shields.io/github/issues/SITCommunity/discord-rpc"></a>
    <a href="https://github.com/SITCommunity/discord-rpc" target="_blank" rel="noopener noreferrer"><img alt="Commit" src="https://img.shields.io/github/commit-activity/y/SITCommunity/discord-rpc?label=Commit%20Activity&logo=github"></a>
  </p>
</div>

# Discord RPC
- **[Discord-RPC] is a powerful library developed by SITCommunity that enables developers to seamlessly integrate Rich Presence functionality into Discord applications or from Client ID**

## Install
- NPM
```
npm i dc-rpc
```

## Quick example
```js
// Importing Discord-RPC
const { RpcClient } = require('dc-rpc');

// Create an instance of Discord-RPC
const client = new RpcClient({ transport: 'ipc' }); // currently websocket not supported

// ================================================================

// Your Client ID
const Id = 'Client ID';

// Login To Discord RPC
await client.login({ clientId: Id });

// ================================================================

// Logging When Client Is Ready
client.on('ready', () => {
    console.log('Logged in as', client.application); // Console: Logged in as brokenedtz
    console.log('Authed for user', client.user);
    /** Console:
     * Authed for user {
     * id: 'user_id',
     * username: 'brokenedtz',
     * discriminator: '0',
     * global_name: 'リオ',
     * avatar: 'avatar_id',
     * avatar_decoration_data: null,
     * bot: false,
     * flags: flag_id,
     * premium_type: 0
     * }
     */

    // Set Activity (Example)
    client.setActivity({ state: 'it work!!!', details: 'Testing RPC', startTimestamp: Date.now() });
});

// ================================================================

// Destroying Or Disconnecting From RPC
client.destroy();
```

Join our Discord server [here](https://discord.gg/qpT2AeYZRN)

## Licence & Copyright

```
This Project under MIT License
© 2019 - 2024 SITCommunity. All Rights Reserved
```

## Credits
- Original: [Senophyx]
- Maintainer: [brokenedtz]

[Discord-RPC]: https://www.npmjs.com/package/dc-rpc
[Senophyx]: https://github.com/Senophyx
[brokenedtz]: https://github.com/brokenedtzjs
