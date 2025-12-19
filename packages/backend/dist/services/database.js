"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const loggerService_1 = __importDefault(require("./loggerService"));
dotenv_1.default.config();
// 创建数据库连接池
const pool = new pg_1.Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'texas_holdem',
    max: 20, // 最大连接数
    idleTimeoutMillis: 30000, // 空闲连接超时时间
    connectionTimeoutMillis: 2000, // 连接超时时间
});
// 测试数据库连接
pool.connect()
    .then(client => {
    loggerService_1.default.info('数据库连接成功');
    client.release();
})
    .catch(err => {
    loggerService_1.default.error('数据库连接失败:', { error: err.message });
});
exports.default = pool;
//# sourceMappingURL=database.js.map