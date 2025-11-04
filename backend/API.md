# 造口护理系统 API 文档

## 基础信息

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: JWT Token (Bearer Token)
- **响应格式**: JSON

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

### 错误响应
```json
{
  "success": false,
  "message": "错误信息",
  "errors": []
}
```

### 分页响应
```json
{
  "success": true,
  "message": "获取成功",
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

## 1. 认证接口 `/api/auth`

### 1.1 患者登录
- **接口**: `POST /api/auth/login/patient`
- **说明**: 患者微信登录
- **请求体**:
```json
{
  "code": "微信登录code",
  "userInfo": {
    "nickname": "昵称",
    "avatarUrl": "头像URL",
    "gender": 1
  }
}
```
- **响应**:
```json
{
  "success": true,
  "data": {
    "token": "JWT Token",
    "user": {
      "id": 1,
      "nickname": "昵称",
      "avatarUrl": "头像URL",
      "userType": "patient"
    },
    "patient": {
      "id": 1,
      "name": "姓名",
      "gender": "male"
    }
  }
}
```

### 1.2 获取当前用户信息
- **接口**: `GET /api/auth/me`
- **说明**: 获取当前登录用户信息
- **认证**: 需要
- **响应**: 返回用户信息

### 1.3 刷新Token
- **接口**: `POST /api/auth/refresh`
- **认证**: 需要
- **响应**: 返回新的token

## 2. 患者管理 `/api/patients`

### 2.1 创建患者信息
- **接口**: `POST /api/patients`
- **认证**: 需要（患者）
- **请求体**:
```json
{
  "name": "姓名",
  "gender": "male",
  "birthDate": "1980-01-01",
  "phone": "13800138000",
  "address": "地址",
  "stomaType": "结肠造口",
  "surgeryDate": "2024-01-01",
  "surgeryHospital": "XX医院",
  "primaryDisease": "结肠癌"
}
```

### 2.2 获取我的患者信息
- **接口**: `GET /api/patients/me`
- **认证**: 需要（患者）

### 2.3 获取患者列表
- **接口**: `GET /api/patients`
- **认证**: 需要（护士/管理员）
- **查询参数**:
  - `page`: 页码
  - `pageSize`: 每页数量
  - `nurseId`: 护士ID
  - `status`: 状态
  - `keyword`: 搜索关键词

### 2.4 获取患者详情
- **接口**: `GET /api/patients/:id`
- **认证**: 需要

### 2.5 更新患者信息
- **接口**: `PUT /api/patients/:id`
- **认证**: 需要

## 3. AI评估 `/api/assessments`

### 3.1 创建评估（上传图片）
- **接口**: `POST /api/assessments`
- **认证**: 需要
- **请求类型**: multipart/form-data
- **参数**:
  - `image`: 图片文件
  - `patientId`: 患者ID（可选，自动从token获取）
- **响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "imageUrl": "/uploads/assessments/xxx.jpg",
    "stomaColor": "粉红色",
    "stomaSize": "正常",
    "skinCondition": "良好",
    "riskLevel": "low",
    "suggestions": "护理建议",
    "aiAnalysis": {
      "confidence": 0.85
    }
  }
}
```

### 3.2 获取评估列表
- **接口**: `GET /api/assessments`
- **认证**: 需要
- **查询参数**:
  - `page`, `pageSize`: 分页
  - `patientId`: 患者ID
  - `riskLevel`: 风险等级
  - `startDate`, `endDate`: 日期范围

### 3.3 获取最新评估
- **接口**: `GET /api/assessments/latest`
- **认证**: 需要

### 3.4 获取评估历史
- **接口**: `GET /api/assessments/history/:patientId`
- **认证**: 需要

### 3.5 护士审阅
- **接口**: `POST /api/assessments/:id/review`
- **认证**: 需要（护士）
- **请求体**:
```json
{
  "comment": "护士评语"
}
```

## 4. 症状日记 `/api/diaries`

### 4.1 创建症状日记
- **接口**: `POST /api/diaries`
- **认证**: 需要
- **请求体**:
```json
{
  "diaryDate": "2024-01-01",
  "outputVolume": 500,
  "outputType": "成型",
  "outputColor": "黄褐色",
  "skinCondition": "良好",
  "painLevel": 0,
  "odorLevel": 2,
  "leakIncident": 0,
  "bagChangeCount": 1,
  "dietNotes": "清淡饮食",
  "mood": "良好",
  "notes": "备注"
}
```

### 4.2 获取日记列表
- **接口**: `GET /api/diaries`
- **认证**: 需要
- **查询参数**:
  - `page`, `pageSize`: 分页
  - `patientId`: 患者ID
  - `startDate`, `endDate`: 日期范围

### 4.3 获取统计数据
- **接口**: `GET /api/diaries/stats`
- **认证**: 需要
- **查询参数**:
  - `patientId`: 患者ID
  - `startDate`, `endDate`: 日期范围

### 4.4 根据日期获取日记
- **接口**: `GET /api/diaries/:patientId/:date`
- **认证**: 需要

### 4.5 更新日记
- **接口**: `PUT /api/diaries/:id`
- **认证**: 需要

## 5. 护理教育 `/api/courses`

### 5.1 获取课程分类
- **接口**: `GET /api/courses/categories`
- **认证**: 需要

### 5.2 获取课程列表
- **接口**: `GET /api/courses`
- **认证**: 需要
- **查询参数**:
  - `categoryId`: 分类ID
  - `difficulty`: 难度
  - `keyword`: 关键词

### 5.3 获取课程详情
- **接口**: `GET /api/courses/:id`
- **认证**: 需要

### 5.4 记录学习进度
- **接口**: `POST /api/courses/:id/progress`
- **认证**: 需要
- **请求体**:
```json
{
  "progress": 50,
  "lastPosition": 120,
  "studyDuration": 300,
  "completed": 0
}
```

### 5.5 获取我的学习记录
- **接口**: `GET /api/courses/my-learning`
- **认证**: 需要

### 5.6 点赞课程
- **接口**: `POST /api/courses/:id/like`
- **认证**: 需要

## 6. 健康报告 `/api/reports`

### 6.1 生成健康报告
- **接口**: `GET /api/reports/generate`
- **认证**: 需要
- **查询参数**:
  - `patientId`: 患者ID
  - `days`: 天数（默认30）
- **响应**:
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-30",
      "days": 30
    },
    "healthScore": 85,
    "stats": {},
    "trends": {},
    "recommendations": []
  }
}
```

### 6.2 获取我的报告
- **接口**: `GET /api/reports/my-report`
- **认证**: 需要
- **查询参数**:
  - `days`: 天数（默认7）

## 7. 护理计划 `/api/care-plans`

### 7.1 创建护理计划
- **接口**: `POST /api/care-plans`
- **认证**: 需要
- **请求体**:
```json
{
  "patientId": 1,
  "title": "计划标题",
  "description": "计划描述",
  "startDate": "2024-01-01",
  "endDate": "2024-02-01",
  "frequency": "每日",
  "notes": "备注"
}
```

### 7.2 获取护理计划列表
- **接口**: `GET /api/care-plans`
- **认证**: 需要
- **查询参数**:
  - `patientId`: 患者ID
  - `status`: 状态

### 7.3 添加计划项目
- **接口**: `POST /api/care-plans/:id/items`
- **认证**: 需要
- **请求体**:
```json
{
  "title": "项目标题",
  "description": "项目描述",
  "targetValue": "目标值"
}
```

### 7.4 更新项目状态
- **接口**: `PUT /api/care-plans/:id/items/:itemId`
- **认证**: 需要
- **请求体**:
```json
{
  "completed": 1
}
```

## 8. 提醒管理 `/api/reminders`

### 8.1 创建提醒
- **接口**: `POST /api/reminders`
- **认证**: 需要
- **请求体**:
```json
{
  "title": "提醒标题",
  "description": "提醒描述",
  "reminderType": "medication",
  "remindTime": "08:00",
  "frequency": "daily",
  "enabled": 1
}
```

### 8.2 获取提醒列表
- **接口**: `GET /api/reminders`
- **认证**: 需要

### 8.3 获取今日提醒
- **接口**: `GET /api/reminders/today`
- **认证**: 需要

### 8.4 完成提醒
- **接口**: `POST /api/reminders/:id/complete`
- **认证**: 需要
- **请求体**:
```json
{
  "notes": "完成备注"
}
```

## 9. 家属管理 `/api/families`

### 9.1 创建家属
- **接口**: `POST /api/families`
- **认证**: 需要
- **请求体**:
```json
{
  "name": "家属姓名",
  "relationship": "配偶",
  "phone": "13800138000",
  "isPrimary": 1
}
```

### 9.2 获取家属列表
- **接口**: `GET /api/families`
- **认证**: 需要

### 9.3 设置主要联系人
- **接口**: `PUT /api/families/:id/primary`
- **认证**: 需要

## 错误码说明

- `200`: 成功
- `201`: 创建成功
- `400`: 请求错误
- `401`: 未授权
- `403`: 禁止访问
- `404`: 资源不存在
- `409`: 资源冲突
- `422`: 验证错误
- `500`: 服务器错误

## 认证说明

所有需要认证的接口都需要在请求头中携带JWT Token：

```
Authorization: Bearer <your_token>
```

获取Token的方式：
1. 通过登录接口获取
2. Token有效期为7天
3. Token过期后需要重新登录或使用refresh接口刷新




