import { Tournament, TournamentRegistration, TournamentRanking, BlindStructure } from '../types';
/**
 * 锦标赛服务类
 */
export declare class TournamentService {
    private static instance;
    private tournamentTimers;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(): TournamentService;
    /**
     * 创建新的锦标赛
     * @param tournamentData 锦标赛数据
     * @returns 创建的锦标赛
     */
    createTournament(tournamentData: Omit<Tournament, 'id' | 'created_at' | 'updated_at' | 'current_players'>): Promise<Tournament>;
    /**
     * 注册参加锦标赛
     * @param tournamentId 锦标赛ID
     * @param userId 用户ID
     * @returns 注册信息
     */
    registerForTournament(tournamentId: string, userId: string): Promise<TournamentRegistration>;
    /**
     * 取消锦标赛注册
     * @param tournamentId 锦标赛ID
     * @param userId 用户ID
     * @returns 是否成功取消
     */
    cancelTournamentRegistration(tournamentId: string, userId: string): Promise<boolean>;
    /**
     * 开始锦标赛
     * @param tournamentId 锦标赛ID
     * @returns 更新后的锦标赛
     */
    startTournament(tournamentId: string): Promise<Tournament>;
    /**
     * 开始锦标赛轮次
     * @param tournamentId 锦标赛ID
     */
    private startTournamentRounds;
    /**
     * 开始锦标赛特定轮次
     * @param tournamentId 锦标赛ID
     * @param level 轮次级别
     */
    private startTournamentLevel;
    /**
     * 淘汰玩家
     * @param tournamentId 锦标赛ID
     * @param userId 用户ID
     * @param eliminatedRound 淘汰轮次
     * @param eliminatedReason 淘汰原因
     */
    eliminatePlayer(tournamentId: string, userId: string, eliminatedRound: number, eliminatedReason: string): Promise<void>;
    /**
     * 结束锦标赛
     * @param tournamentId 锦标赛ID
     */
    endTournament(tournamentId: string): Promise<Tournament>;
    /**
     * 计算排名和奖励
     * @param tournamentId 锦标赛ID
     */
    private calculateRanksAndPrizes;
    /**
     * 获取锦标赛信息
     * @param tournamentId 锦标赛ID
     * @returns 锦标赛信息
     */
    getTournament(tournamentId: string): Promise<Tournament | null>;
    /**
     * 获取所有锦标赛
     * @returns 锦标赛列表
     */
    getAllTournaments(): Promise<Tournament[]>;
    /**
     * 获取特定状态的锦标赛
     * @param status 锦标赛状态
     * @returns 锦标赛列表
     */
    getTournamentsByStatus(status: Tournament['status']): Promise<Tournament[]>;
    /**
     * 获取即将开始的锦标赛
     * @param limit 限制数量
     * @returns 锦标赛列表
     */
    getUpcomingTournaments(limit?: number): Promise<Tournament[]>;
    /**
     * 获取用户注册的锦标赛
     * @param userId 用户ID
     * @returns 锦标赛列表
     */
    getUserTournaments(userId: string): Promise<Tournament[]>;
    /**
     * 获取锦标赛排名
     * @param tournamentId 锦标赛ID
     * @returns 排名列表
     */
    getTournamentRankings(tournamentId: string): Promise<TournamentRanking[]>;
    /**
     * 创建默认盲注结构
     * @returns 默认盲注结构
     */
    createDefaultBlindStructure(): Promise<BlindStructure>;
    /**
     * 发送锦标赛更新通知
     * @param tournamentId 锦标赛ID
     * @param update 更新信息
     */
    private sendTournamentUpdate;
}
export declare const tournamentService: TournamentService;
