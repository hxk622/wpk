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
router.beforeEach((to, from, next) => {
  // 检查路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查本地存储中是否有token
    const token = localStorage.getItem('token');
    if (!token) {
      // 未登录，重定向到登录页
      next({ name: 'Login' });
    } else {
      // 已登录，继续访问
      next();
    }
  } else {
    // 不需要认证的路由，直接访问
    next();
  }
});

export default router;