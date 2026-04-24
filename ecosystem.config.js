module.exports = {
  apps: [
    {
      name: 'Familj Admin',
      script: 'dist/main.js', // or use 'npm' with args: 'run start:prod'
      instances: 'max', // use cluster mode across CPU cores
      exec_mode: 'cluster',
      watch: false, // set true only for dev
      env: {
        NODE_ENV: 'development',
        PORT: 5173,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5173,
      },
    },
  ],
};
