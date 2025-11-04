// 数据验证工具

// 验证手机号
const isValidPhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 验证身份证号
const isValidIdCard = (idCard) => {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return idCardRegex.test(idCard);
};

// 验证日期格式 YYYY-MM-DD
const isValidDate = (dateStr) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;
  
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
};

// 验证时间格式 HH:MM
const isValidTime = (timeStr) => {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(timeStr);
};

// 验证邮箱
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 验证URL
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// 验证必填字段
const validateRequired = (data, requiredFields) => {
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || data[field] === '') {
      errors.push(`${field}字段为必填项`);
    }
  });
  
  return errors.length > 0 ? errors : null;
};

// 验证字段长度
const validateLength = (value, min, max, fieldName) => {
  if (value && (value.length < min || value.length > max)) {
    return `${fieldName}长度应在${min}-${max}之间`;
  }
  return null;
};

// 验证数值范围
const validateRange = (value, min, max, fieldName) => {
  if (value !== null && value !== undefined) {
    const num = Number(value);
    if (isNaN(num) || num < min || num > max) {
      return `${fieldName}应在${min}-${max}之间`;
    }
  }
  return null;
};

// 验证枚举值
const validateEnum = (value, allowedValues, fieldName) => {
  if (value && !allowedValues.includes(value)) {
    return `${fieldName}的值不在允许范围内: ${allowedValues.join(', ')}`;
  }
  return null;
};

module.exports = {
  isValidPhone,
  isValidIdCard,
  isValidDate,
  isValidTime,
  isValidEmail,
  isValidUrl,
  validateRequired,
  validateLength,
  validateRange,
  validateEnum
};




