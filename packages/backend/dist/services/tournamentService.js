"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tournamentService = exports.TournamentService = void 0;
const websocketInstance_1 = require("./websocketInstance");
const loggerService_1 = __importDefault(require("./loggerService"));
const postgreSQLTournamentDAO_1 = require("../dao/impl/postgreSQLTournamentDAO");
const postgreSQLUserDAO_1 = require("../dao/impl/postgreSQLUserDAO");
// 初始化DAO实例
const tournamentDAO = new postgreSQLTournamentDAO_1.PostgreSQLTournamentDAO();
const tournamentRegistrationDAO = new postgreSQLTournamentDAO_1.PostgreSQLTournamentRegistrationDAO();
const tournamentRankingDAO = new postgreSQLTournamentDAO_1.PostgreSQLTournamentRankingDAO();
const blindStructureDAO = new postgreSQLTournamentDAO_1.PostgreSQLBlindStructureDAO();
/**
 * 锦标赛服务类
 */
class TournamentService {
    constructor() {
        this.tournamentTimers = new Map();
    }
    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!TournamentService.instance) {
            TournamentService.instance = new TournamentService();
        }
        return TournamentService.instance;
    }
    /**
     * 创建新的锦标赛
     * @param tournamentData 锦标赛数据
     * @returns 创建的锦标赛
     */
    async createTournament(tournamentData) {
        // 设置默认当前玩家数为0
        const tournamentToCreate = {
            ...tournamentData,
            current_players: 0
        };
        const tournament = await tournamentDAO.create(tournamentToCreate);
        loggerService_1.default.tournamentEvent('Tournament created', tournament.id, undefined, tournament);
        return tournament;
    }
    /**
     * 注册参加锦标赛
     * @param tournamentId 锦标赛ID
     * @param userId 用户ID
     * @returns 注册信息
     */
    async registerForTournament(tournamentId, userId) {
        // 检查锦标赛是否存在且状态为registration
        const tournament = await tournamentDAO.getById(tournamentId);
        if (!tournament) {
            throw new Error('锦标赛不存在');
        }
        if (tournament.status !== 'registration') {
            throw new Error('锦标赛当前不接受注册');
        }
        if (tournament.current_players >= tournament.max_players) {
            throw new Error('锦标赛已满员');
        }
        // 检查用户是否已注册
        const existingRegistration = await tournamentRegistrationDAO.getByTournamentAndUserId(tournamentId, userId);
        if (existingRegistration) {
            throw new Error('您已注册该锦标赛');
        }
        // 检查用户筹码是否足够支付买入费
        const user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(userId);
        if (!user) {
            throw new Error('用户不存在');
        }
        if (user.chips < tournament.buy_in) {
            throw new Error('筹码不足，无法支付买入费');
        }
        // 扣减用户筹码
        await postgreSQLUserDAO_1.postgreSQLUserDAO.update(userId, {
            chips: user.chips - tournament.buy_in
        });
        // 注册锦标赛
        const registration = await tournamentRegistrationDAO.create({
            tournament_id: tournamentId,
            user_id: userId,
            registration_time: new Date(),
            buy_in_paid: tournament.buy_in,
            status: 'registered'
        });
        // 更新锦标赛当前玩家数
        await tournamentDAO.update(tournamentId, {
            current_players: tournament.current_players + 1,
            prize_pool: tournament.prize_pool + tournament.buy_in
        });
        // 发送WebSocket通知
        this.sendTournamentUpdate(tournamentId, {
            status: 'registration',
            update_type: 'registration',
            details: {
                userId,
                playerCount: tournament.current_players + 1
            }
        });
        loggerService_1.default.tournamentEvent('User registered for tournament', tournamentId, userId, {
            registrationId: registration.id
        });
        return registration;
    }
    /**
     * 取消锦标赛注册
     * @param tournamentId 锦标赛ID
     * @param userId 用户ID
     * @returns 是否成功取消
     */
    async cancelTournamentRegistration(tournamentId, userId) {
        // 检查锦标赛状态
        const tournament = await tournamentDAO.getById(tournamentId);
        if (!tournament) {
            throw new Error('锦标赛不存在');
        }
        if (tournament.status !== 'registration') {
            throw new Error('锦标赛已开始或已结束，无法取消注册');
        }
        // 检查注册信息
        const registration = await tournamentRegistrationDAO.getByTournamentAndUserId(tournamentId, userId);
        if (!registration) {
            throw new Error('您未注册该锦标赛');
        }
        // 退还买入费
        const user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(userId);
        if (user) {
            await postgreSQLUserDAO_1.postgreSQLUserDAO.update(userId, {
                chips: user.chips + registration.buy_in_paid
            });
        }
        // 删除注册信息
        await tournamentRegistrationDAO.delete(registration.id);
        // 更新锦标赛当前玩家数
        await tournamentDAO.update(tournamentId, {
            current_players: tournament.current_players - 1,
            prize_pool: tournament.prize_pool - registration.buy_in_paid
        });
        // 发送WebSocket通知
        this.sendTournamentUpdate(tournamentId, {
            status: 'registration',
            update_type: 'registration',
            details: {
                userId,
                playerCount: tournament.current_players - 1
            }
        });
        loggerService_1.default.tournamentEvent('User cancelled tournament registration', tournamentId, userId);
        return true;
    }
    /**
     * 开始锦标赛
     * @param tournamentId 锦标赛ID
     * @returns 更新后的锦标赛
     */
    async startTournament(tournamentId) {
        const tournament = await tournamentDAO.getById(tournamentId);
        if (!tournament) {
            throw new Error('锦标赛不存在');
        }
        if (tournament.status !== 'registration') {
            throw new Error('锦标赛已开始或已结束');
        }
        if (tournament.current_players < 2) {
            throw new Error('锦标赛至少需要2名玩家才能开始');
        }
        // 更新锦标赛状态
        const updatedTournament = await tournamentDAO.update(tournamentId, {
            status: 'in_progress',
            start_time: new Date()
        });
        // 更新所有注册玩家的状态为active
        const registrations = await tournamentRegistrationDAO.getByTournamentId(tournamentId);
        for (const registration of registrations) {
            await tournamentRegistrationDAO.updateRegistrationStatus(registration.id, 'active');
        }
        // 发送WebSocket通知
        this.sendTournamentUpdate(tournamentId, {
            status: 'in_progress',
            update_type: 'start'
        });
        // 设置轮次定时器
        this.startTournamentRounds(tournamentId);
        loggerService_1.default.tournamentEvent('Tournament started', tournamentId, undefined, {
            playerCount: tournament.current_players
        });
        return updatedTournament;
    }
    /**
     * 开始锦标赛轮次
     * @param tournamentId 锦标赛ID
     */
    async startTournamentRounds(tournamentId) {
        const tournament = await tournamentDAO.getById(tournamentId);
        if (!tournament) {
            throw new Error('锦标赛不存在');
        }
        const blindStructure = await blindStructureDAO.getById(tournament.blind_structure_id);
        if (!blindStructure) {
            throw new Error('盲注结构不存在');
        }
        // 为每一轮设置定时器
        blindStructure.levels.forEach((level, index) => {
            const delay = index === 0 ? 0 :
                blindStructure.levels.slice(0, index).reduce((total, l) => total + l.duration, 0) * 1000;
            const timer = setTimeout(async () => {
                await this.startTournamentLevel(tournamentId, level.level);
                // 如果是最后一轮，结束锦标赛
                if (index === blindStructure.levels.length - 1) {
                    await this.endTournament(tournamentId);
                }
            }, delay);
            this.tournamentTimers.set(`${tournamentId}_level_${level.level}`, timer);
        });
    }
    /**
     * 开始锦标赛特定轮次
     * @param tournamentId 锦标赛ID
     * @param level 轮次级别
     */
    async startTournamentLevel(tournamentId, level) {
        // 发送轮次开始通知
        this.sendTournamentUpdate(tournamentId, {
            status: 'in_progress',
            update_type: 'round_change',
            details: {
                level
            }
        });
        loggerService_1.default.tournamentEvent('Tournament level started', tournamentId, undefined, {
            level
        });
    }
    /**
     * 淘汰玩家
     * @param tournamentId 锦标赛ID
     * @param userId 用户ID
     * @param eliminatedRound 淘汰轮次
     * @param eliminatedReason 淘汰原因
     */
    async eliminatePlayer(tournamentId, userId, eliminatedRound, eliminatedReason) {
        // 更新玩家注册状态
        const registration = await tournamentRegistrationDAO.getByTournamentAndUserId(tournamentId, userId);
        if (!registration) {
            throw new Error('玩家未注册该锦标赛');
        }
        await tournamentRegistrationDAO.updateRegistrationStatus(registration.id, 'eliminated');
        // 发送淘汰通知
        this.sendTournamentUpdate(tournamentId, {
            status: 'in_progress',
            update_type: 'elimination',
            details: {
                userId,
                eliminatedRound,
                eliminatedReason
            }
        });
        // 检查是否只剩一名玩家
        const activePlayers = await tournamentRegistrationDAO.getByTournamentId(tournamentId);
        const remainingActivePlayers = activePlayers.filter(p => p.status === 'active').length;
        if (remainingActivePlayers === 1) {
            // 只剩一名玩家，结束锦标赛
            await this.endTournament(tournamentId);
        }
        loggerService_1.default.tournamentEvent('Player eliminated', tournamentId, userId, {
            eliminatedRound,
            eliminatedReason
        });
    }
    /**
     * 结束锦标赛
     * @param tournamentId 锦标赛ID
     */
    async endTournament(tournamentId) {
        const tournament = await tournamentDAO.getById(tournamentId);
        if (!tournament) {
            throw new Error('锦标赛不存在');
        }
        if (tournament.status !== 'in_progress') {
            throw new Error('锦标赛未在进行中');
        }
        // 清除所有定时器
        this.tournamentTimers.forEach((timer, key) => {
            if (key.startsWith(tournamentId)) {
                clearTimeout(timer);
                this.tournamentTimers.delete(key);
            }
        });
        // 更新锦标赛状态
        const updatedTournament = await tournamentDAO.update(tournamentId, {
            status: 'completed',
            end_time: new Date()
        });
        // 计算排名和奖励
        await this.calculateRanksAndPrizes(tournamentId);
        // 发送结束通知
        this.sendTournamentUpdate(tournamentId, {
            status: 'completed',
            update_type: 'end'
        });
        loggerService_1.default.tournamentEvent('Tournament ended', tournamentId, undefined);
        return updatedTournament;
    }
    /**
     * 计算排名和奖励
     * @param tournamentId 锦标赛ID
     */
    async calculateRanksAndPrizes(tournamentId) {
        // 获取所有注册玩家
        const registrations = await tournamentRegistrationDAO.getByTournamentId(tournamentId);
        const tournament = await tournamentDAO.getById(tournamentId);
        if (!tournament) {
            throw new Error('锦标赛不存在');
        }
        // 按状态排序：active玩家排在前面，然后是eliminated玩家
        registrations.sort((a, b) => {
            if (a.status === 'active' && b.status !== 'active')
                return -1;
            if (a.status !== 'active' && b.status === 'active')
                return 1;
            return 0;
        });
        // 分配奖励（简单实现，可根据需要调整）
        const prizePool = tournament.prize_pool;
        const playerCount = registrations.length;
        const winnersCount = Math.max(1, Math.floor(playerCount * 0.3)); // 前30%的玩家获得奖励
        // 分配奖励比例
        const prizeDistribution = [0.5, 0.3, 0.2]; // 第一名50%，第二名30%，第三名20%
        for (let i = 0; i < registrations.length; i++) {
            const registration = registrations[i];
            let rank = i + 1;
            let prize = 0;
            // 分配奖励
            if (i < winnersCount) {
                const distributionIndex = Math.min(i, prizeDistribution.length - 1);
                prize = Math.floor(prizePool * prizeDistribution[distributionIndex]);
                // 将奖励发放给玩家
                const user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(registration.user_id);
                if (user) {
                    await postgreSQLUserDAO_1.postgreSQLUserDAO.update(registration.user_id, {
                        chips: user.chips + prize
                    });
                }
            }
            // 创建排名记录
            await tournamentRankingDAO.create({
                tournament_id: tournamentId,
                user_id: registration.user_id,
                rank,
                prize,
                chips: 0, // 简化实现，实际应记录最终筹码数
                eliminated_round: registration.status === 'eliminated' ? i + 1 : undefined,
                eliminated_reason: registration.status === 'eliminated' ? 'Out of chips' : undefined
            });
        }
        // 更新获胜者状态
        if (registrations.length > 0) {
            const winnerRegistration = registrations[0];
            await tournamentRegistrationDAO.updateRegistrationStatus(winnerRegistration.id, 'won');
            // 发送获胜者通知
            this.sendTournamentUpdate(tournamentId, {
                status: 'completed',
                update_type: 'winner',
                details: {
                    winnerId: winnerRegistration.user_id
                }
            });
        }
    }
    /**
     * 获取锦标赛信息
     * @param tournamentId 锦标赛ID
     * @returns 锦标赛信息
     */
    async getTournament(tournamentId) {
        return await tournamentDAO.getById(tournamentId);
    }
    /**
     * 获取所有锦标赛
     * @returns 锦标赛列表
     */
    async getAllTournaments() {
        return await tournamentDAO.getAll();
    }
    /**
     * 获取特定状态的锦标赛
     * @param status 锦标赛状态
     * @returns 锦标赛列表
     */
    async getTournamentsByStatus(status) {
        return await tournamentDAO.getByStatus(status);
    }
    /**
     * 获取即将开始的锦标赛
     * @param limit 限制数量
     * @returns 锦标赛列表
     */
    async getUpcomingTournaments(limit = 10) {
        return await tournamentDAO.getUpcomingTournaments(limit);
    }
    /**
     * 获取用户注册的锦标赛
     * @param userId 用户ID
     * @returns 锦标赛列表
     */
    async getUserTournaments(userId) {
        return await tournamentDAO.getUserTournaments(userId);
    }
    /**
     * 获取锦标赛排名
     * @param tournamentId 锦标赛ID
     * @returns 排名列表
     */
    async getTournamentRankings(tournamentId) {
        return await tournamentRankingDAO.getByTournamentId(tournamentId);
    }
    /**
     * 创建默认盲注结构
     * @returns 默认盲注结构
     */
    async createDefaultBlindStructure() {
        // 检查是否已存在默认盲注结构
        const existingStructure = await blindStructureDAO.getDefaultStructure();
        if (existingStructure) {
            return existingStructure;
        }
        // 创建默认盲注结构
        const defaultStructure = await blindStructureDAO.create({
            name: 'Default',
            description: '默认盲注结构',
            levels: [
                { level: 1, small_blind: 10, big_blind: 20, duration: 120 },
                { level: 2, small_blind: 20, big_blind: 40, duration: 120 },
                { level: 3, small_blind: 30, big_blind: 60, duration: 120 },
                { level: 4, small_blind: 50, big_blind: 100, duration: 120 },
                { level: 5, small_blind: 75, big_blind: 150, duration: 120 },
                { level: 6, small_blind: 100, big_blind: 200, duration: 120 },
                { level: 7, small_blind: 150, big_blind: 300, duration: 120 },
                { level: 8, small_blind: 200, big_blind: 400, duration: 120 },
                { level: 9, small_blind: 300, big_blind: 600, duration: 120 },
                { level: 10, small_blind: 400, big_blind: 800, duration: 120 }
            ]
        });
        return defaultStructure;
    }
    /**
     * 发送锦标赛更新通知
     * @param tournamentId 锦标赛ID
     * @param update 更新信息
     */
    sendTournamentUpdate(tournamentId, update) {
        const wsService = (0, websocketInstance_1.getWebSocketService)();
        if (wsService) {
            wsService.broadcastToRoom(tournamentId, {
                type: 'tournament_update',
                data: {
                    tournament_id: tournamentId,
                    ...update
                }
            });
        }
    }
}
exports.TournamentService = TournamentService;
// 导出单例实例
exports.tournamentService = TournamentService.getInstance();
//# sourceMappingURL=tournamentService.js.map