const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketService {
    constructor() {
        this.wss = null;
        this.clients = new Map(); // 存储已连接的客户端 { clientId: { ws, userId, userType } }
    }

    /**
     * 初始化 WebSocket 服务
     * @param {Object} server - HTTP 服务器实例
     */
    initialize(server) {
        this.wss = new WebSocket.Server({ 
            server,
            path: '/ws' // WebSocket 路径: ws://localhost:3000/ws
        });

        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });

        console.log('✅ WebSocket 服务已启动 (路径: /ws)');
    }

    /**
     * 处理新的 WebSocket 连接
     */
    handleConnection(ws, req) {
        const clientId = this.generateClientId();
        console.log(`📡 新的 WebSocket 连接: ${clientId}`);

        // 解析 URL 参数获取 token
        const url = new URL(req.url, `http://${req.headers.host}`);
        const token = url.searchParams.get('token');

        let userId = null;
        let userType = null;

        // 验证 token（可选，如果需要身份验证）
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                userId = decoded.id;
                userType = decoded.userType;
                console.log(`🔐 客户端已认证: userId=${userId}, userType=${userType}`);
            } catch (error) {
                console.warn('⚠️ Token 验证失败:', error.message);
            }
        }

        // 存储客户端信息
        this.clients.set(clientId, {
            ws,
            userId,
            userType,
            connectedAt: new Date()
        });

        // 发送欢迎消息
        this.sendToClient(clientId, {
            type: 'connection',
            message: '已连接到 WebSocket 服务器',
            clientId,
            timestamp: new Date().toISOString()
        });

        // 监听消息
        ws.on('message', (data) => {
            this.handleMessage(clientId, data);
        });

        // 监听关闭
        ws.on('close', () => {
            console.log(`❌ WebSocket 断开: ${clientId}`);
            this.clients.delete(clientId);
        });

        // 监听错误
        ws.on('error', (error) => {
            console.error(`❌ WebSocket 错误 (${clientId}):`, error.message);
        });

        // 心跳检测
        ws.isAlive = true;
        ws.on('pong', () => {
            ws.isAlive = true;
        });
    }

    /**
     * 处理客户端消息
     */
    handleMessage(clientId, data) {
        try {
            const message = JSON.parse(data.toString());
            console.log(`📨 收到消息 (${clientId}):`, message.type);

            // 响应 ping
            if (message.type === 'ping') {
                this.sendToClient(clientId, {
                    type: 'pong',
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('消息解析失败:', error.message);
        }
    }

    /**
     * 发送消息给指定客户端
     */
    sendToClient(clientId, data) {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(data));
        }
    }

    /**
     * 广播消息给所有客户端
     */
    broadcast(data) {
        const message = JSON.stringify(data);
        let sentCount = 0;

        this.clients.forEach((client, clientId) => {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(message);
                sentCount++;
            }
        });

        console.log(`📢 广播消息: ${data.type} (发送给 ${sentCount} 个客户端)`);
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
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 启动心跳检测
     */
    startHeartbeat() {
        setInterval(() => {
            this.clients.forEach((client, clientId) => {
                if (client.ws.isAlive === false) {
                    console.log(`💔 心跳超时，断开客户端: ${clientId}`);
                    client.ws.terminate();
                    this.clients.delete(clientId);
                    return;
                }

                client.ws.isAlive = false;
                client.ws.ping();
            });
        }, 30000); // 每 30 秒检测一次
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
}

// 导出单例
module.exports = new WebSocketService();
