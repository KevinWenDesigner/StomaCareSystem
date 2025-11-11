// 开发环境配置文件
// 本地开发时使用此配置

window.DASHBOARD_CONFIG = {
    // 后端API地址（本地开发）
    apiBaseUrl: 'http://localhost:3000/api',
    
    // WebSocket 地址（用于实时推送）
    // 开发环境使用 ws:// (非加密)
    websocketUrl: 'ws://localhost:3000/ws',
    
    // 数据刷新间隔（毫秒）- WebSocket 模式下此值仅用于兜底
    refreshInterval: 60000,  // 60秒（WebSocket 断开时的兜底轮询）
    
    // 是否启用 WebSocket 实时推送
    enableWebSocket: true,
    
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

