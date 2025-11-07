# 数据大屏DET评分系统更新说明

## 📋 更新概述

数据大屏已从NPUAP伤口评估系统完全迁移到**DET评分系统**（造口周围皮炎评估），所有图表和统计数据已适配新的评分标准。

**更新日期**: 2025-11-07  
**更新内容**: 后端API + 前端展示  
**影响范围**: `index.html` + `backend/src/controllers/dashboardController.js`

---

## 🔄 主要变更

### 1. 后端API更新 (`dashboardController.js`)

#### ✅ DET等级分布
- **旧**: `risk_level` (高风险/中风险/低风险)
- **新**: `det_level` (excellent/good/moderate/poor/critical)

```javascript
// 3. DET等级分布
const riskDistribution = await db.query(`
  SELECT 
    det_level as risk_level,
    COUNT(*) as count
  FROM assessments
  WHERE assessment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  GROUP BY det_level
`);
```

#### ✅ DET维度分析
- **旧**: NPUAP分期统计 (Stage 1/2/3/4)
- **新**: DET三维度平均分 (D-变色/E-侵蚀/T-组织增生)

```javascript
// 4. DET维度分析
const stageDistribution = await db.query(`
  SELECT 'D-变色' as pressure_stage, ROUND(AVG(det_d_total), 1) as count
  FROM assessments WHERE assessment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  UNION ALL
  SELECT 'E-侵蚀', ROUND(AVG(det_e_total), 1)
  FROM assessments WHERE assessment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  UNION ALL
  SELECT 'T-组织增生', ROUND(AVG(det_t_total), 1)
  FROM assessments WHERE assessment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
`);
```

#### ✅ 重点关注患者
- **旧**: 高风险/中风险患者
- **新**: DET等级为moderate/poor/critical的患者，按DET总分排序

```javascript
// 8. 重点关注患者列表
const highRiskPatients = await db.query(`
  SELECT 
    p.id, p.name, p.gender, p.stoma_type,
    a.det_level as risk_level,
    a.score,
    a.det_total,
    a.assessment_date
  FROM patients p
  INNER JOIN assessments a ON p.id = a.patient_id
  WHERE a.id IN (SELECT MAX(id) FROM assessments GROUP BY patient_id)
    AND a.det_level IN ('moderate', 'poor', 'critical')
  ORDER BY a.det_total DESC, a.assessment_date DESC
  LIMIT 10
`);
```

---

### 2. 前端展示更新 (`index.html`)

#### ✅ 核心指标
```
平均评分 → 平均DET分 (0-15分)
```

#### ✅ DET等级分布图（饼图）
- **5个等级**：优秀/良好/中度/重度/极重度
- **颜色梯度**：绿色→黄色→橙色→红色

```javascript
const riskMap = {
  'excellent': { name: '优秀（无皮炎）', color: '绿色渐变' },
  'good': { name: '良好（轻度）', color: '浅绿渐变' },
  'moderate': { name: '中度（需注意）', color: '黄色渐变' },
  'poor': { name: '重度（需处理）', color: '橙色渐变' },
  'critical': { name: '极重度（紧急）', color: '红色渐变' }
};
```

#### ✅ 评估趋势图（折线图）
- **左Y轴**: 评估次数
- **右Y轴**: DET平均分 (0-15分，原100分改为15分)

```javascript
yAxis: [
  { type: 'value', name: '评估次数' },
  { type: 'value', name: 'DET平均分', max: 15 }  // ⚠️ 重要变化
]
```

#### ✅ DET维度分析图（柱状图）
- **标题**: NPUAP分期分布 → DET维度分析（平均分）
- **X轴**: D-变色、E-侵蚀、T-组织增生
- **Y轴**: 0-5分（每个维度最高5分）
- **Tooltip**: 显示"平均分: X/5"

```javascript
yAxis: {
  type: 'value',
  max: 5,  // DET各维度最高5分
  axisLabel: { formatter: '{value}分' }
}
```

#### ✅ 重点关注患者列表
- **标题**: 高风险患者 → 重点关注患者
- **显示**: DET评分: X/15分
- **徽章**: 优秀/良好/需注意/需处理/紧急

```javascript
// DET等级中文显示
const detLevelText = getDetLevelTextChinese(detLevel);
// 显示格式
DET评分: ${detTotal}/15分
```

#### ✅ 待审核评估列表
- **显示**: DET评分: X/15分
- **样式**: 根据DET等级自动着色

---

## 📊 数据映射关系

### DET等级 → 显示文本

| DET等级 | 中文名称 | 徽章颜色 | 说明 |
|---------|---------|---------|------|
| excellent | 优秀 | 深绿 | 无皮炎 |
| good | 良好 | 浅绿 | 轻度皮炎 |
| moderate | 需注意 | 黄色 | 中度皮炎 |
| poor | 需处理 | 橙色 | 重度皮炎 |
| critical | 紧急 | 红色 | 极重度皮炎 |

### 评分系统

| 评分项 | 范围 | 说明 |
|--------|------|------|
| D-变色 | 0-5分 | 面积(0-3) + 程度(0-2) |
| E-侵蚀 | 0-5分 | 面积(0-3) + 程度(0-2) |
| T-组织增生 | 0-5分 | 面积(0-3) + 程度(0-2) |
| **DET总分** | **0-15分** | D + E + T |
| 显示评分 | 0-100分 | 可选转换显示 |

---

## 🎯 关键改进

### 1. 评分系统专业化
- ✅ 采用国际DET标准（0-15分）
- ✅ 三维度独立评估（D/E/T）
- ✅ 符合造口护理专业要求

### 2. 数据展示直观化
- ✅ 直接显示DET原始评分（不转换）
- ✅ 详细展示三个维度的平均分
- ✅ 5级等级划分更精细

### 3. 患者管理精准化
- ✅ 重点关注需要处理的患者
- ✅ 按DET总分排序，优先级清晰
- ✅ 一目了然的评分显示

---

## 🚀 使用说明

### 启动大屏

1. **确保后端运行**:
   ```bash
   cd backend
   npm start
   ```

2. **打开大屏**:
   ```
   浏览器访问: http://localhost:3000/index.html
   或配置的域名
   ```

3. **配置API地址**:
   - 编辑 `config.prod.js`
   - 或在 `localStorage` 中设置 `apiBaseUrl`

### 数据刷新

- **自动刷新**: 每30秒
- **手动刷新**: 按F5键
- **登录验证**: 需要token，未登录会跳转到 `login.html`

---

## ⚠️ 注意事项

### 数据库要求
- ✅ 必须已执行DET评分系统迁移脚本
- ✅ assessments表包含DET相关字段
- ✅ score字段存储DET总分(0-15)

### 兼容性
- ✅ 旧数据查询已更新
- ✅ 前端自动适配DET等级
- ✅ 空数据友好提示

### 性能优化
- ✅ 图表使用 `notMerge: false` 减少闪烁
- ✅ 列表超过3条自动滚动
- ✅ 数字动画仅在数值变化时执行

---

## 📁 修改文件清单

```
✅ backend/src/controllers/dashboardController.js  (后端API)
✅ index.html                                       (前端大屏)
✅ DASHBOARD_DET_UPDATE.md                         (本文档)
```

---

## 🧪 测试检查

### 后端测试
```bash
# 1. 检查DET等级分布
curl http://localhost:3000/api/dashboard/stats

# 2. 验证返回数据包含
{
  "riskDistribution": [
    { "risk_level": "excellent", "count": 10 },
    { "risk_level": "good", "count": 5 }
  ],
  "stageDistribution": [
    { "pressure_stage": "D-变色", "count": 1.2 },
    { "pressure_stage": "E-侵蚀", "count": 0.8 },
    { "pressure_stage": "T-组织增生", "count": 0.5 }
  ],
  "highRiskPatients": [
    { "det_level": "moderate", "det_total": 5, ... }
  ]
}
```

### 前端测试
1. ✅ 核心指标显示正确（平均DET分）
2. ✅ DET等级分布图显示5个等级
3. ✅ 趋势图右Y轴范围0-15
4. ✅ 维度分析图显示D/E/T三个维度
5. ✅ 重点关注患者显示"DET评分: X/15分"
6. ✅ 待审核列表显示正确徽章

---

## ✅ 更新完成

**系统状态**: 生产就绪 ✅  
**评分标准**: DET 0-15分  
**支持类型**: 造口周围皮炎  
**数据可视化**: 完全适配  

如有问题，请参考 `DET_SYSTEM_GUIDE.md` 和 `FINAL_UPDATE_SUMMARY.md`。

---

**更新人员**: AI Assistant  
**更新时间**: 2025-11-07  
**版本**: DET评分系统 v2.1

