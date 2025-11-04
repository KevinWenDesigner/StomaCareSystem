const moment = require('moment');

// 设置默认时区
moment.locale('zh-cn');

// 格式化日期
const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

// 格式化日期时间
const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(date).format(format);
};

// 获取当前日期
const getCurrentDate = () => {
  return moment().format('YYYY-MM-DD');
};

// 获取当前日期时间
const getCurrentDateTime = () => {
  return moment().format('YYYY-MM-DD HH:mm:ss');
};

// 计算日期差（天数）
const daysDiff = (date1, date2) => {
  return moment(date1).diff(moment(date2), 'days');
};

// 添加天数
const addDays = (date, days) => {
  return moment(date).add(days, 'days').format('YYYY-MM-DD');
};

// 减少天数
const subtractDays = (date, days) => {
  return moment(date).subtract(days, 'days').format('YYYY-MM-DD');
};

// 获取日期范围
const getDateRange = (startDate, endDate) => {
  const dates = [];
  const start = moment(startDate);
  const end = moment(endDate);
  
  while (start <= end) {
    dates.push(start.format('YYYY-MM-DD'));
    start.add(1, 'days');
  }
  
  return dates;
};

// 获取本周日期范围
const getThisWeek = () => {
  return {
    start: moment().startOf('week').format('YYYY-MM-DD'),
    end: moment().endOf('week').format('YYYY-MM-DD')
  };
};

// 获取本月日期范围
const getThisMonth = () => {
  return {
    start: moment().startOf('month').format('YYYY-MM-DD'),
    end: moment().endOf('month').format('YYYY-MM-DD')
  };
};

// 获取最近N天的日期范围
const getRecentDays = (days) => {
  return {
    start: moment().subtract(days - 1, 'days').format('YYYY-MM-DD'),
    end: moment().format('YYYY-MM-DD')
  };
};

// 判断是否是今天
const isToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

// 判断是否过期
const isExpired = (date) => {
  return moment(date).isBefore(moment(), 'day');
};

module.exports = {
  formatDate,
  formatDateTime,
  getCurrentDate,
  getCurrentDateTime,
  daysDiff,
  addDays,
  subtractDays,
  getDateRange,
  getThisWeek,
  getThisMonth,
  getRecentDays,
  isToday,
  isExpired
};




