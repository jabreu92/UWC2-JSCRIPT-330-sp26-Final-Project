module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: '8.2.1',
      skipMD5: true,
    },
    autoStart: true,
    instance: {
      dbName: 'jest',
    },
  },
};
