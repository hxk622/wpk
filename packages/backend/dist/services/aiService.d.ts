import { AIAnalysis, AISuggestion, GameAction, Card, AITrainingData } from '../types';
export interface AIOpponent {
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    playingStyle: 'tight' | 'loose' | 'aggressive' | 'passive';
    bluffFrequency: number;
    callFrequency: number;
    raiseFrequency: number;
    handRange: string[];
}
export interface AIOpponentState {
    opponent: AIOpponent;
    hand: Card[];
    stackSize: number;
    betHistory: GameAction[];
    position: number;
    folded: boolean;
}
/**
 * AI服务层 - 提供德州扑克AI分析和建议功能
 */
export declare class AIService {
    private static instance;
    private opponents;
    private constructor();
    /**
     * 获取AI服务单例实例
     */
    static getInstance(): AIService;
    /**
     * 初始化AI对手
     */
    private initializeOpponents;
    /**
     * 获取所有可用的AI对手
     * @returns AI对手列表
     */
    getAvailableOpponents(): AIOpponent[];
    /**
     * 根据ID获取AI对手
     * @param opponentId AI对手ID
     * @returns AI对手信息
     */
    getOpponentById(opponentId: string): AIOpponent | null;
    /**
     * 为AI对手生成手牌
     * @param opponent AI对手
     * @returns 生成的手牌
     */
    generateAIOpponentHand(opponent: AIOpponent): Card[];
    /**
     * AI对手做出决策
     * @param opponentState AI对手状态
     * @param communityCards 公共牌
     * @param potSize 底池大小
     * @param currentBet 当前下注额
     * @param minRaise 最小加注额
     * @returns AI对手的决策
     */
    makeAIDecision(opponentState: AIOpponentState, communityCards: Card[], potSize: number, currentBet: number, minRaise: number): {
        action: 'fold' | 'call' | 'raise' | 'all_in';
        amount: number;
    };
    /**
     * 根据对手风格调整牌力评估
     * @param handStrength 原始牌力
     * @param opponent AI对手
     * @returns 调整后的牌力
     */
    private adjustHandStrengthForOpponent;
    /**
     * 将手牌字符串转换为Card对象数组
     * @param handStr 手牌字符串（如"AA"、"AK"）
     * @returns Card对象数组
     */
    private parseHandString;
    /**
     * 训练AI模型
     * @param trainingData 训练数据
     * @returns 训练结果
     */
    trainAI(trainingData: AITrainingData): Promise<any>;
    /**
     * 批量训练AI模型
     * @param trainingDataList 训练数据列表
     * @returns 批量训练结果
     */
    batchTrainAI(trainingDataList: AITrainingData[]): Promise<any>;
    /**
     * 预处理训练数据
     * @param data 原始训练数据
     * @returns 预处理后的数据
     */
    private preprocessTrainingData;
    /**
     * 获取决策点阶段
     * @param communityCardsCount 公共牌数量
     * @returns 决策点阶段
     */
    private getDecisionPoint;
    /**
     * 提取特征
     * @param data 预处理后的数据
     * @returns 提取的特征
     */
    private extractFeatures;
    /**
     * 训练模型
     * @param features 特征数据
     * @returns 训练结果
     */
    private trainModel;
    /**
     * 分析牌局状态
     * @param userId 用户ID
     * @param sessionId 游戏会话ID
     * @param hand 用户手牌
     * @param communityCards 公共牌
     * @param betHistory 下注历史
     * @param potSize 底池大小
     * @param currentBet 当前下注额
     * @param stackSize 用户筹码
     */
    analyzeHand(userId: string, sessionId: string, hand: Card[], communityCards: Card[], betHistory: GameAction[], potSize: number, currentBet: number, stackSize: number): AIAnalysis;
    /**
     * 获取AI建议
     * @param userId 用户ID
     * @param sessionId 游戏会话ID
     * @param style AI风格 ('gto' | 'professional')
     * @param hand 用户手牌
     * @param communityCards 公共牌
     * @param betHistory 下注历史
     * @param potSize 底池大小
     * @param currentBet 当前下注额
     * @param stackSize 用户筹码
     */
    getSuggestion(userId: string, sessionId: string, style: 'gto' | 'professional', hand: Card[], communityCards: Card[], betHistory: GameAction[], potSize: number, currentBet: number, stackSize: number): AISuggestion;
    /**
     * 计算牌力
     * @param hand 用户手牌
     * @param communityCards 公共牌
     */
    private calculateHandStrength;
    /**
     * 计算底池赔率
     * @param potSize 底池大小
     * @param currentBet 当前需要跟注的金额
     */
    private calculatePotOdds;
    /**
     * 计算隐含赔率
     * @param potSize 底池大小
     * @param currentBet 当前需要跟注的金额
     * @param expectedFutureBets 预期未来下注额
     */
    private calculateImpliedOdds;
    /**
     * 生成推荐动作
     * @param handStrength 牌力
     * @param potOdds 底池赔率
     * @param currentBet 当前下注额
     * @param stackSize 用户筹码
     */
    private generateRecommendedAction;
    /**
     * 根据AI风格调整建议
     * @param analysis 牌局分析
     * @param style AI风格
     * @param betHistory 下注历史
     * @param potSize 底池大小
     * @param currentBet 当前下注额
     * @param stackSize 用户筹码
     */
    private adjustSuggestionByStyle;
    /**
     * 调整建议以适应GTO风格
     */
    private adjustForGTO;
    /**
     * 调整建议以适应Professional风格
     */
    private adjustForProfessional;
    /**
     * 分析对手行为模式
     */
    private analyzeOpponentBehavior;
    /**
     * 针对紧弱型对手的策略调整
     */
    private adjustForTightPassiveOpponent;
    /**
     * 针对紧凶型对手的策略调整
     */
    private adjustForTightAggressiveOpponent;
    /**
     * 针对松弱型对手的策略调整
     */
    private adjustForLoosePassiveOpponent;
    /**
     * 针对松凶型对手的策略调整
     */
    private adjustForLooseAggressiveOpponent;
    /**
     * 针对未知类型对手的策略调整
     */
    private adjustForUnknownOpponent;
    /**
     * 检查是否有好的听牌
     */
    private hasGoodDraws;
    /**
     * 计算加注金额
     * @param action 动作类型
     * @param handStrength 牌力
     * @param potSize 底池大小
     * @param currentBet 当前下注额
     * @param stackSize 用户筹码
     */
    private calculateRaiseAmount;
    /**
     * 计算置信度
     * @param handStrength 牌力
     * @param potOdds 底池赔率
     * @param betHistoryLength 下注历史长度
     */
    private calculateConfidence;
    /**
     * 生成动作解释
     * @param action 动作类型
     * @param handStrength 牌力
     * @param potSize 底池大小
     * @param currentBet 当前下注额
     * @param stackSize 剩余筹码
     */
    private generateExplanation;
    /**
     * 计算手牌可玩性调整（GTO特定）
     * @param hand 用户手牌
     * @param communityCards 公共牌
     */
    private calculatePlayabilityAdjustment;
    /**
     * 检查是否有顺子听牌
     */
    private hasStraightDraw;
    /**
     * 检查是否有对子
     */
    private hasPair;
    /**
     * 评估手牌类型
     * @param cards 所有可用牌（手牌+公共牌）
     */
    private evaluateHand;
    private static readonly rankValues;
    /**
     * 按点数大小排序牌
     */
    private sortCardsByRank;
    /**
     * 检查是否为同花
     */
    private isFlush;
    /**
     * 检查是否为顺子
     */
    private isStraight;
    /**
     * 检查是否为四条
     */
    private isFourOfAKind;
    /**
     * 检查是否为葫芦
     */
    private isFullHouse;
    /**
     * 检查是否为三条
     */
    private isThreeOfAKind;
    /**
     * 检查是否为两对
     */
    private isTwoPair;
    /**
     * 检查是否为一对
     */
    private isPair;
    /**
     * 获取每个点数出现的次数
     */
    private getRankCounts;
}
export declare const aiService: AIService;
