/**
 * 教育模块API测试脚本
 * 用于验证所有教育相关API是否正常工作
 */

const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// 创建axios实例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 测试用例
async function testHealthCheck() {
  logInfo('测试1: API健康检查');
  try {
    const response = await api.get('/health');
    if (response.data.success) {
      logSuccess('API服务运行正常');
      console.log('   响应:', response.data);
      return true;
    }
  } catch (error) {
    logError('API服务无法连接');
    console.log('   错误:', error.message);
    return false;
  }
}

async function testGetCourseCategories() {
  logInfo('测试2: 获取课程分类');
  try {
    const response = await api.get('/courses/categories');
    if (response.data.success && Array.isArray(response.data.data)) {
      const categories = response.data.data;
      logSuccess(`获取到 ${categories.length} 个课程分类`);
      categories.forEach(cat => {
        console.log(`   - ${cat.name} (ID: ${cat.id})`);
      });
      return true;
    }
  } catch (error) {
    logError('获取课程分类失败');
    console.log('   错误:', error.response?.data || error.message);
    return false;
  }
}

async function testGetCourses() {
  logInfo('测试3: 获取课程列表');
  try {
    const response = await api.get('/courses', {
      params: {
        page: 1,
        pageSize: 10
      }
    });
    
    if (response.data.success) {
      const courses = response.data.data || [];
      const pagination = response.data.pagination || {};
      
      logSuccess(`获取到 ${courses.length} 门课程`);
      console.log(`   总数: ${pagination.total}, 页码: ${pagination.page}/${Math.ceil(pagination.total / pagination.pageSize)}`);
      
      if (courses.length > 0) {
        console.log('\n   课程列表:');
        courses.forEach((course, index) => {
          console.log(`   ${index + 1}. ${course.title} (ID: ${course.id})`);
          console.log(`      分类: ${course.category_name}, 难度: ${course.difficulty}`);
        });
        return courses[0].id; // 返回第一个课程ID供后续测试使用
      }
    }
  } catch (error) {
    logError('获取课程列表失败');
    console.log('   错误:', error.response?.data || error.message);
    return null;
  }
}

async function testGetCourseDetail(courseId) {
  logInfo(`测试4: 获取课程详情 (ID: ${courseId})`);
  try {
    const response = await api.get(`/courses/${courseId}`);
    
    if (response.data.success && response.data.data) {
      const course = response.data.data;
      logSuccess('课程详情获取成功');
      console.log(`   标题: ${course.title}`);
      console.log(`   描述: ${course.description}`);
      console.log(`   难度: ${course.difficulty}`);
      console.log(`   浏览量: ${course.view_count}`);
      console.log(`   点赞数: ${course.like_count}`);
      return true;
    }
  } catch (error) {
    logError('获取课程详情失败');
    console.log('   错误:', error.response?.data || error.message);
    return false;
  }
}

async function testRecordProgress(courseId) {
  logInfo(`测试5: 记录学习进度 (ID: ${courseId})`);
  try {
    const progressData = {
      progress: 50,
      lastPosition: 0,
      studyDuration: 300,
      completed: 0
    };
    
    const response = await api.post(`/courses/${courseId}/progress`, progressData);
    
    if (response.data.success) {
      logSuccess('学习进度记录成功');
      console.log(`   进度: ${response.data.data.progress}%`);
      console.log(`   学习时长: ${response.data.data.study_duration}秒`);
      return true;
    }
  } catch (error) {
    logError('记录学习进度失败');
    console.log('   错误:', error.response?.data || error.message);
    
    // 如果是因为缺少patientId，给出提示
    if (error.response?.data?.message?.includes('患者')) {
      logWarning('需要先登录并创建患者信息才能记录学习进度');
    }
    return false;
  }
}

async function testGetMyLearning() {
  logInfo('测试6: 获取我的学习记录');
  try {
    const response = await api.get('/courses/my-learning', {
      params: {
        page: 1,
        pageSize: 10
      }
    });
    
    if (response.data.success && response.data.data) {
      const { records, stats } = response.data.data;
      logSuccess(`获取到 ${records.length} 条学习记录`);
      
      if (stats) {
        console.log('\n   学习统计:');
        console.log(`   - 学习课程数: ${stats.total_courses}`);
        console.log(`   - 完成课程数: ${stats.completed_courses}`);
        console.log(`   - 总学习时长: ${Math.floor(stats.total_duration / 60)}分钟`);
      }
      
      if (records.length > 0) {
        console.log('\n   最近学习:');
        records.slice(0, 3).forEach((record, index) => {
          console.log(`   ${index + 1}. ${record.title} - 进度 ${record.progress}%`);
        });
      }
      return true;
    }
  } catch (error) {
    logError('获取学习记录失败');
    console.log('   错误:', error.response?.data || error.message);
    
    if (error.response?.data?.message?.includes('患者')) {
      logWarning('需要先登录并创建患者信息才能获取学习记录');
    }
    return false;
  }
}

async function testLikeCourse(courseId) {
  logInfo(`测试7: 点赞课程 (ID: ${courseId})`);
  try {
    const response = await api.post(`/courses/${courseId}/like`);
    
    if (response.data.success) {
      logSuccess('课程点赞成功');
      return true;
    }
  } catch (error) {
    logError('课程点赞失败');
    console.log('   错误:', error.response?.data || error.message);
    return false;
  }
}

// 主测试流程
async function runTests() {
  console.log('\n' + '='.repeat(60));
  log('🚀 开始测试教育模块API', 'cyan');
  console.log('='.repeat(60) + '\n');
  
  // 测试1: 健康检查
  const healthOk = await testHealthCheck();
  console.log('');
  
  if (!healthOk) {
    logError('API服务未启动，请先启动后端服务器');
    logInfo('运行命令: cd backend && npm run dev');
    process.exit(1);
  }
  
  // 测试2: 获取课程分类
  await testGetCourseCategories();
  console.log('');
  
  // 测试3: 获取课程列表
  const courseId = await testGetCourses();
  console.log('');
  
  if (!courseId) {
    logError('没有找到课程，请先运行数据库初始化脚本');
    logInfo('运行命令: node backend/src/scripts/initDatabase.js');
    process.exit(1);
  }
  
  // 测试4: 获取课程详情
  await testGetCourseDetail(courseId);
  console.log('');
  
  // 提示：需要登录token
  logWarning('以下测试需要有效的用户Token和患者信息');
  logInfo('请在小程序中登录后，从控制台获取token');
  console.log('');
  
  // 询问是否继续
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('是否已有Token？(y/n) ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      rl.question('请输入Token: ', async (token) => {
        authToken = token.trim();
        
        // 测试5: 记录学习进度
        await testRecordProgress(courseId);
        console.log('');
        
        // 测试6: 获取我的学习记录
        await testGetMyLearning();
        console.log('');
        
        // 测试7: 点赞课程
        await testLikeCourse(courseId);
        console.log('');
        
        // 测试完成
        console.log('='.repeat(60));
        log('✨ 所有测试完成！', 'green');
        console.log('='.repeat(60) + '\n');
        
        rl.close();
      });
    } else {
      console.log('\n' + '='.repeat(60));
      log('📝 基础测试完成（需要Token的测试已跳过）', 'yellow');
      console.log('='.repeat(60) + '\n');
      
      logInfo('完成用户登录后，可以继续测试剩余功能');
      rl.close();
    }
  });
}

// 运行测试
if (require.main === module) {
  runTests().catch(error => {
    logError('测试过程中发生错误');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runTests };

