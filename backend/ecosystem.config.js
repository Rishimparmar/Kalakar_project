module.exports = {
  apps: [
    {
      name: 'kalaakar-backend',
      script: 'server.js',
      instances: 'max', // Utilizes multi-core CPUs
      exec_mode: 'fork', // Set to fork since SQLite does not support safe concurrent writes in cluster mode
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/pm2-err.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
