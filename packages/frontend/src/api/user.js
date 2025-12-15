import api from './axios';

// 用户API服务
const userApi = {
  // 用户注册
  register: (userData) => {
    return api.post('/users/register', userData);
  },

  // 用户登录
  login: (credentials) => {
    return api.post('/users/login', credentials);
  },

  // 获取用户资料
  getProfile: () => {
    return api.get('/users/profile');
  },

  // 更新用户资料
  updateProfile: (userData) => {
    return api.put('/users/profile', userData);
  },

  // 获取用户统计数据
  getStats: () => {
    return api.get('/users/stats');
  }
};

export default userApi;