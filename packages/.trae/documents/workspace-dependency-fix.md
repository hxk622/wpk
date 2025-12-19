# 工作区依赖问题解决方案

## 问题分析

在后端执行 `npm install` 时遇到以下错误：

```
npm warn workspaces poker-backend in filter set, but no workspace folder present 
npm error code EUNSUPPORTEDPROTOCOL 
npm error Unsupported URL Type "workspace:": workspace:* 
npm error A complete log of this run can be found in: /Users/xingkaihan/.npm/_logs/2025-12-19T04_15_11_233Z-debug-0.log
```

**原因**：项目使用了 `pnpm` 工作区功能，后端的 `package.json` 中依赖 `@poker/shared` 包时使用了 `workspace:*` 语法，而 `npm` 不支持这种语法。

## 解决方案

### 方案一：使用 pnpm 包管理器（推荐）

pnpm 是支持工作区功能的包管理器，建议使用 pnpm 来安装依赖和启动服务。

#### 步骤 1：安装 pnpm

```bash
# 全局安装 pnpm
npm install -g pnpm
```

#### 步骤 2：在项目根目录安装依赖

```bash
cd /Users/xingkaihan/Documents/Code/wpk
pnpm install
```

#### 步骤 3：启动前后端服务

```bash
# 启动所有服务
pnpm run dev:all

# 或分别启动
pnpm run dev:backend
pnpm run dev:frontend
```

### 方案二：修改依赖声明（不推荐）

如果不想使用 pnpm，可以修改后端的 `package.json`，将工作区依赖改为相对路径依赖。

#### 步骤 1：修改后端 package.json

```bash
cd /Users/xingkaihan/Documents/Code/wpk/packages/backend
```

编辑 `package.json` 文件，将：

```json
"@poker/shared": "workspace:*"
```

改为：

```json
"@poker/shared": "file:../shared"
```

#### 步骤 2：构建 shared 包

```bash
cd /Users/xingkaihan/Documents/Code/wpk/packages/shared
npm install
npm run build
```

#### 步骤 3：安装后端依赖

```bash
cd /Users/xingkaihan/Documents/Code/wpk/packages/backend
npm install
```

#### 步骤 4：启动服务

```bash
# 启动后端
npm run dev

# 启动前端
cd /Users/xingkaihan/Documents/Code/wpk/packages/frontend
npm install
npm run dev
```

## 方案三：使用 Docker Compose（推荐用于生产环境）

项目提供了 `docker-compose.yml` 文件，可以使用 Docker 快速启动所有服务（包括数据库和 Redis）。

#### 步骤 1：安装 Docker

请访问 [Docker 官方网站](https://www.docker.com/get-started) 下载并安装 Docker Desktop。

#### 步骤 2：启动 Docker Compose

```bash
cd /Users/xingkaihan/Documents/Code/wpk/packages/backend
docker-compose up -d
```

#### 步骤 3：访问服务

- 后端 API：`http://localhost:3000`
- 前端应用：`http://localhost:5173`

## 常见问题排查

### 1. pnpm install 速度慢

可以尝试使用国内镜像：

```bash
pnpm config set registry https://registry.npmmirror.com
```

### 2. 数据库连接失败

确保 PostgreSQL 和 Redis 服务正在运行，并且 `.env` 文件中的配置正确。

### 3. 前后端通信失败

检查前端 `vite.config.js` 中的代理配置是否正确，确保前端请求能够正确转发到后端。

## 总结

推荐使用 **方案一**（pnpm）来处理工作区依赖问题，这是项目设计时所采用的方式。如果您遇到任何问题，请参考上述解决方案或查看项目文档获取更多信息。