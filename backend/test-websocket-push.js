/**
 * 实时推送功能测试脚本（SSE）
 * 
 * 使用方法：
 * 1. 确保后端服务运行中: npm start 或 npm run dev
 * 2. 打开大屏页面: http://localhost:3000
 * 3. 运行此脚本: node test-websocket-push.js
 * 4. 观察大屏是否实时更新
 * 
 * 工作原理：
 * - 此脚本通过 HTTP API 调用服务器端测试端点来触发事件
 * - 事件在服务器进程中触发，由服务器的事件监听器处理
 * - 服务器通过 SSE (Server-Sent Events) 将更新推送给所有连接的客户端
 * 
 * 测试端点（仅开发环境）：
 * - POST /api/test/trigger-assessment-created - 触发评估创建事件
 * - POST /api/test/trigger-assessment-reviewed - 触发评估审核事件
 * - POST /api/test/trigger-high-risk-alert - 触发高危警报事件
 * - POST /api/test/trigger-dashboard-refresh - 触发 Dashboard 刷新事件
 * - GET /api/test/event-listeners - 获取事件监听器状态
 */

const http = require('http');
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

console.log('='.repeat(60));
console.log('🧪 实时推送功能测试 (SSE)');
console.log('='.repeat(60));
console.log('');

// 检查服务器是否运行
function checkServerStatus() {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:3000/api/health', (res) => {
            resolve(res.statusCode === 200);
            res.on('data', () => {});
            res.on('end', () => {});
        });
        
        req.on('error', () => {
            resolve(false);
        });
        
        req.setTimeout(2000, () => {
            req.destroy();
            resolve(false);
        });
    });
}

// 获取事件监听器状态（通过 API）
async function showListenerStatus() {
    try {
        const response = await axios.get(`${API_BASE_URL}/test/event-listeners`);
        const listeners = response.data.listeners;
        console.log('📊 服务器端事件监听器状态：');
        console.log(`   - DASHBOARD_REFRESH: ${listeners.DASHBOARD_REFRESH} 个监听器`);
        console.log(`   - ASSESSMENT_CREATED: ${listeners.ASSESSMENT_CREATED} 个监听器`);
        console.log(`   - ASSESSMENT_REVIEWED: ${listeners.ASSESSMENT_REVIEWED} 个监听器`);
        console.log(`   - HIGH_RISK_ALERT: ${listeners.HIGH_RISK_ALERT} 个监听器`);
        console.log('');
        
        if (listeners.DASHBOARD_REFRESH === 0) {
            console.log('⚠️  警告: 服务器端没有事件监听器！');
            console.log('   这通常意味着服务器启动时事件监听器注册失败。');
            console.log('');
        }
    } catch (error) {
        console.log('⚠️  无法获取监听器状态（服务器可能未运行）');
        console.log('');
    }
}

// 异步检查服务器状态
(async () => {
    console.log('🔍 检查服务器状态...');
    const serverRunning = await checkServerStatus();
    
    if (serverRunning) {
        console.log('✅ 服务器正在运行 (http://localhost:3000)');
    } else {
        console.log('❌ 服务器未运行！');
        console.log('   请先启动服务器: npm start 或 npm run dev');
        console.log('   然后重新运行此测试脚本');
        console.log('');
        console.log('⚠️  注意: 即使服务器未运行，测试脚本仍会触发事件，');
        console.log('   但不会有监听器处理这些事件，因此不会有 WebSocket 推送。');
    }
    console.log('');
    
    await showListenerStatus();
    
    console.log('⚠️  请确保：');
    console.log('  1. 后端服务已启动');
    console.log('  2. 大屏页面已打开 (http://localhost:3000)');
    console.log('  3. 浏览器控制台已打开（F12）');
    console.log('');
    console.log('开始测试...');
    console.log('');
})();

let testCount = 0;

// 测试 1: 模拟新评估创建（良好级别）
setTimeout(async () => {
    testCount++;
    console.log(`[测试 ${testCount}] 📝 模拟新评估创建（良好）`);
    const assessment = {
        id: 10001,
        patient_id: 1,
        patient_name: '测试患者-张三',
        risk_level: 'good',
        det_level: 'good',
        det_total: 3,
        assessment_date: new Date().toISOString()
    };
    console.log('   发送数据:', JSON.stringify(assessment, null, 2));
    
    try {
        const response = await axios.post(`${API_BASE_URL}/test/trigger-assessment-created`, {
            assessment
        });
        console.log('   ✅ API 调用成功:', response.data.message);
        console.log('   ✅ 事件已触发，大屏应该刷新数据');
        console.log('   💡 检查后端控制台是否有 "[Server] 新评估创建，推送通知..." 和 "📢 SSE 广播消息" 日志\n');
    } catch (error) {
        console.error('   ❌ API 调用失败:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('   请确保服务器正在运行！\n');
        } else {
            console.error('   错误详情:', error.response?.data || error.message, '\n');
        }
    }
}, 2000);

// 测试 2: 模拟高危评估（触发警报）
setTimeout(async () => {
    testCount++;
    console.log(`[测试 ${testCount}] 🚨 模拟高危评估（危重）`);
    const assessment = {
        id: 10002,
        patient_id: 2,
        patient_name: '危重患者-李四',
        risk_level: 'critical',
        det_level: 'critical',
        det_total: 13,
        assessment_date: new Date().toISOString()
    };
    console.log('   发送数据:', JSON.stringify(assessment, null, 2));
    
    try {
        const response = await axios.post(`${API_BASE_URL}/test/trigger-assessment-created`, {
            assessment
        });
        console.log('   ✅ API 调用成功:', response.data.message);
        console.log('   ✅ 事件已触发，大屏应该：');
        console.log('      1. 刷新数据');
        console.log('      2. 弹出红色警报框');
        console.log('   💡 检查后端控制台是否有 "[Server] 高危患者警报，推送通知..." 和 "📢 SSE 广播消息" 日志\n');
    } catch (error) {
        console.error('   ❌ API 调用失败:', error.message, '\n');
    }
}, 5000);

// 测试 3: 模拟护士审核
setTimeout(async () => {
    testCount++;
    console.log(`[测试 ${testCount}] 👩‍⚕️ 模拟护士审核评估`);
    const assessment = {
        id: 10003,
        patient_id: 3,
        patient_name: '患者-王五',
        risk_level: 'moderate',
        det_level: 'moderate',
        nurse_review: 'approved',
        nurse_comment: '评估准确，继续观察',
        reviewed_at: new Date().toISOString()
    };
    
    try {
        const response = await axios.post(`${API_BASE_URL}/test/trigger-assessment-reviewed`, {
            assessment
        });
        console.log('   ✅ API 调用成功:', response.data.message);
        console.log('   ✅ 事件已触发，大屏应该刷新待审核列表');
        console.log('   💡 检查后端控制台是否有 "[Server] 评估审核事件，推送通知..." 和 "📢 SSE 广播消息" 日志\n');
    } catch (error) {
        console.error('   ❌ API 调用失败:', error.message, '\n');
    }
}, 8000);

// 测试 4: 直接触发 Dashboard 刷新
setTimeout(async () => {
    testCount++;
    console.log(`[测试 ${testCount}] 📊 直接触发 Dashboard 刷新`);
    const refreshData = {
        type: 'manual',
        action: 'refresh',
        timestamp: new Date().toISOString()
    };
    console.log('   发送数据:', JSON.stringify(refreshData, null, 2));
    
    try {
        const response = await axios.post(`${API_BASE_URL}/test/trigger-dashboard-refresh`, {
            data: refreshData
        });
        console.log('   ✅ API 调用成功:', response.data.message);
        console.log('   ✅ 事件已触发，大屏应该立即刷新所有数据');
        console.log('   💡 检查后端控制台是否有 "[Server] Dashboard 数据变更，推送更新..." 和 "📢 SSE 广播消息" 日志\n');
    } catch (error) {
        console.error('   ❌ API 调用失败:', error.message, '\n');
    }
}, 11000);

// 测试 5: 模拟多个高危警报（压力测试）
setTimeout(() => {
    testCount++;
    console.log(`[测试 ${testCount}] ⚡ 模拟连续高危警报（3个）`);
    
    for (let i = 1; i <= 3; i++) {
        setTimeout(async () => {
            const alertData = {
                patient: `批量测试患者-${i}`,
                risk_level: 'critical',
                assessment_id: 10000 + i
            };
            console.log(`   发送警报 ${i}/3:`, JSON.stringify(alertData, null, 2));
            
            try {
                const response = await axios.post(`${API_BASE_URL}/test/trigger-high-risk-alert`, {
                    alert: alertData
                });
                console.log(`   ✅ 警报 ${i}/3 已触发:`, response.data.message);
            } catch (error) {
                console.error(`   ❌ 警报 ${i}/3 失败:`, error.message);
            }
        }, i * 1000);
    }
    console.log('   预期效果：3个红色警报框依次弹出');
    console.log('   💡 检查后端控制台是否有 "[Server] 高危患者警报，推送通知..." 和 "📢 SSE 广播消息" 日志\n');
}, 14000);

// 测试完成
setTimeout(() => {
    console.log('='.repeat(60));
    console.log('✅ 所有测试已完成！');
    console.log('='.repeat(60));
    console.log('');
    console.log('检查项：');
    console.log('  ✓ 大屏右上角连接状态：🟢 SSE 已连接');
    console.log('  ✓ 数据自动刷新（无需手动刷新）');
    console.log('  ✓ 高危警报弹窗（红色渐变框）');
    console.log('  ✓ 浏览器控制台有推送日志');
    console.log('  ✓ 后端控制台有 "📢 SSE 广播消息" 日志');
    console.log('');
    console.log('如果以上都正常，说明 SSE 实时推送已成功部署！');
    console.log('');
    console.log('💡 提示：真实场景中，这些事件会在以下情况自动触发：');
    console.log('   - 患者上传造口照片 → 创建评估');
    console.log('   - 护士审核评估 → 审核事件');
    console.log('   - 高危评估生成 → 警报事件');
    console.log('');
}, 20000);
