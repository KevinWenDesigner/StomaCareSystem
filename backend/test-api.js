// API接口测试脚本
const http = require('http');

let authToken = null;

function apiRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('========================================');
  console.log('     造口护理系统 API 测试');
  console.log('========================================\n');
  
  try {
    // 1. 健康检查
    console.log('1️⃣  测试健康检查接口');
    console.log('   GET /api/health');
    const health = await apiRequest('GET', '/api/health');
    console.log(`   状态码: ${health.statusCode}`);
    console.log(`   响应: ${health.data.message}`);
    console.log(health.statusCode === 200 ? '   ✅ 通过\n' : '   ❌ 失败\n');
    
    // 2. 测试登录 - 使用手机号
    console.log('2️⃣  测试登录接口（手机号）');
    console.log('   POST /api/auth/login');
    console.log('   用户名: 13800138000');
    const login1 = await apiRequest('POST', '/api/auth/login', {
      username: '13800138000',
      password: 'test123',
      userType: 'nurse'
    });
    console.log(`   状态码: ${login1.statusCode}`);
    if (login1.statusCode === 200) {
      authToken = login1.data.data.token;
      console.log(`   用户: ${login1.data.data.user.name}`);
      console.log(`   Token: ${authToken.substring(0, 30)}...`);
      console.log('   ✅ 通过\n');
    } else {
      console.log(`   错误: ${login1.data.message}`);
      console.log('   ❌ 失败\n');
    }
    
    // 3. 测试登录 - 使用工号
    console.log('3️⃣  测试登录接口（工号）');
    console.log('   POST /api/auth/login');
    console.log('   用户名: N001');
    const login2 = await apiRequest('POST', '/api/auth/login', {
      username: 'N001',
      password: 'test123',
      userType: 'nurse'
    });
    console.log(`   状态码: ${login2.statusCode}`);
    if (login2.statusCode === 200) {
      console.log(`   用户: ${login2.data.data.user.name}`);
      console.log('   ✅ 通过\n');
    } else {
      console.log(`   错误: ${login2.data.message}`);
      console.log('   ❌ 失败\n');
    }
    
    if (!authToken) {
      console.log('❌ 无法继续测试，登录失败');
      return;
    }
    
    // 4. 测试获取当前用户信息
    console.log('4️⃣  测试获取当前用户信息');
    console.log('   GET /api/auth/me');
    const me = await apiRequest('GET', '/api/auth/me', null, authToken);
    console.log(`   状态码: ${me.statusCode}`);
    if (me.statusCode === 200) {
      console.log(`   用户: ${me.data.data.name}`);
      console.log('   ✅ 通过\n');
    } else {
      console.log(`   错误: ${me.data.message}`);
      console.log('   ❌ 失败\n');
    }
    
    // 5. 测试Dashboard统计数据
    console.log('5️⃣  测试Dashboard统计数据');
    console.log('   GET /api/dashboard/stats');
    const stats = await apiRequest('GET', '/api/dashboard/stats', null, authToken);
    console.log(`   状态码: ${stats.statusCode}`);
    if (stats.statusCode === 200) {
      const data = stats.data.data;
      console.log(`   总患者数: ${data.patientStats?.total_patients || 0}`);
      console.log(`   总评估数: ${data.assessmentStats?.total_assessments || 0}`);
      console.log('   ✅ 通过\n');
    } else {
      console.log(`   错误: ${stats.data.message}`);
      console.log('   ❌ 失败\n');
    }
    
    // 6. 测试实时数据
    console.log('6️⃣  测试实时数据');
    console.log('   GET /api/dashboard/realtime');
    const realtime = await apiRequest('GET', '/api/dashboard/realtime', null, authToken);
    console.log(`   状态码: ${realtime.statusCode}`);
    if (realtime.statusCode === 200) {
      const data = realtime.data.data;
      console.log(`   今日评估: ${data.todayData?.today_assessments || 0}`);
      console.log(`   待审核: ${data.todayData?.pending_reviews || 0}`);
      console.log('   ✅ 通过\n');
    } else {
      console.log(`   错误: ${realtime.data.message}`);
      console.log('   ❌ 失败\n');
    }
    
    // 7. 测试健康趋势
    console.log('7️⃣  测试健康趋势数据');
    console.log('   GET /api/dashboard/trends?days=7');
    const trends = await apiRequest('GET', '/api/dashboard/trends?days=7', null, authToken);
    console.log(`   状态码: ${trends.statusCode}`);
    if (trends.statusCode === 200) {
      const data = trends.data.data;
      console.log(`   评分趋势数据点: ${data.scoreTrend?.length || 0}`);
      console.log(`   风险趋势数据点: ${data.riskTrend?.length || 0}`);
      console.log('   ✅ 通过\n');
    } else {
      console.log(`   错误: ${trends.data.message}`);
      console.log('   ❌ 失败\n');
    }
    
    console.log('========================================');
    console.log('           测试完成');
    console.log('========================================');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
runTests();

