// 开发环境配置文件
// 本地开发时使用此配置

window.DASHBOARD_CONFIG = {
    // 后端API地址（本地开发）
    apiBaseUrl: 'http://localhost:3000/api',
    
    // 数据刷新间隔（毫秒）
    refreshInterval: 30000,  // 30秒
    
    // 是否启用调试模式
    debug: true
};

// 调试模式下打印配置信息
if (window.DASHBOARD_CONFIG.debug) {
    console.log('Dashboard Configuration (DEV):', window.DASHBOARD_CONFIG);
}

