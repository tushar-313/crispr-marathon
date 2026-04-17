module.exports = {
  apps: [
    {
      name: 'crispr-marathon',
      script: 'dashboard.js',
      cwd: '/var/www/crispr-marathon',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
      },
      max_memory_restart: '300M',
      autorestart: true,
      watch: false,
      time: true,
    },
  ],
};
