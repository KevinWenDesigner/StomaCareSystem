const ReportService = require('../services/reportService');
const response = require('../utils/response');

class ReportController {
  // 生成健康报告
  static async generateReport(req, res, next) {
    try {
      const patientId = req.user.patientId || req.query.patientId;
      const { days = 30 } = req.query;
      
      if (!patientId) {
        return response.error(res, '缺少患者ID');
      }
      
      const report = await ReportService.generateHealthReport(
        patientId, 
        parseInt(days)
      );
      
      return response.success(res, report, '报告生成成功');
    } catch (error) {
      next(error);
    }
  }

  // 获取最近报告
  static async getMyReport(req, res, next) {
    try {
      const patientId = req.user.patientId;
      const { days = 7 } = req.query;
      
      if (!patientId) {
        return response.error(res, '缺少患者ID');
      }
      
      const report = await ReportService.generateHealthReport(
        patientId,
        parseInt(days)
      );
      
      return response.success(res, report);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportController;




