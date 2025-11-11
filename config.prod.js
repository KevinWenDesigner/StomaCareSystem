// 生产环境配置文件
// 部署时请根据实际情况修改这些配置

window.DASHBOARD_CONFIG = {
    // 后端API地址（必须修改）
    apiBaseUrl: 'https://stoma.ht-healthcare.com/api',
    
    // SSE 地址（Server-Sent Events，用于实时推送）
    sseUrl: 'https://stoma.ht-healthcare.com/api/sse',
    
    // 数据刷新间隔（毫秒）- 推送断开时的兜底轮询
    refreshInterval: 60000,  // 60秒（推送断开时的兜底轮询）
    
    // 推送方式选择：'sse' | 'polling'
    // 'sse' - Server-Sent Events（推荐，基于 HTTP，配置简单）
    // 'polling' - 轮询（最简单，但效率较低）
    pushMethod: 'sse',
    
    // 是否启用实时推送
    enableRealtimePush: true,
    
    // 是否启用调试模式
    debug: false,
    
    // 自动登录配置（用于大屏自动登录，无需用户手动输入）
    autoLogin: {
        username: 'N001',     // 自动登录用户名（工号如 N001 或手机号如 13800138000，请根据实际情况修改）
        password: '123456',   // 自动登录密码（测试模式下任意密码均可，请根据实际情况修改）
        userType: 'nurse'     // 用户类型：'nurse'（护士）或 'patient'（患者）
    }
};

// 如果需要在生产环境中打印配置信息（可选）
if (window.DASHBOARD_CONFIG.debug) {
    console.log('Dashboard Configuration:', window.DASHBOARD_CONFIG);
}

