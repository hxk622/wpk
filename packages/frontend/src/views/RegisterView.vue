<template>
  <div class="register">
    <div class="register-container">
      <div class="register-header">
        <h2 class="register-title">德州扑克</h2>
        <p class="register-subtitle">创建新账号</p>
      </div>

      <div class="register-form">
        <!-- 注册表单 -->
        <van-cell-group inset>
          <van-field
            v-model="registerForm.username"
            name="username"
            label="用户名"
            placeholder="请输入用户名（6-20位字符）"
            left-icon="contact"
            :rules="[{ required: true, message: '请输入用户名' }]"
          />
          <van-field
            v-model="registerForm.email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱地址"
            left-icon="mail-o"
            :rules="[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]"
          />
          <van-field
            v-model="registerForm.password"
            name="password"
            label="密码"
            type="password"
            placeholder="请输入密码（至少6位）"
            left-icon="locked"
            :rules="[{ required: true, message: '请输入密码' }]"
            :show-password="showPassword"
            right-icon="eye-o"
            @click-right-icon="showPassword = !showPassword"
          />
          <van-field
            v-model="registerForm.confirmPassword"
            name="confirmPassword"
            label="确认密码"
            type="password"
            placeholder="请再次输入密码"
            left-icon="locked"
            :rules="[{ required: true, message: '请确认密码' }]"
            :show-password="showConfirmPassword"
            right-icon="eye-o"
            @click-right-icon="showConfirmPassword = !showConfirmPassword"
          />
        </van-cell-group>

        <!-- 注册按钮 -->
        <van-button
          type="primary"
          class="register-btn"
          :loading="loading"
          @click="handleRegister"
        >
          注册
        </van-button>

        <!-- 登录链接 -->
        <div class="register-login">
          <span>已有账号？</span>
          <router-link to="/login">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import userApi from '../api/user';
import { showToast } from 'vant';
import { logger } from '../utils/logger';

// 路由实例
const router = useRouter();

// 注册表单数据
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// 显示密码状态
const showPassword = ref(false);
const showConfirmPassword = ref(false);
// 加载状态
const loading = ref(false);

// 处理注册
const handleRegister = async () => {
  try {
    logger.info('开始注册尝试', { username: registerForm.username, email: registerForm.email });
    
    // 表单验证
    if (!registerForm.username.trim()) {
      showToast('请输入用户名');
      logger.warn('注册验证失败：未输入用户名');
      return;
    }
    if (registerForm.username.length < 6 || registerForm.username.length > 20) {
      showToast('用户名长度必须在6-20位之间');
      logger.warn('注册验证失败：用户名长度不符合要求', { username: registerForm.username });
      return;
    }
    if (!registerForm.email.trim()) {
      showToast('请输入邮箱');
      logger.warn('注册验证失败：未输入邮箱');
      return;
    }
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/.test(registerForm.email)) {
      showToast('邮箱格式不正确');
      logger.warn('注册验证失败：邮箱格式不正确', { email: registerForm.email });
      return;
    }
    if (!registerForm.password.trim()) {
      showToast('请输入密码');
      logger.warn('注册验证失败：未输入密码');
      return;
    }
    if (registerForm.password.length < 6) {
      showToast('密码长度不能少于6位');
      logger.warn('注册验证失败：密码长度不足');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      showToast('两次输入的密码不一致');
      logger.warn('注册验证失败：两次输入的密码不一致');
      return;
    }

    // 设置加载状态
    loading.value = true;
    logger.debug('注册验证通过，准备调用API');

    // 调用注册API
    const response = await userApi.register({ 
      username: registerForm.username, 
      email: registerForm.email, 
      password: registerForm.password 
    });

    // 注册成功
    showToast('注册成功');
    logger.info('注册成功', { username: registerForm.username, email: registerForm.email });
    // 跳转到登录页面
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  } catch (error) {
    logger.error('注册失败', { error, username: registerForm.username, email: registerForm.email });
    // 处理API错误信息
    if (error.message) {
      showToast(error.message);
    } else if (error.response && error.response.data && error.response.data.message) {
      showToast(error.response.data.message);
    } else {
      showToast('注册失败，请稍后重试');
    }
  } finally {
    // 重置加载状态
    loading.value = false;
    logger.debug('注册流程结束');
  }
};
</script>

<style scoped>
.register {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-container {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.register-subtitle {
  font-size: 14px;
  color: #666;
}

.register-form {
  width: 100%;
}

.register-btn {
  width: 100%;
  margin-top: 20px;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
}

.register-login {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.register-login a {
  color: #1989fa;
  text-decoration: none;
}

.register-login a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .register {
    padding: 20px 15px;
  }
  
  .register-container {
    padding: 20px;
  }
  
  .register-header {
    margin-bottom: 20px;
  }
  
  .register-title {
    font-size: 22px;
  }
  
  .register-subtitle {
    font-size: 13px;
  }
  
  .register-btn {
    margin-top: 15px;
    height: 40px;
    font-size: 15px;
  }
  
  .register-login {
    margin-top: 15px;
    font-size: 13px;
  }
}
</style>