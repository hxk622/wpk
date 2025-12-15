import { Pool } from 'pg';
import dotenv from 'dotenv';
import loggerService from './loggerService';

dotenv.config();

// 创建数据库连接池
const pool = new Pool({
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
    loggerService.info('数据库连接成功');
    client.release();
  })
  .catch(err => {
    loggerService.error('数据库连接失败:', { error: err.message });
  });

export default pool;
