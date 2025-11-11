const express = require('express');
const router = express.Router();
const dataEmitter = require('../utils/eventEmitter');

/**
 * 测试路由 - 仅用于开发环境测试 WebSocket 推送
 * 在生产环境中应该禁用或移除这些端点
 */

// 在生产环境中禁用所有测试路由
// 注意：开发环境和测试环境默认允许访问
// 只有在真正的生产环境（NODE_ENV=production 且 PORT 不是 3000）时才禁用

const nodeEnv = process.env.NODE_ENV || 'development';
const port = process.env.PORT || '3000';

// 判断是否为开发/测试环境
const isDev = nodeEnv === 'development';
const isTest = nodeEnv === 'test';
const isProduction = nodeEnv === 'production';

// 检测是否为本地开发环境（包括测试环境）
// 在本地开发时（PORT=3000 或未设置），即使 NODE_ENV 是 production，也允许测试路由
const isLocalDev = port === '3000' || 
                   isDev ||
                   isTest ||
                   !process.env.NODE_ENV ||
                   process.env.ALLOW_TEST_ROUTES === 'true' ||
                   process.env.ALLOW_TEST_ROUTES === '1';

// 强制启用选项
const enableTestRoutes = process.env.ENABLE_TEST_ROUTES === 'true' || 
                         process.env.ENABLE_TEST_ROUTES === '1';

// 只有在真正的生产环境（production 且不在本地）且未强制启用时才禁用
// 开发环境和测试环境总是启用
const shouldDisable = isProduction && !isLocalDev && !enableTestRoutes;

// 输出当前环境信息（用于调试）
console.log(`[TestRoutes] ========================================`);
console.log(`[TestRoutes] 环境变量诊断信息：`);
console.log(`[TestRoutes]   NODE_ENV = "${nodeEnv}"`);
console.log(`[TestRoutes]   process.env.NODE_ENV = "${process.env.NODE_ENV || '(未设置)'}"`);
console.log(`[TestRoutes]   PORT = "${port}"`);
console.log(`[TestRoutes]   ENABLE_TEST_ROUTES = "${process.env.ENABLE_TEST_ROUTES || '(未设置)'}"`);
console.log(`[TestRoutes]   ALLOW_TEST_ROUTES = "${process.env.ALLOW_TEST_ROUTES || '(未设置)'}"`);
console.log(`[TestRoutes] 判断结果：`);
console.log(`[TestRoutes]   是否为开发环境: ${isDev}`);
console.log(`[TestRoutes]   是否为测试环境: ${isTest}`);
console.log(`[TestRoutes]   是否为生产环境: ${isProduction}`);
console.log(`[TestRoutes]   是否为本地开发: ${isLocalDev}`);
console.log(`[TestRoutes]   是否强制启用: ${enableTestRoutes}`);
console.log(`[TestRoutes]   是否禁用测试路由: ${shouldDisable}`);
console.log(`[TestRoutes] ========================================`);

// 生产环境检查中间件
const checkProduction = (req, res, next) => {
    if (shouldDisable) {
        console.log(`[TestRoutes] ⚠️  阻止测试端点访问（生产环境）`);
        console.log(`[TestRoutes] 请求路径: ${req.method} ${req.path}`);
        console.log(`[TestRoutes] 诊断信息: NODE_ENV=${process.env.NODE_ENV}, PORT=${process.env.PORT || '3000'}`);
        return res.status(403).json({
            success: false,
            message: '测试端点在生产环境中已禁用',
            environment: nodeEnv,
            nodeEnv: process.env.NODE_ENV,
            port: process.env.PORT || '3000',
            hint: '要启用测试端点，请执行以下任一操作：\n' +
                  '1. 设置 NODE_ENV=development\n' +
                  '2. 设置 ENABLE_TEST_ROUTES=true\n' +
                  '3. 设置 ALLOW_TEST_ROUTES=true\n' +
                  '4. 或者在本地开发时（PORT=3000）自动启用'
        });
    }
    next();
};

// 所有测试路由都需要通过生产环境检查
router.use(checkProduction);

if (!shouldDisable) {
    let envType = '';
    if (isTest) {
        envType = '测试环境';
    } else if (isDev) {
        envType = '开发环境';
    } else if (enableTestRoutes && isProduction) {
        envType = '生产环境（通过 ENABLE_TEST_ROUTES 强制启用）';
    } else if (isLocalDev) {
        envType = '本地开发环境';
    } else {
        envType = '开发环境';
    }
    
    console.log(`✅ 测试路由已启用（${envType}）`);
    console.log('   测试端点: /api/test/*');
    console.log('   可用端点:');
    console.log('     - GET  /api/test/event-listeners');
    console.log('     - POST /api/test/trigger-assessment-created');
    console.log('     - POST /api/test/trigger-assessment-reviewed');
    console.log('     - POST /api/test/trigger-high-risk-alert');
    console.log('     - POST /api/test/trigger-dashboard-refresh');
} else {
    console.log('⚠️  测试路由已禁用（生产环境）');
    console.log('   提示: 设置以下任一环境变量可启用测试路由：');
    console.log('     - NODE_ENV=development (开发环境)');
    console.log('     - NODE_ENV=test (测试环境)');
    console.log('     - ENABLE_TEST_ROUTES=true');
    console.log('     - ALLOW_TEST_ROUTES=true');
    console.log('     - 或者在本地运行时（PORT=3000）自动启用');
}

// 测试触发评估创建事件
router.post('/trigger-assessment-created', (req, res) => {
    const assessment = req.body.assessment || {
        id: req.body.id || Date.now(),
        patient_id: req.body.patient_id || 1,
        patient_name: req.body.patient_name || '测试患者',
        risk_level: req.body.risk_level || 'good',
        det_level: req.body.det_level || 'good',
        det_total: req.body.det_total || 3,
        assessment_date: req.body.assessment_date || new Date().toISOString()
    };

    console.log('🧪 [Test API] 触发评估创建事件');
    dataEmitter.emitAssessmentCreated(assessment);

    res.json({
        success: true,
        message: '评估创建事件已触发',
        assessment
    });
});

// 测试触发评估审核事件
router.post('/trigger-assessment-reviewed', (req, res) => {
    const assessment = req.body.assessment || {
        id: req.body.id || Date.now(),
        patient_id: req.body.patient_id || 1,
        patient_name: req.body.patient_name || '测试患者',
        risk_level: req.body.risk_level || 'moderate',
        det_level: req.body.det_level || 'moderate',
        nurse_review: req.body.nurse_review || 'approved',
        nurse_comment: req.body.nurse_comment || '测试审核',
        reviewed_at: req.body.reviewed_at || new Date().toISOString()
    };

    console.log('🧪 [Test API] 触发评估审核事件');
    dataEmitter.emitAssessmentReviewed(assessment);

    res.json({
        success: true,
        message: '评估审核事件已触发',
        assessment
    });
});

// 测试触发高危警报
router.post('/trigger-high-risk-alert', (req, res) => {
    const alertData = req.body.alert || {
        patient: req.body.patient || '测试患者',
        risk_level: req.body.risk_level || 'critical',
        assessment_id: req.body.assessment_id || Date.now()
    };

    console.log('🧪 [Test API] 触发高危警报事件');
    dataEmitter.emitHighRiskAlert(alertData);

    res.json({
        success: true,
        message: '高危警报事件已触发',
        alert: alertData
    });
});

// 测试触发 Dashboard 刷新
router.post('/trigger-dashboard-refresh', (req, res) => {
    const refreshData = req.body.data || {
        type: req.body.type || 'manual',
        action: req.body.action || 'refresh',
        timestamp: new Date().toISOString()
    };

    console.log('🧪 [Test API] 触发 Dashboard 刷新事件');
    dataEmitter.emit(dataEmitter.EVENTS.DASHBOARD_REFRESH, refreshData);

    res.json({
        success: true,
        message: 'Dashboard 刷新事件已触发',
        data: refreshData
    });
});

// 获取事件监听器状态
router.get('/event-listeners', (req, res) => {
    res.json({
        success: true,
        listeners: {
            DASHBOARD_REFRESH: dataEmitter.listenerCount(dataEmitter.EVENTS.DASHBOARD_REFRESH),
            ASSESSMENT_CREATED: dataEmitter.listenerCount(dataEmitter.EVENTS.ASSESSMENT_CREATED),
            ASSESSMENT_REVIEWED: dataEmitter.listenerCount(dataEmitter.EVENTS.ASSESSMENT_REVIEWED),
            HIGH_RISK_ALERT: dataEmitter.listenerCount(dataEmitter.EVENTS.HIGH_RISK_ALERT)
        }
    });
});

module.exports = router;

