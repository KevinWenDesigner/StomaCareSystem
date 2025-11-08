// 开发环境配置文件
// 本地开发时使用此配置

window.DASHBOARD_CONFIG = {
    // 后端API地址（本地开发）
    apiBaseUrl: 'http://localhost:3000/api',
    
    // 数据刷新间隔（毫秒）
    refreshInterval: 30000,  // 30秒
    
    // 是否启用调试模式
    debug: true,
    
    // 自动登录配置（用于大屏自动登录，无需用户手动输入）
    autoLogin: {
        username: 'N001',     // 自动登录用户名（工号如 N001 或手机号如 13800138000，请根据实际情况修改）
        password: '123456',   // 自动登录密码（测试模式下任意密码均可，请根据实际情况修改）
        userType: 'nurse'     // 用户类型：'nurse'（护士）或 'patient'（患者）
    }
};

// 调试模式下打印配置信息
if (window.DASHBOARD_CONFIG.debug) {
    console.log('Dashboard Configuration (DEV):', window.DASHBOARD_CONFIG);
}

