import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

// 加载环境变量
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 导入数据库和缓存服务
import './services/database';
import './services/redis';
import initializeDatabase from './services/dbInit';

// 初始化数据库（非阻塞式）
initializeDatabase().then(() => {
  loggerService.info('数据库初始化完成');
}).catch((err) => {
  loggerService.error('数据库初始化失败:', { error: err });
  loggerService.warn('服务器将在没有数据库的情况下继续运行');
});

// 创建Express应用
const app = express();
const server = http.createServer(app);

// 基础中间件
import helmet from 'helmet';
app.use(helmet());
app.use(cors());
app.use(express.json());

// 导入日志中间件
import { requestContextMiddleware, apiLoggerMiddleware } from './middlewares/loggerMiddleware';
import loggerService from './services/loggerService';

// 使用请求上下文中间件
app.use(requestContextMiddleware);

// 使用API日志中间件
app.use(apiLoggerMiddleware);

// 导入速率限制中间件
import { rateLimitMiddleware } from './middlewares/rateLimitMiddleware';

// 使用速率限制中间件
app.use(rateLimitMiddleware);

// 健康检查端点
app.get('/ping', (req, res) => {
  res.json({ 
    message: 'Poker后端服务运行正常！',
    timestamp: new Date().toISOString()
  });
});

// Swagger API文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 添加Swagger JSON文档端点
app.get('/api/swagger-docs', (req, res) => {
  res.json(swaggerSpec);
});

// API路由
// 导入用户、房间、游戏、账户等API路由
import usersRouter from './routes/users';
import roomsRouter from './routes/rooms';
import gamesRouter from './routes/games';
import aiRouter from './routes/ai';
import accountsRouter from './routes/accounts';
import securityRouter from './routes/security';
import tournamentsRouter from './routes/tournaments';
import socialRouter from './routes/social';

app.use('/api/users', usersRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/games', gamesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/security', securityRouter);
app.use('/api/tournaments', tournamentsRouter);
app.use('/api/social', socialRouter);

// 导入WebSocket服务
import WebSocketService from './services/websocketService';
import { setWebSocketService } from './services/websocketInstance';

// 初始化WebSocket服务
const websocketService = new WebSocketService(server);

// 设置WebSocket服务实例供其他模块使用
setWebSocketService(websocketService);

// 404路由处理
app.use(notFoundHandler);

// 全局异常处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  loggerService.info('服务器已启动', { port: PORT, date: new Date().toISOString() });
  
  // 自测代码
  setTimeout(() => {
    const WebSocket = require('ws');
    const testSocket = new WebSocket(`ws://localhost:${PORT}`);
    
    testSocket.on('open', () => {
      loggerService.info('服务器自我WebSocket连接测试成功');
      testSocket.close();
    });
    
    testSocket.on('error', (err: any) => {
      loggerService.error('WebSocket自测失败:', { error: err.message });
    });
  }, 1000);
});

export { app, server, websocketService };