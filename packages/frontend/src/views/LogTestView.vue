<template>
  <div class="log-test-container">
    <h1>日志测试页面</h1>
    <p>点击以下按钮测试不同级别的日志输出：</p>
    
    <div class="button-group">
      <van-button type="primary" @click="testDebugLog">测试 DEBUG 日志</van-button>
      <van-button type="info" @click="testInfoLog">测试 INFO 日志</van-button>
      <van-button type="warning" @click="testWarnLog">测试 WARN 日志</van-button>
      <van-button type="danger" @click="testErrorLog">测试 ERROR 日志</van-button>
    </div>
    
    <div class="button-group">
      <van-button type="success" @click="testApiRequest">测试 API 请求日志</van-button>
      <van-button type="success" @click="testApiResponse">测试 API 响应日志</van-button>
      <van-button type="success" @click="testApiError">测试 API 错误日志</van-button>
    </div>
    
    <div class="button-group">
      <van-button type="primary" @click="testRealApiCall">测试真实 API 调用</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Button as VanButton } from 'vant';
import { logger } from '../utils/logger';
import api from '../api/axios';

// 测试 DEBUG 日志
const testDebugLog = () => {
  logger.debug('这是一条 DEBUG 日志', { message: '测试信息', number: 123 });
  console.log('DEBUG 日志测试按钮已点击');
};

// 测试 INFO 日志
const testInfoLog = () => {
  logger.info('这是一条 INFO 日志', { user: 'testuser', action: 'click' });
  console.log('INFO 日志测试按钮已点击');
};

// 测试 WARN 日志
const testWarnLog = () => {
  logger.warn('这是一条 WARN 日志', { warning: '潜在问题', level: 'medium' });
  console.log('WARN 日志测试按钮已点击');
};

// 测试 ERROR 日志
const testErrorLog = () => {
  logger.error('这是一条 ERROR 日志', { error: '系统错误', code: 500 });
  console.log('ERROR 日志测试按钮已点击');
};

// 测试 API 请求日志
const testApiRequest = () => {
  logger.apiRequest('GET', '/test/api', { param: 'value' });
  console.log('API 请求日志测试按钮已点击');
};

// 测试 API 响应日志
const testApiResponse = () => {
  logger.apiResponse('GET', '/test/api', { data: 'test response' }, 200);
  console.log('API 响应日志测试按钮已点击');
};

// 测试 API 错误日志
const testApiError = () => {
  logger.apiError('GET', '/test/api', { status: 404, message: 'Not Found' });
  console.log('API 错误日志测试按钮已点击');
};

// 测试真实 API 调用
const testRealApiCall = async () => {
  try {
    console.log('准备发起真实 API 调用...');
    // 调用一个简单的 API 端点
    const response = await api.get('/users/profile');
    console.log('API 调用成功:', response);
  } catch (error) {
    console.log('API 调用失败:', error);
  }
};
</script>

<style scoped>
.log-test-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

p {
  margin-bottom: 20px;
  text-align: center;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.van-button {
  margin: 5px;
}
</style>