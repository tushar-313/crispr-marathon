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
        TELEGRAM_ALERTS_ENABLED: 'true',
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
        TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '',
        TELEGRAM_BOT_COMMANDS: 'true',
      },
      max_memory_restart: '300M',
      autorestart: true,
      watch: false,
      time: true,
    },
  ],
};
