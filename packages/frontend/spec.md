# 德州扑克前端应用规格说明

## 1. 项目概述

本项目是一个基于 Vue 3 + Vite 开发的德州扑克游戏前端应用，提供完整的在线扑克游戏体验。应用采用现代化的技术栈和架构设计，支持实时游戏、用户认证、房间管理、聊天系统和AI辅助功能，并具备良好的移动端适配能力。

## 2. 功能需求

### 2.1 用户认证系统
- **注册**：支持用户名/邮箱注册，密码加密
- **登录**：支持用户名/邮箱登录，JWT 认证
- **个人资料**：查看和编辑个人信息
- **退出登录**：安全退出当前账号

### 2.2 房间管理
- **创建房间**：设置小盲注、大盲注、最大玩家数量、游戏模式等参数
- **房间列表**：浏览所有可用房间，显示房间状态、玩家数量、盲注等信息
- **加入房间**：选择并加入现有房间
- **房间详情**：查看房间内玩家列表、聊天记录等信息

### 2.3 游戏核心功能
- **游戏流程**：完整的德州扑克游戏流程，包括发牌、下注、翻牌、转牌、河牌、摊牌
- **玩家行动**：支持弃牌(Fold)、跟注(Call)、加注(Raise)、全下(All-in)等操作
- **牌局结算**：自动计算获胜者，分配筹码
- **游戏状态**：实时显示当前游戏阶段、玩家行动、筹码数量等信息

### 2.4 实时通信
- **WebSocket 连接**：建立长连接实现实时通信
- **游戏状态同步**：所有玩家的游戏状态实时同步
- **玩家行动广播**：玩家的行动即时通知所有其他玩家

### 2.5 聊天系统
- **房间聊天**：在游戏房间内发送和接收消息
- **消息历史**：查看聊天记录
- **消息格式**：支持文本消息

### 2.6 AI 辅助功能
- **手牌强度分析**：分析当前手牌的强度
- **获胜概率**：计算当前手牌的获胜概率
- **操作建议**：基于当前牌局情况给出操作建议
- **实时分析**：支持开关控制的实时分析功能
- **建议强度**：可调节的建议强度设置

## 3. 技术规格

### 3.1 技术栈
- **框架**：Vue 3 (Composition API, `<script setup>`)
- **构建工具**：Vite
- **状态管理**：Pinia
- **路由**：Vue Router
- **UI 组件库**：Vant 4.x
- **HTTP 请求**：Axios
- **WebSocket**：原生 WebSocket API
- **样式**：CSS3 + PostCSS

### 3.2 项目结构
```
src/
├── api/           # API 请求封装
│   ├── axios.js   # Axios 配置
│   ├── user.js    # 用户相关 API
│   ├── room.js    # 房间相关 API
│   ├── game.js    # 游戏相关 API
│   ├── ai.js      # AI 相关 API
│   └── socket.js  # WebSocket 配置
├── assets/        # 静态资源
├── components/    # 通用组件
├── plugins/       # 插件配置
│   └── vant.js    # Vant 组件库配置
├── router/        # 路由配置
│   └── index.js   # 路由定义
├── stores/        # 状态管理
│   ├── user.js    # 用户状态
│   └── game.js    # 游戏状态
├── views/         # 页面组件
│   ├── LoginView.vue        # 登录页
│   ├── RegisterView.vue     # 注册页
│   ├── HomeView.vue         # 首页
│   ├── RoomsView.vue        # 房间列表页
│   ├── CreateRoomView.vue   # 创建房间页
│   ├── RoomDetailView.vue   # 房间详情页
│   ├── GameView.vue         # 游戏页
│   ├── ProfileView.vue      # 个人资料页
│   └── AiAssistantView.vue  # AI 助手页
├── App.vue        # 根组件
├── main.js        # 入口文件
└── style.css      # 全局样式
```

### 3.3 浏览器兼容性
- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)
- 移动端浏览器：iOS Safari, Chrome Mobile

### 3.4 移动端适配
- 支持屏幕宽度：320px - 480px
- 响应式布局设计
- 触摸友好的交互

## 4. 接口定义

### 4.1 用户相关接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/user/profile` - 获取用户资料
- `PUT /api/user/profile` - 更新用户资料
- `POST /api/auth/logout` - 用户退出

### 4.2 房间相关接口
- `GET /api/rooms` - 获取房间列表
- `POST /api/rooms` - 创建房间
- `GET /api/rooms/:id` - 获取房间详情
- `POST /api/rooms/:id/join` - 加入房间
- `POST /api/rooms/:id/leave` - 离开房间

### 4.3 游戏相关接口
- `GET /api/games/:id` - 获取游戏状态
- `POST /api/games/:id/start` - 开始游戏
- `POST /api/games/:id/action` - 玩家行动
- `GET /api/games/:id/history` - 获取游戏历史
- `GET /api/games/:id/stats` - 获取游戏统计

### 4.4 AI 相关接口
- `POST /api/games/:id/ai/analysis` - 请求 AI 分析

### 4.5 WebSocket 事件
- `connect` - 连接建立
- `disconnect` - 连接断开
- `game:update` - 游戏状态更新
- `player:action` - 玩家行动
- `chat:message` - 聊天消息
- `room:join` - 玩家加入房间
- `room:leave` - 玩家离开房间

## 5. 数据结构

### 5.1 用户信息
```javascript
{
  id: Number,           // 用户 ID
  username: String,     // 用户名
  email: String,        // 邮箱
  nickname: String,     // 昵称
  avatar: String,       // 头像 URL
  bio: String,          // 个性签名
  chips: Number,        // 筹码数量
  stats: {
    totalGames: Number, // 总游戏场次
    winGames: Number,   // 获胜场次
    winRate: Number,    // 胜率
    totalProfit: Number // 总盈利
  }
}
```

### 5.2 房间信息
```javascript
{
  id: Number,           // 房间 ID
  name: String,         // 房间名称
  smallBlind: Number,   // 小盲注
  bigBlind: Number,     // 大盲注
  maxPlayers: Number,   // 最大玩家数量
  gameMode: String,     // 游戏模式 (no_limit, limit, pot_limit)
  status: String,       // 房间状态 (waiting, playing)
  allowSpectators: Boolean, // 是否允许观看
  players: Array,       // 当前玩家列表
  createdAt: Date       // 创建时间
}
```

### 5.3 游戏状态
```javascript
{
  id: Number,           // 游戏 ID
  roomId: Number,       // 所属房间 ID
  status: String,       // 游戏状态 (waiting, preflop, flop, turn, river, showdown)
  round: Number,        // 当前轮次
  dealerPosition: Number, // 庄家位置
  currentPlayer: Number, // 当前行动玩家
  pot: Number,          // 底池大小
  communityCards: Array, // 公共牌
  players: [            // 玩家列表
    {
      id: Number,       // 玩家 ID
      position: Number, // 座位位置
      cards: Array,     // 手牌
      chips: Number,    // 剩余筹码
      bet: Number,      // 当前轮次下注
      isActive: Boolean, // 是否在游戏中
      isAllIn: Boolean, // 是否全下
      action: String    // 最近行动
    }
  ],
  currentBet: Number,   // 当前最大下注
  minRaise: Number,     // 最小加注金额
  lastAction: String    // 最后行动
}
```

### 5.4 AI 分析结果
```javascript
{
  handStrength: Number, // 手牌强度 (0-100)
  winningChance: Number, // 获胜概率 (0-100)
  recommendedAction: String, // 推荐操作 (fold, call, raise, allin)
  handRank: String,     // 手牌组合名称
  explanation: String,  // 分析说明
  confidence: Number    // 分析置信度 (0-100)
}
```

## 6. UI/UX 设计

### 6.1 设计原则
- **简洁直观**：界面设计简洁明了，操作流程直观
- **响应式**：适配不同屏幕尺寸
- **一致性**：统一的设计语言和交互模式
- **可用性**：符合用户习惯的交互设计

### 6.2 主要页面设计

#### 6.2.1 登录/注册页
- 简洁的表单设计
- 清晰的错误提示
- 密码可见性切换
- 注册/登录快速切换

#### 6.2.2 房间列表页
- 卡片式房间列表
- 显示关键房间信息（状态、玩家数量、盲注）
- 下拉刷新和上拉加载
- 创建房间入口

#### 6.2.3 游戏页面
- 圆形游戏桌布局
- 玩家座位显示
- 公共牌区域
- 手牌显示
- 下注控制区域
- AI 分析结果显示
- 游戏历史记录

#### 6.2.4 个人资料页
- 用户信息展示
- 资料编辑表单
- 游戏统计信息
- 退出登录按钮

## 7. 性能要求

### 7.1 加载性能
- 首屏加载时间 < 2 秒
- 资源懒加载
- 缓存策略

### 7.2 运行性能
- 游戏状态更新响应时间 < 100ms
- 流畅的动画效果 (60fps)
- 低内存占用

### 7.3 网络性能
- WebSocket 连接稳定
- 数据传输优化
- 离线提示和重连机制

## 8. 安全要求

### 8.1 数据安全
- 密码加密存储
- JWT 认证令牌管理
- 敏感数据传输加密

### 8.2 应用安全
- XSS 防护
- CSRF 防护
- 输入验证
- 错误信息处理

## 9. 测试要求

### 9.1 功能测试
- 用户认证流程测试
- 房间管理功能测试
- 游戏核心逻辑测试
- 聊天系统测试
- AI 辅助功能测试

### 9.2 兼容性测试
- 多浏览器兼容性测试
- 移动端设备兼容性测试

### 9.3 性能测试
- 页面加载性能测试
- 游戏性能测试
- 压力测试

## 10. 部署要求

### 10.1 构建配置
- 生产环境优化
- 代码压缩
- 资源哈希

### 10.2 部署方式
- 静态文件部署
- CDN 支持
- 容器化部署 (可选)

## 11. 维护与更新

### 11.1 版本管理
- 语义化版本控制
- 版本更新日志

### 11.2 错误监控
- 前端错误监控
- 用户行为分析

### 11.3 文档维护
- 代码注释
- API 文档
- 技术文档

---

规格说明版本：1.0.0
更新日期：2023-10-25
