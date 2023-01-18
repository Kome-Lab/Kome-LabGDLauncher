module.exports = {
  new: [],
  improvements: [
    {
      header:
        'Move nsfw to dependencies, remove napi & murmur2 binaries. (gorilla-devs#1446)',
      content: '',
      advanced: { cm: '20148d6' }
    },
    {
      header: 'Updated base URL for fetching news images (gorilla-devs#1443)',
      content: '',
      advanced: { cm: 'efa324a' }
    },
    {
      header: 'Allow for Local ARM64 Linux Building (gorilla-devs#1451)',
      content: '',
      advanced: { cm: '4fd9a47' }
    },
    {
      header:
        'Fix java arch being inconsistent with the manifest (gorilla-devs#1515)',
      content: '',
      advanced: { cm: '2f20cd9' }
    }
  ],
  bugfixes: [
    {
      header:
        'Update microsoft URI from HTTP to HTTPS - gorilla-devs#1513 (gorilla-devs#1514)',
      content: '',
      advanced: { cm: '73b3f48' }
    }
  ]
};
