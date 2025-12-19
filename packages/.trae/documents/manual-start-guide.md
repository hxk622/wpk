# 手动启动前后端服务指南

## 环境要求

在开始之前，请确保您已经安装了以下软件：

- **Node.js** (v16或更高版本)
- **npm** 或 **pnpm** (包管理工具)
- **PostgreSQL** (v14或更高版本)
- **Redis** (v7或更高版本)

## 1. 数据库配置

### 1.1 创建PostgreSQL数据库

1. 启动PostgreSQL服务
2. 使用psql或pgAdmin创建数据库：

```sql
CREATE DATABASE texas_holdem;
```

3. 确保数据库用户有足够的权限：

```sql
GRANT ALL PRIVILEGES ON DATABASE texas_holdem TO postgres;
```

### 1.2 启动Redis服务

确保Redis服务正在运行，可以使用以下命令检查：

```bash
redis-cli ping
```

如果返回`PONG`，表示Redis服务正常运行。

## 2. 依赖安装

### 2.1 安装根目录依赖

```bash
cd /Users/xingkaihan/Documents/Code/wpk
npm install
```

### 2.2 安装后端依赖

```bash
cd /Users/xingkaihan/Documents/Code/wpk/packages/backend
npm install
```

### 2.3 安装前端依赖

```bash
cd /Users/xingkaihan/Documents/Code/wpk/packages/frontend
npm install
```

## 3. 环境变量配置

### 3.1 后端环境变量

后端已经创建了`.env`文件，配置如下：

```
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=texas_holdem
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
```

如果您的数据库或Redis配置不同，请修改相应的环境变量。

## 4. 启动服务

### 4.1 启动后端服务

```bash
cd /Users/xingkaihan/Documents/Code/wpk/packages/backend
npm run dev
```

后端服务将在`http://localhost:3000`启动。

您可以通过访问`http://localhost:3000/ping`来验证后端服务是否正常运行，应该返回：

```json
{
  "message": "Poker后端服务运行正常！",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 4.2 启动前端服务

```bash
cd /Users/xingkaihan/Documents/Code/wpk/packages/frontend
npm run dev
```

前端服务将在`http://localhost:5173`启动，并自动打开浏览器。

## 5. 浏览器测试流程

### 5.1 访问前端应用

打开浏览器访问：`http://localhost:5173`

预期结果：看到应用首页，显示登录/注册选项

### 5.2 注册新用户

1. 点击"注册"按钮
2. 填写注册信息并提交
3. 预期结果：注册成功，跳转到登录页面

### 5.3 登录应用

1. 使用注册的账号登录
2. 预期结果：登录成功，跳转到房间列表页面

### 5.4 创建房间

1. 点击"创建房间"按钮
2. 设置房间参数
3. 点击"创建房间"按钮
4. 预期结果：房间创建成功，跳转到游戏房间页面

### 5.5 测试房间列表

1. 返回房间列表页面
2. 预期结果：能看到刚才创建的房间，显示正确的房间信息

## 6. 验证前后端通信

1. 检查浏览器控制台，确认没有网络错误
2. 查看后端日志，确认API请求被正确处理
3. 预期结果：前后端通信正常，没有404或500错误

## 7. 常见问题排查

### 7.1 数据库连接失败

- 确认PostgreSQL服务正在运行
- 检查`.env`文件中的数据库配置是否正确
- 确保数据库用户有足够的权限

### 7.2 Redis连接失败

- 确认Redis服务正在运行
- 检查`.env`文件中的Redis配置是否正确

### 7.3 前端无法访问后端API

- 确认后端服务正在运行
- 检查前端`vite.config.js`中的代理配置是否正确
- 确认浏览器控制台没有CORS错误

### 7.4 服务启动失败

- 检查是否有端口冲突
- 确认所有依赖都已正确安装
- 查看服务启动日志，定位具体错误信息

## 8. 停止服务

要停止服务，只需在相应的终端窗口中按`Ctrl + C`即可。

## 9. 其他测试命令

### 9.1 后端测试

```bash
cd /Users/xingkaihan/Documents/Code/wpk/packages/backend
npm test
```

### 9.2 前端测试

```bash
cd /Users/xingkaihan/Documents/Code/wpk/packages/frontend
npm test
```

### 9.3 构建生产版本

#### 后端

```bash
cd /Users/xingkaihan/Documents/Code/wpk/packages/backend
npm run build
```

#### 前端

```bash
cd /Users/xingkaihan/Documents/Code/wpk/packages/frontend
npm run build
```

## 10. 项目文档

- **PRD**: `/Users/xingkaihan/Documents/Code/wpk/prd.md`
- **UI设计**: `/Users/xingkaihan/Documents/Code/wpk/ui-design.md`
- **前端技术文档**: `/Users/xingkaihan/Documents/Code/wpk/tech-frontend.md`
- **后端技术文档**: `/Users/xingkaihan/Documents/Code/wpk/tech-backend.md`
- **测试计划**: `/Users/xingkaihan/Documents/Code/wpk/test-plan.md`
- **项目README**: `/Users/xingkaihan/Documents/Code/wpk/readme.md`

如果您在启动过程中遇到任何问题，请参考上述文档或查看项目代码以获取更多信息。