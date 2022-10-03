module.exports = {
  new: [],
  improvements: [
    {
      header: '1.1.29-komelab-beta.1',
      content: '日本語の修正及び軽微な修正',
      advanced: { cm: '4290df4' }
    }
  ],
  bugfixes: [
    {
      header: '1.1.29-komelab-beta.1',
      content: 'fix code',
      advanced: { cm: '074a1b7' }
    },
    {
      header: 'No longer killing the game',
      content: 'when closing the Launcher.',
      advanced: { cm: '391dd9cc', pr: '1412' }
    },
    {
      header: 'Fixed the game resolution setting',
      content: 'being ignored.',
      advanced: { cm: '87f89ed9', pr: '1429' }
    },
    {
      header: 'Fixed the kill button',
      content: 'having to be clicked twice.',
      advanced: { cm: '2664f8bb', pr: '1419' }
    },
    {
      header: 'Fixed error code one ',
      content: 'when certain java args are missing.',
      advanced: { cm: 'cdae501a', pr: '1420' }
    },
    {
      header: 'Fixed settings resetting',
      content: 'caused by the CurseForge workaround.',
      advanced: { cm: '7f29ca64', pr: '1431' }
    }
  ]
};
