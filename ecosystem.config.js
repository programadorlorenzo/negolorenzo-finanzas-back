module.exports = {
  apps: [
    {
      watch: true,
      name: 'negolorenzo-finanzas-back',
      script: 'node main.js',
      ignore_watch: ['node_modules', 'dist', 'temp', 'public'],
    },
  ],
};
