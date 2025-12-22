import { createRouter, createWebHistory } from 'vue-router';

// 路由配置
const routes = [
  {    path: '/',    name: 'Home',    component: () => import('../views/HomeView.vue'),    meta: { requiresAuth: true }  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rooms',
    name: 'Rooms',
    component: () => import('../views/RoomsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/create-room',
    name: 'CreateRoom',
    component: () => import('../views/CreateRoomView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/room/:id',
    name: 'RoomDetail',
    component: () => import('../views/RoomDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/game/:id',
    name: 'Game',
    component: () => import('../views/GameView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ai-assistant',
    name: 'AiAssistant',
    component: () => import('../views/AiAssistantView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/game-history',
    name: 'GameHistory',
    component: () => import('../views/GameHistoryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/log-test',
    name: 'LogTest',
    component: () => import('../views/LogTestView.vue')
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 检查路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查本地存储中是否有token
    const token = localStorage.getItem('token');
    if (!token) {
      // 未登录，重定向到登录页
      next({ name: 'Login' });
      return;
    }
    
    // 已登录，检查用户当前是否在房间中
    if (to.name !== 'RoomDetail' && to.name !== 'Game') {
      try {
        // 动态导入roomApi，避免循环依赖
        const { default: roomApi } = await import('../api/room');
        const response = await roomApi.getUserCurrentRoom();
        
        // 如果用户当前在房间中，重定向到房间详情页
        if (response && response.data && response.data.roomId) {
          next({ name: 'RoomDetail', params: { id: response.data.roomId } });
          return;
        }
      } catch (error) {
        console.error('检查用户当前房间失败:', error);
        // 检查失败，继续访问原路由
      }
    }
    
    // 已登录且不在房间中，或已经在房间相关页面，继续访问
    next();
  } else {
    // 不需要认证的路由，直接访问
    next();
  }
});

export default router;