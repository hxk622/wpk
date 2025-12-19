# 前端技术设计文档

## 1. 前端架构设计

### 1.1 整体架构
前端采用分层架构设计，清晰分离不同职责的代码，提高代码的可维护性和可扩展性：

```
┌─────────────────────────────────────────────────────────────────┐
│                        视图层 (View Layer)                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │    页面组件      │  │    业务组件      │  │    通用组件      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       状态管理层 (State Layer)                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │    Pinia Store   │  │    组合式函数    │  │    响应式数据    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       业务逻辑层 (Service Layer)                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │    API服务       │  │  WebSocket服务   │  │    工具函数      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       基础设施层 (Infrastructure Layer)          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │    Axios配置     │  │ Socket.io配置   │  │    路由配置      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈
| 技术/框架 | 版本 | 用途 |
|-----------|------|------|
| Vue | 3.3.x | 前端框架 |
| Vite | 4.4.x | 构建工具 |
| TypeScript | 5.0.x | 类型系统 |
| Pinia | 2.1.x | 状态管理 |
| Vue Router | 4.2.x | 路由管理 |
| Axios | 1.5.x | HTTP客户端 |
| Socket.io-client | 4.7.x | WebSocket通信 |
| Vant | 4.8.x | UI组件库 |
| Day.js | 1.11.x | 日期时间处理 |
| Lodash | 4.17.x | 工具函数库 |

## 2. 项目结构

```
├── src/
│   ├── assets/           # 静态资源（图片、字体等）
│   ├── components/       # 组件
│   │   ├── common/       # 通用组件
│   │   ├── business/     # 业务组件
│   │   └── game/         # 游戏相关组件
│   ├── composables/      # 组合式函数
│   ├── config/           # 配置文件
│   ├── layouts/          # 布局组件
│   ├── pages/            # 页面组件
│   │   ├── auth/         # 认证相关页面
│   │   ├── game/         # 游戏相关页面
│   │   ├── user/         # 用户相关页面
│   │   └── ai/           # AI分析相关页面
│   ├── router/           # 路由配置
│   ├── services/         # 服务层
│   │   ├── api/          # API服务
│   │   ├── socket/       # WebSocket服务
│   │   └── utils/        # 工具函数
│   ├── stores/           # Pinia状态管理
│   ├── styles/           # 样式文件
│   │   ├── variables.scss# 变量定义
│   │   ├── mixins.scss   # 混合样式
│   │   └── global.scss   # 全局样式
│   ├── types/            # TypeScript类型定义
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── index.html            # HTML模板
├── vite.config.ts        # Vite配置
├── tsconfig.json         # TypeScript配置
└── package.json          # 项目依赖
```

## 3. 状态管理设计

### 3.1 Pinia Store设计
采用Pinia进行状态管理，将不同业务领域的状态分离到不同的Store中：

| Store名称 | 职责 |
|-----------|------|
| `userStore` | 用户信息、认证状态管理 |
| `gameStore` | 游戏状态、房间信息管理 |
| `roomStore` | 房间列表、创建/加入房间管理 |
| `aiStore` | AI分析结果、历史数据管理 |
| `chatStore` | 聊天消息、好友关系管理 |

### 3.2 Store示例

```typescript
// stores/userStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoggedIn = computed(() => !!token.value)

  // 操作
  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const logout = () => {
    userInfo.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    setUserInfo,
    setToken,
    logout
  }
})
```

## 4. 路由管理设计

### 4.1 路由结构
采用Vue Router进行路由管理，路由结构清晰，支持嵌套路由和路由守卫：

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/Home.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        { path: 'login', name: 'login', component: () => import('@/pages/auth/Login.vue') },
        { path: 'register', name: 'register', component: () => import('@/pages/auth/Register.vue') },
        { path: 'forgot-password', name: 'forgotPassword', component: () => import('@/pages/auth/ForgotPassword.vue') }
      ],
      meta: { requiresAuth: false }
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        { path: 'rooms', name: 'roomList', component: () => import('@/pages/game/RoomList.vue'), meta: { requiresAuth: true } },
        { path: 'room/:id', name: 'gameRoom', component: () => import('@/pages/game/GameRoom.vue'), meta: { requiresAuth: true } },
        { path: 'history', name: 'gameHistory', component: () => import('@/pages/game/GameHistory.vue'), meta: { requiresAuth: true } }
      ]
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        { path: 'profile', name: 'userProfile', component: () => import('@/pages/user/Profile.vue'), meta: { requiresAuth: true } },
        { path: 'friends', name: 'userFriends', component: () => import('@/pages/user/Friends.vue'), meta: { requiresAuth: true } },
        { path: 'settings', name: 'userSettings', component: () => import('@/pages/user/Settings.vue'), meta: { requiresAuth: true } }
      ]
    },
    {
      path: '/ai',
      name: 'ai',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        { path: 'analysis', name: 'aiAnalysis', component: () => import('@/pages/ai/Analysis.vue'), meta: { requiresAuth: true } },
        { path: 'history', name: 'aiHistory', component: () => import('@/pages/ai/AnalysisHistory.vue'), meta: { requiresAuth: true } }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('@/pages/NotFound.vue')
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth === true

  if (requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
```

### 4.2 路由守卫
- **全局守卫**：验证用户登录状态，保护需要认证的路由
- **组件内守卫**：在特定组件中处理路由进入和离开逻辑
- **导航守卫**：处理导航错误和取消导航

## 5. 组件设计

### 5.1 组件分类
- **通用组件**：按钮、输入框、卡片、弹窗等基础组件，不依赖业务逻辑
- **业务组件**：用户信息卡、房间卡片等与业务相关的组件
- **游戏组件**：扑克牌、筹码、玩家信息面板等游戏专用组件

### 5.2 组件设计原则
- **单一职责**：每个组件只负责一个功能
- **可复用性**：设计通用组件时考虑复用性
- **可维护性**：组件结构清晰，命名规范
- **性能优化**：合理使用`v-once`、`v-memo`等指令优化渲染性能
- **类型安全**：使用TypeScript定义组件的props和emits

### 5.3 游戏组件示例

```typescript
// components/game/PokerCard.vue
<template>
  <div 
    class="poker-card" 
    :class="{ 'flipped': flipped }"
    @click="$emit('click')"
  >
    <div class="card-front">
      <div class="card-rank">{{ rank }}</div>
      <div class="card-suit" :class="suit.toLowerCase()">{{ suitSymbol }}</div>
    </div>
    <div class="card-back"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  rank: string
  suit: 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades'
  flipped?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  flipped: false
})

defineEmits(['click'])

const suitSymbol = computed(() => {
  const symbols = {
    Hearts: '♥',
    Diamonds: '♦',
    Clubs: '♣',
    Spades: '♠'
  }
  return symbols[props.suit]
})
</script>

<style scoped>
.poker-card {
  width: 80px;
  height: 112px;
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.poker-card.flipped {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.card-front {
  background-color: white;
  border: 1px solid #ccc;
}

.card-back {
  background-color: #3498db;
  transform: rotateY(180deg);
  background-image: repeating-linear-gradient(45deg, #2980b9, #2980b9 10px, #3498db 10px, #3498db 20px);
}

.card-rank {
  font-size: 18px;
  margin-bottom: 8px;
}

.card-suit {
  font-size: 32px;
}

.card-suit.hearts,
.card-suit.diamonds {
  color: #e74c3c;
}

.card-suit.clubs,
.card-suit.spades {
  color: #333;
}
</style>
```

## 6. API集成设计

### 6.1 Axios配置

```typescript
// services/api/axiosConfig.ts
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

// 创建Axios实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      // 可以添加重定向到登录页面的逻辑
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

### 6.2 API服务封装

```typescript
// services/api/userApi.ts
import apiClient from './axiosConfig'
import type { UserInfo, LoginRequest, RegisterRequest } from '@/types/user'

export const userApi = {
  // 登录
  login(data: LoginRequest) {
    return apiClient.post<{ token: string; user: UserInfo }>('/auth/login', data)
  },

  // 注册
  register(data: RegisterRequest) {
    return apiClient.post<{ token: string; user: UserInfo }>('/auth/register', data)
  },

  // 获取用户信息
  getUserInfo() {
    return apiClient.get<UserInfo>('/user/info')
  },

  // 更新用户信息
  updateUserInfo(data: Partial<UserInfo>) {
    return apiClient.put<UserInfo>('/user/info', data)
  },

  // 上传头像
  uploadAvatar(formData: FormData) {
    return apiClient.post<{ avatarUrl: string }>('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}
```

## 7. WebSocket设计

### 7.1 WebSocket连接管理

```typescript
// services/socket/socketService.ts
import { io, type Socket } from 'socket.io-client'
import { useUserStore } from '@/stores/userStore'

class SocketService {
  private socket: Socket | null = null

  // 连接WebSocket
  connect() {
    const userStore = useUserStore()
    if (!userStore.token) {
      console.error('Cannot connect to WebSocket without token')
      return
    }

    this.socket = io(import.meta.env.VITE_WS_BASE_URL || 'http://localhost:3000', {
      auth: {
        token: userStore.token
      },
      transports: ['websocket'],
      timeout: 5000
    })

    // 监听连接事件
    this.socket.on('connect', () => {
      console.log('WebSocket connected')
    })

    // 监听断开连接事件
    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      // 可以添加重连逻辑
    })

    // 监听连接错误事件
    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })
  }

  // 断开WebSocket连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // 发送消息
  emit(event: string, data?: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data)
    } else {
      console.error('WebSocket not connected')
    }
  }

  // 监听消息
  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  // 移除监听
  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  // 获取连接状态
  isConnected() {
    return this.socket?.connected || false
  }
}

export default new SocketService()
```

### 7.2 游戏相关WebSocket事件

| 事件名称 | 方向 | 描述 |
|---------|------|------|
| `room:join` | 客户端 → 服务器 | 加入游戏房间 |
| `room:leave` | 客户端 → 服务器 | 离开游戏房间 |
| `game:action` | 客户端 → 服务器 | 执行游戏操作（下注、跟注等） |
| `room:update` | 服务器 → 客户端 | 房间信息更新 |
| `game:state` | 服务器 → 客户端 | 游戏状态更新 |
| `game:action` | 服务器 → 客户端 | 其他玩家游戏操作 |
| `game:result` | 服务器 → 客户端 | 游戏结果通知 |
| `chat:message` | 双向 | 聊天消息 |

## 8. 安全性设计

### 8.1 认证与授权
- 使用JWT令牌进行身份认证
- 令牌存储在localStorage中，定期刷新
- 路由守卫保护需要认证的路由
- API请求自动携带令牌

### 8.2 数据安全
- 使用HTTPS协议传输数据
- 敏感数据加密存储
- 输入验证和过滤，防止XSS攻击
- API请求参数验证

### 8.3 其他安全措施
- 防止CSRF攻击
- 限制请求频率，防止暴力攻击
- 定期清理无用的Cookie和localStorage数据
- 使用内容安全策略(CSP)防止恶意脚本注入

## 9. 性能优化

### 9.1 资源优化
- 使用Vite进行构建优化，包括代码分割、按需加载
- 图片优化：使用WebP格式，懒加载，适当压缩
- 字体优化：使用字体子集，预加载关键字体
- 第三方库按需引入

### 9.2 渲染优化
- 使用`v-once`、`v-memo`等指令优化静态内容渲染
- 合理使用`computed`和`watch`，避免不必要的计算和渲染
- 使用`keep-alive`缓存组件，减少重新渲染
- 虚拟滚动处理长列表

### 9.3 网络优化
- API请求合并和防抖
- 使用缓存减少重复请求
- WebSocket连接复用
- CDN加速静态资源

### 9.4 代码优化
- 减少组件层级，优化组件结构
- 使用组合式API替代选项式API，减少性能开销
- 避免在模板中使用复杂表达式
- 合理使用事件总线，避免事件泄漏

## 10. 测试策略

### 10.1 测试类型
- **单元测试**：测试单个组件、函数的功能
- **集成测试**：测试组件之间的交互
- **E2E测试**：测试完整的用户流程

### 10.2 测试工具
- **Vitest**：单元测试和集成测试
- **Playwright**：E2E测试
- **Vue Test Utils**：Vue组件测试

### 10.3 测试覆盖率目标
- 核心功能测试覆盖率 ≥ 90%
- 组件测试覆盖率 ≥ 80%
- API服务测试覆盖率 ≥ 85%

## 11. 开发流程

### 11.1 代码规范
- 使用ESLint进行代码质量检查
- 使用Prettier进行代码格式化
- 遵循Vue 3最佳实践
- 使用TypeScript保证类型安全

### 11.2 提交规范
- 使用Conventional Commits规范
- 提交前运行lint和test命令
- 代码评审机制

### 11.3 构建与部署
- 使用Vite构建生产版本
- CI/CD流程自动化构建和部署
- 多环境配置（开发、测试、生产）

## 12. 未来规划

### 12.1 技术迭代
- 升级Vue 3.4+版本，使用最新特性
- 探索使用Vite 5+版本
- 考虑使用Nuxt.js进行全栈开发

### 12.2 功能扩展
- 支持更多游戏类型
- 增强AI分析功能
- 添加更多社交功能
- 支持移动端APP开发（使用Capacitor或Tauri）

### 12.3 性能优化
- 探索使用WebAssembly优化游戏逻辑
- 使用Service Worker实现离线功能
- 优化首屏加载速度
