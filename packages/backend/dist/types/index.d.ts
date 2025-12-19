export interface AITrainingData {
    id?: string;
    userId: string;
    sessionId: string;
    holeCards: Card[];
    communityCards: Card[];
    handStrength: number;
    recommendedAction: string;
    actualAction: string;
    actionResult: string;
    contextData?: any;
    createdAt?: Date;
}
export interface AITrainingResult {
    success: boolean;
    message: string;
    trainingId?: string;
    metrics?: {
        accuracy: number;
        precision: number;
        recall: number;
        f1Score: number;
    };
}
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 用户ID
 *         username:
 *           type: string
 *           description: 用户名
 *         email:
 *           type: string
 *           description: 邮箱
 *         phone:
 *           type: string
 *           description: 手机号
 *         avatar:
 *           type: string
 *           description: 头像
 *         chips:
 *           type: number
 *           description: 筹码数量
 *         real_name_verified:
 *           type: boolean
 *           description: 实名认证状态
 *         verification_status:
 *           type: string
 *           enum: [pending, verified, rejected]
 *           description: 认证状态
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *       required:
 *         - id
 *         - username
 *         - chips
 *         - real_name_verified
 *         - verification_status
 *         - created_at
 *         - updated_at
 *
 *     RegisterUserInput:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: 用户名
 *         password:
 *           type: string
 *           description: 密码
 *         email:
 *           type: string
 *           description: 邮箱
 *         phone:
 *           type: string
 *           description: 手机号
 *       required:
 *         - username
 *         - password
 *
 *     LoginUserInput:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: 邮箱
 *         phone:
 *           type: string
 *           description: 手机号
 *         username:
 *           type: string
 *           description: 用户名
 *         password:
 *           type: string
 *           description: 密码
 *       required:
 *         - password
 */
export interface User {
    id: string;
    username: string;
    password_hash?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    balance: number;
    role: 'player' | 'admin' | 'guest';
    chips: number;
    real_name?: string;
    id_card?: string;
    id_card_photo_front?: string;
    id_card_photo_back?: string;
    real_name_verified: boolean;
    verification_status: 'pending' | 'verified' | 'rejected';
    verification_reason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface RegisterUserInput {
    username: string;
    password: string;
    email?: string;
    phone?: string;
}
export interface LoginUserInput {
    email?: string;
    phone?: string;
    username?: string;
    password: string;
}
/**
 * @swagger
 * components:
 *   schemas:
 *     GameRoom:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 房间ID
 *         name:
 *           type: string
 *           description: 房间名称
 *         owner_id:
 *           type: string
 *           description: 房主ID
 *         room_type:
 *           type: string
 *           enum: [public, private]
 *           description: 房间类型
 *         small_blind:
 *           type: number
 *           description: 小盲注
 *         big_blind:
 *           type: number
 *           description: 大盲注
 *         max_players:
 *           type: number
 *           description: 最大玩家数
 *         current_players:
 *           type: number
 *           description: 当前玩家数
 *         game_status:
 *           type: string
 *           enum: [waiting, playing, finished]
 *           description: 游戏状态
 *         min_buy_in:
 *           type: number
 *           description: 最小买入
 *         max_buy_in:
 *           type: number
 *           description: 最大买入
 *         table_type:
 *           type: string
 *           enum: [cash, tournament]
 *           description: 桌子类型
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *       required:
 *         - id
 *         - name
 *         - owner_id
 *         - room_type
 *         - small_blind
 *         - big_blind
 *         - max_players
 *         - current_players
 *         - game_status
 *         - table_type
 *         - created_at
 *         - updated_at
 *
 *     CreateRoomInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: 房间名称
 *         room_type:
 *           type: string
 *           enum: [public, private]
 *           description: 房间类型
 *         small_blind:
 *           type: number
 *           description: 小盲注
 *         big_blind:
 *           type: number
 *           description: 大盲注
 *         max_players:
 *           type: number
 *           description: 最大玩家数
 *         password:
 *           type: string
 *           description: 私人房间密码
 *         min_buy_in:
 *           type: number
 *           description: 最小买入
 *         max_buy_in:
 *           type: number
 *           description: 最大买入
 *         table_type:
 *           type: string
 *           enum: [cash, tournament]
 *           description: 桌子类型
 *       required:
 *         - name
 *         - room_type
 *         - small_blind
 *         - big_blind
 *         - max_players
 *         - table_type
 */
export interface GameRoom {
    id: string;
    name: string;
    owner_id: string;
    room_type: 'public' | 'private';
    small_blind: number;
    big_blind: number;
    max_players: number;
    current_players: number;
    game_status: 'waiting' | 'playing' | 'finished';
    password?: string;
    min_buy_in?: number;
    max_buy_in?: number;
    table_type: 'cash' | 'tournament';
    created_at: Date;
    updated_at: Date;
}
export interface CreateRoomInput {
    name: string;
    room_type: 'public' | 'private';
    small_blind: number;
    big_blind: number;
    max_players: number;
    password?: string;
    min_buy_in?: number;
    max_buy_in?: number;
    table_type: 'cash' | 'tournament';
}
export interface GameSession {
    id: string;
    room_id: string;
    dealer_id: string;
    pot: number;
    current_round: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
    status: 'in_progress' | 'finished';
    created_at: Date;
    finished_at?: Date;
}
/**
 * @swagger
 * components:
 *   schemas:
 *     PlayerSession:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 玩家牌局会话ID
 *         session_id:
 *           type: string
 *           description: 游戏会话ID
 *         player_id:
 *           type: string
 *           description: 玩家ID
 *         hole_cards:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Card'
 *           description: 玩家手牌
 *         chips_in_pot:
 *           type: number
 *           description: 玩家已投入底池的筹码
 *         chips_remaining:
 *           type: number
 *           description: 玩家剩余筹码
 *         status:
 *           type: string
 *           enum: [active, folded, all_in, out]
 *           description: 玩家状态
 *         position:
 *           type: string
 *           enum: [sb, bb, utg, mp, co, btn]
 *           description: 玩家位置
 *         seat_number:
 *           type: number
 *           description: 玩家座位编号
 *       required:
 *         - id
 *         - session_id
 *         - player_id
 *         - hole_cards
 *         - chips_in_pot
 *         - chips_remaining
 *         - status
 *         - position
 *         - seat_number
 */
export interface PlayerSession {
    id: string;
    session_id: string;
    player_id: string;
    hole_cards: Card[];
    chips_in_pot: number;
    chips_remaining: number;
    status: 'active' | 'folded' | 'all_in' | 'out';
    position: 'sb' | 'bb' | 'utg' | 'mp' | 'co' | 'btn';
    seat_number: number;
}
export interface Action {
    id: string;
    session_id: string;
    player_id: string;
    action_type: 'fold' | 'check' | 'call' | 'raise' | 'all_in';
    amount: number;
    round: 'preflop' | 'flop' | 'turn' | 'river';
    created_at: Date;
}
export interface GameAction {
    action_type: 'fold' | 'check' | 'call' | 'raise' | 'all_in';
    amount?: number;
}
/**
 * @swagger
 * components:
 *   schemas:
 *     Card:
 *       type: object
 *       properties:
 *         suit:
 *           type: string
 *           enum: [hearts, diamonds, clubs, spades]
 *           description: 卡牌花色
 *         rank:
 *           type: string
 *           enum: [2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A]
 *           description: 卡牌点数
 *       required:
 *         - suit
 *         - rank
 */
export interface Card {
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
    rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
}
export interface CommunityCards {
    id: string;
    session_id: string;
    flop: Card[];
    turn?: Card;
    river?: Card;
}
export interface AIAnalysis {
    id: string;
    session_id: string;
    user_id: string;
    hand_strength: number;
    pot_odds: number;
    recommended_action: string;
    confidence: number;
    created_at: Date;
}
export interface RealTimeAnalysisConfig {
    enabled: boolean;
    analysisInterval: number;
    style: 'gto' | 'professional';
    autoAnalyzeOnAction: boolean;
}
export interface AIAnalysisEvent extends WebSocketEvent {
    type: 'ai_analysis';
    data: {
        session_id: string;
        analysis: AIAnalysis;
        suggestion: AISuggestion;
    };
}
export interface RealTimeAnalysisToggleEvent extends WebSocketEvent {
    type: 'real_time_analysis_toggle';
    data: {
        enabled: boolean;
        style?: 'gto' | 'professional';
    };
}
export interface AISuggestion {
    id: string;
    session_id: string;
    user_id: string;
    style: 'gto' | 'professional';
    recommended_action: string;
    recommended_amount?: number;
    confidence: number;
    explanation: string;
    created_at: Date;
}
export interface AIActionRecommendation {
    action: 'fold' | 'check' | 'call' | 'raise' | 'all_in';
    amount?: number;
    reasoning: string;
    confidence: number;
}
export interface PaymentMethod {
    id: string;
    userId: string;
    methodType: 'wechat' | 'alipay' | 'bank_card';
    accountInfo: string;
    nickname?: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreatePaymentMethodInput {
    methodType: 'wechat' | 'alipay' | 'bank_card';
    accountInfo: string;
    nickname?: string;
    isDefault?: boolean;
}
export interface Transaction {
    id: string;
    userId: string;
    type: 'deposit' | 'withdraw' | 'game_win' | 'game_loss';
    amount: number;
    chipsChange: number;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    paymentMethodId?: string;
    gameSessionId?: string;
    description?: string;
    createdAt: Date;
    completedAt?: Date;
}
export interface RealNameVerificationRequest {
    realName: string;
    idCard: string;
    idCardPhotoFront: string;
    idCardPhotoBack: string;
}
export interface CheatDetection {
    id: string;
    userId: string;
    gameSessionId?: string;
    detectionType: 'bot_detection' | 'collusion' | 'abnormal_pattern' | 'multi_account';
    detectionScore: number;
    detectionTime: Date;
    status: 'pending' | 'confirmed' | 'dismissed';
    evidenceData?: any;
    actionTaken?: string;
    actionTime?: Date;
    createdAt: Date;
}
export interface UserWarning {
    id: string;
    userId: string;
    warningType: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
    issuedBy: 'system' | 'admin';
    issuedAt: Date;
    expiresAt?: Date;
    isResolved: boolean;
    resolvedBy?: string;
    resolvedAt?: Date;
    createdAt: Date;
}
export interface DepositInput {
    amount: number;
    paymentMethodId: string;
    description?: string;
}
export interface WithdrawInput {
    amount: number;
    paymentMethodId: string;
    description?: string;
}
export interface ChatMessage {
    id: string;
    userId: string;
    username?: string;
    message: string;
    roomId: string;
    timestamp: string;
    isPrivate?: boolean;
    recipientId?: string;
}
export interface Tournament {
    id: string;
    name: string;
    description: string;
    buy_in: number;
    prize_pool: number;
    max_players: number;
    current_players: number;
    status: 'registration' | 'in_progress' | 'completed' | 'cancelled';
    start_time: Date;
    end_time?: Date;
    blind_structure_id: string;
    created_at: Date;
    updated_at: Date;
}
export interface TournamentRound {
    id: string;
    tournament_id: string;
    round_number: number;
    small_blind: number;
    big_blind: number;
    duration: number;
    start_time?: Date;
    end_time?: Date;
    status: 'pending' | 'in_progress' | 'completed';
}
export interface TournamentRegistration {
    id: string;
    tournament_id: string;
    user_id: string;
    registration_time: Date;
    buy_in_paid: number;
    status: 'registered' | 'active' | 'eliminated' | 'won' | 'withdrawn';
}
export interface TournamentRanking {
    id: string;
    tournament_id: string;
    user_id: string;
    rank: number;
    prize: number;
    chips: number;
    eliminated_round?: number;
    eliminated_reason?: string;
}
export interface BlindStructure {
    id: string;
    name: string;
    description: string;
    levels: Array<{
        level: number;
        small_blind: number;
        big_blind: number;
        ante?: number;
        duration: number;
    }>;
}
/**
 * @swagger
 * components:
 *   schemas:
 *     FriendRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 请求ID
 *         from_user_id:
 *           type: string
 *           description: 发送者ID
 *         to_user_id:
 *           type: string
 *           description: 接收者ID
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *           description: 请求状态
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *       required:
 *         - id
 *         - from_user_id
 *         - to_user_id
 *         - status
 *         - created_at
 *         - updated_at
 *
 *     Friend:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 关系ID
 *         user_id:
 *           type: string
 *           description: 用户ID
 *         friend_id:
 *           type: string
 *           description: 好友ID
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *       required:
 *         - id
 *         - user_id
 *         - friend_id
 *         - created_at
 *         - updated_at
 *
 *     PrivateMessage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 消息ID
 *         sender_id:
 *           type: string
 *           description: 发送者ID
 *         receiver_id:
 *           type: string
 *           description: 接收者ID
 *         content:
 *           type: string
 *           description: 消息内容
 *         read:
 *           type: boolean
 *           description: 是否已读
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *       required:
 *         - id
 *         - sender_id
 *         - receiver_id
 *         - content
 *         - read
 *         - created_at
 *         - updated_at
 */
export interface FriendRequest {
    id: string;
    from_user_id: string;
    to_user_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: Date;
    updated_at: Date;
}
export interface Friend {
    id: string;
    user_id: string;
    friend_id: string;
    created_at: Date;
    updated_at: Date;
}
export interface PrivateMessage {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    read: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface WebSocketEvent {
    type: string;
    data: any;
}
export interface ChatMessageEvent extends WebSocketEvent {
    type: 'chat_message';
    data: ChatMessage;
}
export interface ChatHistoryEvent extends WebSocketEvent {
    type: 'chat_history';
    data: ChatMessage[];
}
export interface TournamentEvent extends WebSocketEvent {
    type: 'tournament_update';
    data: {
        tournament_id: string;
        status: string;
        update_type: 'registration' | 'start' | 'round_change' | 'elimination' | 'winner' | 'end';
        details?: any;
    };
}
export interface FriendRequestEvent extends WebSocketEvent {
    type: 'friend_request';
    data: FriendRequest;
}
export interface FriendRequestResponseEvent extends WebSocketEvent {
    type: 'friend_request_response';
    data: {
        request_id: string;
        status: 'accepted' | 'rejected';
        from_user_id: string;
        to_user_id: string;
    };
}
export interface PrivateMessageEvent extends WebSocketEvent {
    type: 'private_message';
    data: PrivateMessage;
}
