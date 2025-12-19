import axios from 'axios';
import { logger } from '../utils/logger';

// 创建axios实例
const api = axios.create({
  // 基础URL
  baseURL: '/api',
  // 请求超时时间
  timeout: 10000,
  // 请求头配置
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从本地存储获取token
    const token = localStorage.getItem('token');
    // 如果有token，添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 记录API请求日志
    logger.apiRequest(config.method.toUpperCase(), config.url, config.data);
    
    return config;
  },
  (error) => {
    // 请求错误处理
    if (error.config) {
      logger.apiError(error.config.method?.toUpperCase(), error.config.url, error.message);
    } else {
      logger.error('API请求配置错误', error);
    }
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 记录API响应日志
    logger.apiResponse(response.config.method.toUpperCase(), response.config.url, response.data, response.status);
    
    // 处理后端返回的code、data、message三元组结构
    const { code, data, message } = response.data;
    
    // 如果code不是成功码（假设0为成功码），则抛出错误
    if (code !== 0) {
      const error = new Error(message || '请求失败');
      error.code = code;
      error.data = data;
      return Promise.reject(error);
    }
    
    // 只返回data部分
    return data;
  },
  (error) => {
    // 响应错误处理
    if (error.response) {
      // 请求已发出，服务器返回状态码不在2xx范围内
      const { code, data, message } = error.response.data || {};
      logger.apiError(
        error.config.method.toUpperCase(), 
        error.config.url, 
        { status: error.response.status, code, data, message }
      );
      
      // 401未授权，清除token并跳转到登录页
      if (error.response.status === 401 || code === 401) {
        logger.warn('用户未授权，清除token并跳转到登录页');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      // 包装错误信息
      const apiError = new Error(message || `请求失败: ${error.response.status}`);
      apiError.code = code || error.response.status;
      apiError.data = data;
      apiError.status = error.response.status;
      return Promise.reject(apiError);
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      logger.error('网络错误: 未收到服务器响应', error.request);
      const networkError = new Error('网络错误: 未收到服务器响应');
      networkError.code = -1;
      return Promise.reject(networkError);
    } else {
      // 请求配置错误
      logger.error('请求错误: 配置错误', error.message);
      return Promise.reject(error);
    }
  }
);

export default api;