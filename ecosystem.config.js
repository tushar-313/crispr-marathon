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
        TELEGRAM_BOT_TOKEN: '8640385784:AAEAU3uzEA8afeLPTJATnEVLHyjcs8oembg',
        TELEGRAM_CHAT_ID: '6232421617',
        TELEGRAM_BOT_COMMANDS: 'true',
      },
      max_memory_restart: '300M',
      autorestart: true,
      watch: false,
      time: true,
    },
  ],
};
