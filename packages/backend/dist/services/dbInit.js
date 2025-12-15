"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./database"));
const loggerService_1 = __importDefault(require("./loggerService"));
// 数据库初始化脚本
const initializeDatabase = async () => {
    try {
        // 创建用户表
        await database_1.default.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20) UNIQUE,
        avatar VARCHAR(255),
        chips INT NOT NULL DEFAULT 10000,
        real_name VARCHAR(50), -- 真实姓名（实名认证）
        id_card VARCHAR(20), -- 身份证号（实名认证）
        id_card_photo_front VARCHAR(255), -- 身份证正面照片
        id_card_photo_back VARCHAR(255), -- 身份证反面照片
        real_name_verified BOOLEAN NOT NULL DEFAULT false, -- 实名认证状态
        verification_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, verified, rejected
        verification_reason VARCHAR(255), -- 认证拒绝原因
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
        // 创建游戏房间表
        await database_1.default.query(`
      CREATE TABLE IF NOT EXISTS game_rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        owner_id UUID REFERENCES users(id),
        room_type VARCHAR(20) NOT NULL DEFAULT 'public', -- public, private
        small_blind INT NOT NULL DEFAULT 10,
        big_blind INT NOT NULL DEFAULT 20,
        max_players INT NOT NULL DEFAULT 9,
        current_players INT NOT NULL DEFAULT 0,
        game_status VARCHAR(20) NOT NULL DEFAULT 'waiting', -- waiting, playing, finished
        password VARCHAR(255), -- 哈希后的私人房间密码
        min_buy_in INT, -- 最小买入
        max_buy_in INT, -- 最大买入
        table_type VARCHAR(20) NOT NULL DEFAULT 'cash', -- cash, tournament
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
        // 创建牌局表
        await database_1.default.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id UUID REFERENCES game_rooms(id),
        start_time TIMESTAMP NOT NULL DEFAULT NOW(),
        end_time TIMESTAMP,
        winner_id UUID REFERENCES users(id),
        pot_amount INT NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'in_progress' -- in_progress, finished
      );
    `);
        // 创建玩家牌局关联表
        await database_1.default.query(`
      CREATE TABLE IF NOT EXISTS session_players (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES game_sessions(id),
        user_id UUID REFERENCES users(id),
        seat_number INT NOT NULL DEFAULT 0,
        chips INT NOT NULL DEFAULT 0,
        bet_amount INT NOT NULL DEFAULT 0,
        hand VARCHAR(20), -- 玩家手牌，格式如 "A♠K♦"
        is_active BOOLEAN NOT NULL DEFAULT true,
        is_winner BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
        // 创建游戏动作表
        await database_1.default.query(`
      CREATE TABLE IF NOT EXISTS game_actions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES game_sessions(id),
        user_id UUID REFERENCES users(id),
        action_type VARCHAR(50) NOT NULL, -- fold, check, call, bet, raise, all_in
        amount INT NOT NULL DEFAULT 0,
        action_time TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
        // 创建AI分析表
        await database_1.default.query(`
      CREATE TABLE IF NOT EXISTS ai_analyses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES game_sessions(id),
        user_id UUID REFERENCES users(id),
        hand_strength DECIMAL(5, 2),
        pot_odds DECIMAL(5, 2),
        recommended_action VARCHAR(50), -- fold, check, call, bet, raise, all_in
        confidence DECIMAL(5, 2),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
        // 创建AI训练数据表
        await database_1.default.query(`
      CREATE TABLE IF NOT EXISTS ai_training_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NULL,
        session_id UUID REFERENCES game_sessions(id) NULL,
        hole_cards JSONB NOT NULL,
        community_cards JSONB NOT NULL,
        hand_strength DECIMAL(5, 2) NOT NULL,
        actual_action VARCHAR(50) NOT NULL,
        recommended_action VARCHAR(50) NOT NULL,
        action_result VARCHAR(50) NOT NULL,
        context_data JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
        // 创建用户统计数据表
        await database_1.default.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) UNIQUE,
        total_games INT NOT NULL DEFAULT 0,
        total_wins INT NOT NULL DEFAULT 0,
        total_losses INT NOT NULL DEFAULT 0,
        total_chips_won INT NOT NULL DEFAULT 0,
        total_chips_lost INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
        // 创建支付方式表
        await database_1.default.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        method_type VARCHAR(50) NOT NULL, -- wechat, alipay, bank_card
        account_info VARCHAR(255) NOT NULL, -- 支付账号信息（加密存储）
        nickname VARCHAR(255), -- 支付方式昵称
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
        // 创建交易记录表
        await database_1.default.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        type VARCHAR(50) NOT NULL, -- deposit, withdraw, game_win, game_loss
        amount INT NOT NULL,
        chips_change INT NOT NULL, -- 筹码变动
        status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, completed, failed, cancelled
        payment_method_id UUID REFERENCES payment_methods(id),
        game_session_id UUID REFERENCES game_sessions(id),
        description VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP
      );
    `);
        // 创建反作弊检测表
        await database_1.default.query(`
      CREATE TABLE IF NOT EXISTS cheat_detections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        game_session_id UUID REFERENCES game_sessions(id),
        detection_type VARCHAR(50) NOT NULL, -- bot_detection, collusion, abnormal_pattern, multi_account
        detection_score DECIMAL(5, 2) NOT NULL, -- 检测分数(0-100)
        detection_time TIMESTAMP NOT NULL DEFAULT NOW(),
        status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, confirmed, dismissed
        evidence_data JSONB, -- 证据数据（JSON格式）
        action_taken VARCHAR(50), -- 采取的措施
        action_time TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
        // 创建用户警告表
        await database_1.default.query(`
      CREATE TABLE IF NOT EXISTS user_warnings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        warning_type VARCHAR(50) NOT NULL, -- cheating, offensive_language, rule_violation, etc.
        reason VARCHAR(255) NOT NULL,
        severity VARCHAR(20) NOT NULL, -- low, medium, high
        issued_by VARCHAR(50) NOT NULL, -- system, admin
        issued_at TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP,
        is_resolved BOOLEAN NOT NULL DEFAULT false,
        resolved_by VARCHAR(50),
        resolved_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
        // 创建好友请求表
        await database_1.default.query(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        from_user_id UUID REFERENCES users(id),
        to_user_id UUID REFERENCES users(id),
        status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(from_user_id, to_user_id)
      );
    `);
        // 创建好友关系表
        await database_1.default.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        friend_id UUID REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, friend_id)
      );
    `);
        // 创建私信表
        await database_1.default.query(`
      CREATE TABLE IF NOT EXISTS private_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID REFERENCES users(id),
        receiver_id UUID REFERENCES users(id),
        content TEXT NOT NULL,
        read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
        loggerService_1.default.info('数据库初始化完成');
    }
    catch (error) {
        loggerService_1.default.error('数据库初始化失败:', { error });
        throw error;
    }
};
// 执行数据库初始化
if (require.main === module) {
    initializeDatabase().catch(error => loggerService_1.default.error('数据库初始化未捕获异常:', { error }));
}
exports.default = initializeDatabase;
//# sourceMappingURL=dbInit.js.map