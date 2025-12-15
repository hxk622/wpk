<template>
  <div class="profile">
    <!-- 页面标题 -->
    <van-nav-bar
      title="个人资料"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />

    <div class="profile-container">
      <!-- 用户基本信息 -->
      <div class="profile-header">
        <div class="profile-avatar">
          <van-image
            round
            :src="userProfile.avatar || defaultAvatar"
            width="80px"
            height="80px"
          />
          <div class="profile-avatar-edit">
            <van-icon name="plus" size="18" />
          </div>
        </div>
        <div class="profile-info">
          <h3 class="profile-name">{{ userProfile.username }}</h3>
          <p class="profile-email">{{ userProfile.email }}</p>
        </div>
      </div>

      <!-- 个人资料表单 -->
      <div class="profile-form">
        <van-cell-group inset>
          <van-field
            v-model="userProfile.username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            left-icon="contact"
            readonly
          />
          <van-field
            v-model="userProfile.email"
            name="email"
            label="邮箱"
            placeholder="请输入邮箱"
            left-icon="mail-o"
            readonly
          />
          <van-field
            v-model="userProfile.nickname"
            name="nickname"
            label="昵称"
            placeholder="请输入昵称"
            left-icon="label-o"
          />
          <van-field
            v-model="userProfile.bio"
            name="bio"
            label="个性签名"
            placeholder="请输入个性签名"
            left-icon="chat-o"
            type="textarea"
            rows="2"
            maxlength="100"
          />
        </van-cell-group>

        <!-- 统计信息 -->
        <div class="profile-stats">
          <van-cell-group inset>
            <van-cell title="游戏场次" :value="userStats.totalGames" />
            <van-cell title="获胜场次" :value="userStats.winGames" />
            <van-cell title="胜率" :value="`${userStats.winRate}%`" />
            <van-cell title="总盈利" :value="`${userStats.totalProfit} 筹码`" />
          </van-cell-group>
        </div>

        <!-- 更新按钮 -->
        <van-button
          type="primary"
          class="profile-update-btn"
          :loading="loading"
          @click="handleUpdate"
        >
          更新资料
        </van-button>

        <!-- 退出登录按钮 -->
        <van-button
          type="default"
          class="profile-logout-btn"
          @click="handleLogout"
        >
          退出登录
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import userApi from '../api/user';
import { showToast } from 'vant';

// 路由实例
const router = useRouter();
// 用户状态管理
const userStore = useUserStore();

// 默认头像
const defaultAvatar = 'https://img.yzcdn.cn/vant/cat.jpeg';

// 用户资料
const userProfile = reactive({
  username: '',
  email: '',
  nickname: '',
  bio: '',
  avatar: ''
});

// 用户统计信息
const userStats = reactive({
  totalGames: 0,
  winGames: 0,
  winRate: 0,
  totalProfit: 0
});

// 加载状态
const loading = ref(false);

// 返回按钮点击事件
const onClickLeft = () => {
  router.back();
};

// 获取用户资料
const getUserProfile = async () => {
  try {
    const response = await userApi.getProfile();
    if (response && response.user) {
      // 更新用户资料
      userProfile.username = response.user.username;
      userProfile.email = response.user.email;
      userProfile.nickname = response.user.nickname || '';
      userProfile.bio = response.user.bio || '';
      userProfile.avatar = response.user.avatar || '';

      // 更新用户统计
      if (response.user.stats) {
        userStats.totalGames = response.user.stats.totalGames || 0;
        userStats.winGames = response.user.stats.winGames || 0;
        userStats.winRate = response.user.stats.winRate || 0;
        userStats.totalProfit = response.user.stats.totalProfit || 0;
      }
    }
  } catch (error) {
    console.error('获取用户资料失败:', error);
    showToast('获取用户资料失败');
  }
};

// 更新用户资料
const handleUpdate = async () => {
  try {
    loading.value = true;

    // 调用更新资料API
    const response = await userApi.updateProfile({
      nickname: userProfile.nickname,
      bio: userProfile.bio
    });

    if (response && response.success) {
      showToast('资料更新成功');
      // 更新用户状态
      userStore.updateUser(response.user);
    } else {
      showToast(response?.message || '资料更新失败');
    }
  } catch (error) {
    console.error('更新用户资料失败:', error);
    showToast('资料更新失败');
  } finally {
    loading.value = false;
  }
};

// 退出登录
const handleLogout = () => {
  // 调用退出登录API
  userApi.logout();
  // 清除用户状态
  userStore.logout();
  // 跳转到登录页面
  router.push('/login');
  // 显示退出成功提示
  showToast('退出登录成功');
};

// 页面挂载时获取用户资料
onMounted(() => {
  getUserProfile();
});
</script>

<style scoped>
.profile {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.profile-container {
  padding: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.profile-avatar {
  position: relative;
  margin-right: 20px;
}

.profile-avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 26px;
  height: 26px;
  background-color: #1989fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border: 2px solid #fff;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.profile-email {
  font-size: 14px;
  color: #666;
}

.profile-form {
  margin-bottom: 20px;
}

.profile-stats {
  margin-top: 20px;
}

.profile-update-btn {
  width: 100%;
  margin-top: 20px;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
}

.profile-logout-btn {
  width: 100%;
  margin-top: 15px;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
  color: #ee0a24;
  border-color: #ee0a24;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .profile-container {
    padding: 10px;
  }
  
  .profile-header {
    padding: 15px;
    margin-bottom: 20px;
  }
  
  .profile-avatar img {
    width: 60px;
    height: 60px;
  }
  
  .profile-avatar-edit {
    width: 22px;
    height: 22px;
  }
  
  .profile-avatar-edit .van-icon {
    font-size: 14px;
  }
  
  .profile-name {
    font-size: 16px;
  }
  
  .profile-email {
    font-size: 13px;
  }
  
  .profile-stats {
    margin-top: 15px;
  }
  
  .profile-update-btn {
    margin-top: 15px;
    height: 40px;
    font-size: 15px;
  }
  
  .profile-logout-btn {
    margin-top: 10px;
    height: 40px;
    font-size: 15px;
  }
}
</style>