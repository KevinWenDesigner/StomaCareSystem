const EventEmitter = require('events');

/**
 * 全局事件发射器
 * 用于在不同模块间传递数据变更事件
 */
class DataChangeEmitter extends EventEmitter {
    constructor() {
        super();
        
        // 事件类型常量
        this.EVENTS = {
            // 评估相关
            ASSESSMENT_CREATED: 'assessment:created',
            ASSESSMENT_UPDATED: 'assessment:updated',
            ASSESSMENT_REVIEWED: 'assessment:reviewed',
            
            // 患者相关
            PATIENT_CREATED: 'patient:created',
            PATIENT_UPDATED: 'patient:updated',
            
            // 日记相关
            DIARY_CREATED: 'diary:created',
            
            // 高危警报
            HIGH_RISK_ALERT: 'alert:high_risk',
            
            // Dashboard 刷新
            DASHBOARD_REFRESH: 'dashboard:refresh'
        };
    }

    /**
     * 发射评估创建事件
     */
    emitAssessmentCreated(assessment) {
        const listenerCount = this.listenerCount(this.EVENTS.ASSESSMENT_CREATED);
        const refreshListenerCount = this.listenerCount(this.EVENTS.DASHBOARD_REFRESH);
        console.log(`[EventEmitter] 📝 触发评估创建事件`);
        console.log(`[EventEmitter]   监听器数量: ASSESSMENT_CREATED=${listenerCount}, DASHBOARD_REFRESH=${refreshListenerCount}`);
        console.log(`[EventEmitter]   数据:`, JSON.stringify(assessment, null, 2));
        
        if (listenerCount === 0) {
            console.warn('⚠️  警告: 没有监听器注册 ASSESSMENT_CREATED 事件！');
            console.warn('   请确保服务器正在运行并且事件监听器已注册。');
        }
        if (refreshListenerCount === 0) {
            console.warn('⚠️  警告: 没有监听器注册 DASHBOARD_REFRESH 事件！');
        }
        
        this.emit(this.EVENTS.ASSESSMENT_CREATED, assessment);
        this.emit(this.EVENTS.DASHBOARD_REFRESH, { type: 'assessment', action: 'created' });
    }

    /**
     * 发射评估更新事件
     */
    emitAssessmentUpdated(assessment) {
        this.emit(this.EVENTS.ASSESSMENT_UPDATED, assessment);
        this.emit(this.EVENTS.DASHBOARD_REFRESH, { type: 'assessment', action: 'updated' });
    }

    /**
     * 发射评估审核事件
     */
    emitAssessmentReviewed(assessment) {
        const listenerCount = this.listenerCount(this.EVENTS.ASSESSMENT_REVIEWED);
        console.log(`[EventEmitter] 👩‍⚕️ 触发评估审核事件 (监听器数量: ${listenerCount})`);
        console.log(`[EventEmitter] 数据:`, JSON.stringify(assessment, null, 2));
        
        if (listenerCount === 0) {
            console.warn('⚠️  警告: 没有监听器注册 ASSESSMENT_REVIEWED 事件！');
        }
        
        this.emit(this.EVENTS.ASSESSMENT_REVIEWED, assessment);
        this.emit(this.EVENTS.DASHBOARD_REFRESH, { type: 'assessment', action: 'reviewed' });
    }

    /**
     * 发射患者创建事件
     */
    emitPatientCreated(patient) {
        this.emit(this.EVENTS.PATIENT_CREATED, patient);
        this.emit(this.EVENTS.DASHBOARD_REFRESH, { type: 'patient', action: 'created' });
    }

    /**
     * 发射患者更新事件
     */
    emitPatientUpdated(patient) {
        this.emit(this.EVENTS.PATIENT_UPDATED, patient);
        this.emit(this.EVENTS.DASHBOARD_REFRESH, { type: 'patient', action: 'updated' });
    }

    /**
     * 发射日记创建事件
     */
    emitDiaryCreated(diary) {
        this.emit(this.EVENTS.DIARY_CREATED, diary);
        this.emit(this.EVENTS.DASHBOARD_REFRESH, { type: 'diary', action: 'created' });
    }

    /**
     * 发射高危警报
     * @param {string|Object} patient - 患者名称或包含 patient/risk_level/assessment_id 的对象
     * @param {Object} assessment - 评估信息（可选，如果第一个参数是对象则忽略）
     */
    emitHighRiskAlert(patient, assessment) {
        const listenerCount = this.listenerCount(this.EVENTS.HIGH_RISK_ALERT);
        console.log(`[EventEmitter] 🚨 触发高危警报事件 (监听器数量: ${listenerCount})`);
        
        let alertData;
        // 如果第一个参数是对象，直接使用它
        if (typeof patient === 'object' && patient !== null) {
            alertData = patient;
            this.emit(this.EVENTS.HIGH_RISK_ALERT, patient);
        } else {
            // 兼容旧的方式：两个参数
            alertData = { patient, assessment };
            this.emit(this.EVENTS.HIGH_RISK_ALERT, alertData);
        }
        
        console.log(`[EventEmitter] 数据:`, JSON.stringify(alertData, null, 2));
        
        if (listenerCount === 0) {
            console.warn('⚠️  警告: 没有监听器注册 HIGH_RISK_ALERT 事件！');
            console.warn('   请确保服务器正在运行并且事件监听器已注册。');
        }
    }
}

// 创建单例实例
const dataEmitter = new DataChangeEmitter();

// 监听所有事件，用于调试
if (process.env.NODE_ENV === 'development' || process.env.DEBUG_EVENTS === 'true') {
    Object.values(dataEmitter.EVENTS).forEach(eventName => {
        dataEmitter.on(eventName, (data) => {
            console.log(`[EventEmitter Debug] 📢 事件 "${eventName}" 被触发`);
        });
    });
}

// 导出单例
module.exports = dataEmitter;
