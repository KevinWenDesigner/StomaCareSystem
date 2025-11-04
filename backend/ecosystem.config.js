/**
 * PM2 配置文件
 * 
 * 使用方法：
 *   启动: pm2 start ecosystem.config.js
 *   重启: pm2 restart ecosystem.config.js
 *   停止: pm2 stop ecosystem.config.js
 *   删除: pm2 delete ecosystem.config.js
 */

module.exports = {
  apps: [
    {
      // 应用名称
      name: 'stoma-care-backend',
      
      // 入口文件
      script: './src/server.js',
      
      // 实例数量（集群模式）
      // 0 或 'max' = CPU核心数
      // 正数 = 指定实例数
      instances: 2,
      
      // 执行模式
      // 'cluster' = 集群模式（多进程，负载均衡）
      // 'fork' = 单进程模式
      exec_mode: 'cluster',
      
      // 环境变量
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      
      // 生产环境变量
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // 日志配置
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      
      // 自动重启配置
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // 监听文件变化（生产环境建议设为 false）
      watch: false,
      ignore_watch: [
        'node_modules',
        'logs',
        'uploads',
        '.git'
      ],
      
      // 内存限制（超过后自动重启）
      max_memory_restart: '1G',
      
      // 优雅关闭
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Cron 重启（可选，每天凌晨4点重启）
      // cron_restart: '0 4 * * *',
      
      // 其他配置
      instance_var: 'INSTANCE_ID',
      
      // 源码映射支持（开发环境）
      source_map_support: true,
      
      // 进程间通信
      // pmx: true,
      
      // 日志时间戳
      time: true
    }
  ],
  
  /**
   * 部署配置（可选）
   * 
   * 使用方法：
   *   pm2 deploy ecosystem.config.js production setup
   *   pm2 deploy ecosystem.config.js production update
   */
  deploy: {
    // 生产环境
    production: {
      // SSH 用户
      user: 'deploy',
      
      // 服务器地址
      host: 'your_server_ip',
      
      // SSH 端口
      // port: 22,
      
      // SSH 密钥路径
      // key: '~/.ssh/id_rsa',
      
      // Git 仓库
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/StomaCareSystem.git',
      
      // 服务器上的部署路径
      path: '/home/deploy/backend',
      
      // 部署前执行的命令（在服务器上）
      'pre-deploy': 'git fetch --all',
      
      // 部署后执行的命令
      'post-deploy': 'npm install --production && pm2 reload ecosystem.config.js --env production',
      
      // 部署前执行的本地命令
      'pre-setup': 'echo "准备部署..."',
      
      // SSH 选项
      'ssh_options': ['StrictHostKeyChecking=no', 'PasswordAuthentication=no']
    },
    
    // 开发环境
    development: {
      user: 'deploy',
      host: 'dev_server_ip',
      ref: 'origin/develop',
      repo: 'git@github.com:yourusername/StomaCareSystem.git',
      path: '/home/deploy/backend-dev',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env development'
    }
  }
};


