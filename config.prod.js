// 生产环境配置文件
// 部署时请根据实际情况修改这些配置

window.DASHBOARD_CONFIG = {
    // 后端API地址（必须修改）
    apiBaseUrl: 'https://stoma.ht-healthcare.com/api',
    
    // 数据刷新间隔（毫秒）
    refreshInterval: 30000,  // 30秒
    
    // 是否启用调试模式
    debug: false,
    
    // 自动登录配置（用于大屏自动登录，无需用户手动输入）
    autoLogin: {
        username: 'admin',    // 自动登录用户名（请根据实际情况修改）
        password: 'admin',    // 自动登录密码（请根据实际情况修改）
        userType: 'nurse'     // 用户类型：'nurse'（护士）或 'patient'（患者）
    }
};

// 如果需要在生产环境中打印配置信息（可选）
if (window.DASHBOARD_CONFIG.debug) {
    console.log('Dashboard Configuration:', window.DASHBOARD_CONFIG);
}

