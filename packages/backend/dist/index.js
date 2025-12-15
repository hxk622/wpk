"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.websocketService = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./config/swagger"));
const errorHandler_1 = require("./middlewares/errorHandler");
// 加载环境变量
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
// 导入数据库和缓存服务
require("./services/database");
require("./services/redis");
const dbInit_1 = __importDefault(require("./services/dbInit"));
// 初始化数据库（非阻塞式）
(0, dbInit_1.default)().then(() => {
    loggerService_1.default.info('数据库初始化完成');
}).catch((err) => {
    loggerService_1.default.error('数据库初始化失败:', { error: err });
    loggerService_1.default.warn('服务器将在没有数据库的情况下继续运行');
});
// 创建Express应用
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
// 基础中间件
const helmet_1 = __importDefault(require("helmet"));
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 导入日志中间件
const loggerMiddleware_1 = require("./middlewares/loggerMiddleware");
const loggerService_1 = __importDefault(require("./services/loggerService"));
// 使用请求上下文中间件
app.use(loggerMiddleware_1.requestContextMiddleware);
// 使用API日志中间件
app.use(loggerMiddleware_1.apiLoggerMiddleware);
// 导入速率限制中间件
const rateLimitMiddleware_1 = require("./middlewares/rateLimitMiddleware");
// 使用速率限制中间件
app.use(rateLimitMiddleware_1.rateLimitMiddleware);
// 健康检查端点
app.get('/ping', (req, res) => {
    res.json({
        message: 'Poker后端服务运行正常！',
        timestamp: new Date().toISOString()
    });
});
// Swagger API文档
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
// 添加Swagger JSON文档端点
app.get('/api/swagger-docs', (req, res) => {
    res.json(swagger_1.default);
});
// API路由
// 导入用户、房间、游戏、账户等API路由
const users_1 = __importDefault(require("./routes/users"));
const rooms_1 = __importDefault(require("./routes/rooms"));
const games_1 = __importDefault(require("./routes/games"));
const ai_1 = __importDefault(require("./routes/ai"));
const accounts_1 = __importDefault(require("./routes/accounts"));
const security_1 = __importDefault(require("./routes/security"));
const tournaments_1 = __importDefault(require("./routes/tournaments"));
const social_1 = __importDefault(require("./routes/social"));
app.use('/api/users', users_1.default);
app.use('/api/rooms', rooms_1.default);
app.use('/api/games', games_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/accounts', accounts_1.default);
app.use('/api/security', security_1.default);
app.use('/api/tournaments', tournaments_1.default);
app.use('/api/social', social_1.default);
// 导入WebSocket服务
const websocketService_1 = __importDefault(require("./services/websocketService"));
const websocketInstance_1 = require("./services/websocketInstance");
// 初始化WebSocket服务
const websocketService = new websocketService_1.default(server);
exports.websocketService = websocketService;
// 设置WebSocket服务实例供其他模块使用
(0, websocketInstance_1.setWebSocketService)(websocketService);
// 404路由处理
app.use(errorHandler_1.notFoundHandler);
// 全局异常处理中间件
app.use(errorHandler_1.errorHandler);
// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    loggerService_1.default.info('服务器已启动', { port: PORT, date: new Date().toISOString() });
    // 自测代码
    setTimeout(() => {
        const WebSocket = require('ws');
        const testSocket = new WebSocket(`ws://localhost:${PORT}`);
        testSocket.on('open', () => {
            loggerService_1.default.info('服务器自我WebSocket连接测试成功');
            testSocket.close();
        });
        testSocket.on('error', (err) => {
            loggerService_1.default.error('WebSocket自测失败:', { error: err.message });
        });
    }, 1000);
});
//# sourceMappingURL=index.js.map