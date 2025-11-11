/**
 * Server-Sent Events (SSE) 服务
 * 用于实现服务器向客户端的实时推送
 * 
 * 优势：
 * - 基于 HTTP，不需要特殊的代理配置
 * - 浏览器原生支持，自动重连
 * - 配置简单，稳定性高
 * - 适合服务器向客户端单向推送场景
 */

class SSEService {
    constructor() {
        this.clients = new Map(); // 存储已连接的客户端 { clientId: { res, userId, userType } }
    }

    /**
     * 初始化 SSE 服务
     * 注意：SSE 路由现在在 routes/index.js 中注册，这个方法保留用于兼容性
     * @param {Object} app - Express 应用实例（可选，已不再使用）
     */
    initialize(app) {
        // SSE 路由现在在 routes/index.js 中注册
        // 这个方法保留用于兼容性，但不再需要注册路由
        // 路由注册在 backend/src/routes/index.js 中：
        // router.get('/sse', (req, res) => { sseService.handleConnection(req, res); });
    }

    /**
     * 处理新的 SSE 连接
     */
    handleConnection(req, res) {
        const clientId = this.generateClientId();
        console.log(`📡 新的 SSE 连接: ${clientId}`);

        // 解析 URL 参数获取 token
        const token = req.query.token;

        let userId = null;
        let userType = null;

        // 验证 token（可选）
        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                userId = decoded.id;
                userType = decoded.userType;
                console.log(`🔐 客户端已认证: userId=${userId}, userType=${userType}`);
            } catch (error) {
                console.warn('⚠️ Token 验证失败:', error.message);
            }
        }

        // 设置 SSE 响应头
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // 禁用 Nginx 缓冲
        
        // CORS 头（如果需要）
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

        // 存储客户端信息
        this.clients.set(clientId, {
            res,
            userId,
            userType,
            connectedAt: new Date()
        });

        // 发送连接成功消息
        this.sendToClient(clientId, {
            type: 'connection',
            message: '已连接到 SSE 服务器',
            clientId,
            timestamp: new Date().toISOString()
        });

        // 监听客户端断开
        req.on('close', () => {
            console.log(`❌ SSE 断开: ${clientId}`);
            this.clients.delete(clientId);
            res.end();
        });

        req.on('aborted', () => {
            console.log(`❌ SSE 连接中断: ${clientId}`);
            this.clients.delete(clientId);
            res.end();
        });

        // 保持连接活跃（发送心跳）
        const heartbeatInterval = setInterval(() => {
            if (this.clients.has(clientId)) {
                try {
                    res.write(': heartbeat\n\n');
                } catch (error) {
                    console.error(`❌ SSE 心跳发送失败 (${clientId}):`, error.message);
                    clearInterval(heartbeatInterval);
                    this.clients.delete(clientId);
                    res.end();
                }
            } else {
                clearInterval(heartbeatInterval);
            }
        }, 30000); // 每 30 秒发送一次心跳

        // 存储心跳定时器，以便清理
        const client = this.clients.get(clientId);
        if (client) {
            client.heartbeatInterval = heartbeatInterval;
        }
    }

    /**
     * 发送消息给指定客户端
     */
    sendToClient(clientId, data) {
        const client = this.clients.get(clientId);
        if (client && client.res && !client.res.destroyed) {
            try {
                const message = `data: ${JSON.stringify(data)}\n\n`;
                client.res.write(message);
            } catch (error) {
                console.error(`❌ SSE 消息发送失败 (${clientId}):`, error.message);
                this.clients.delete(clientId);
                if (client.heartbeatInterval) {
                    clearInterval(client.heartbeatInterval);
                }
            }
        }
    }

    /**
     * 广播消息给所有客户端
     */
    broadcast(data) {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        let sentCount = 0;
        const disconnectedClients = [];

        this.clients.forEach((client, clientId) => {
            if (client.res && !client.res.destroyed) {
                try {
                    client.res.write(message);
                    sentCount++;
                } catch (error) {
                    console.error(`❌ SSE 广播失败 (${clientId}):`, error.message);
                    disconnectedClients.push(clientId);
                }
            } else {
                disconnectedClients.push(clientId);
            }
        });

        // 清理断开的客户端
        disconnectedClients.forEach(clientId => {
            const client = this.clients.get(clientId);
            if (client && client.heartbeatInterval) {
                clearInterval(client.heartbeatInterval);
            }
            this.clients.delete(clientId);
        });

        console.log(`📢 SSE 广播消息: ${data.type} (发送给 ${sentCount} 个客户端)`);
    }

    /**
     * 推送 Dashboard 数据更新
     */
    pushDashboardUpdate(updateType, data) {
        this.broadcast({
            type: 'dashboard_update',
            updateType, // 'stats' | 'assessment' | 'patient' | 'diary'
            data,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 推送新评估通知
     */
    pushNewAssessment(assessment) {
        this.broadcast({
            type: 'new_assessment',
            data: assessment,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 推送高危患者警报
     */
    pushHighRiskAlert(patient) {
        this.broadcast({
            type: 'high_risk_alert',
            data: patient,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 生成客户端 ID
     */
    generateClientId() {
        return `sse_client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 获取连接统计
     */
    getStats() {
        return {
            totalConnections: this.clients.size,
            clients: Array.from(this.clients.values()).map(client => ({
                userId: client.userId,
                userType: client.userType,
                connectedAt: client.connectedAt
            }))
        };
    }

    /**
     * 关闭所有连接
     */
    closeAll() {
        this.clients.forEach((client, clientId) => {
            if (client.res && !client.res.destroyed) {
                client.res.end();
            }
            if (client.heartbeatInterval) {
                clearInterval(client.heartbeatInterval);
            }
        });
        this.clients.clear();
        console.log('✅ 所有 SSE 连接已关闭');
    }
}

// 导出单例
module.exports = new SSEService();

