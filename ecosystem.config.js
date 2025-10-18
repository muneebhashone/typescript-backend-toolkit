module.exports = {
  apps: [
    {
      name: 'typescript-backend-toolkit',
      script: './dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_file: '.env.production',
      env: {
        NODE_ENV: 'production',
      },
      watch: false,
      autorestart: true,
      max_memory_restart: '512M',
      exp_backoff_restart_delay: 100,
      merge_logs: true,
      time: true,
      kill_timeout: 30000,
      instance_var: 'INSTANCE_ID',
      node_args: ['--enable-source-maps'],
    },
  ],
};
