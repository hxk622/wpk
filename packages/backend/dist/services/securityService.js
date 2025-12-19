"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityService = exports.SecurityService = void 0;
const postgreSQLSecurityDAO_1 = require("../dao/impl/postgreSQLSecurityDAO");
const postgreSQLUserDAO_1 = require("../dao/impl/postgreSQLUserDAO");
const loggerService_1 = __importDefault(require("./loggerService"));
// 安全服务
class SecurityService {
    constructor() { }
    static getInstance() {
        return SecurityService.INSTANCE;
    }
    // 提交实名认证请求
    async submitRealNameVerification(userId, verificationData) {
        try {
            // 验证用户是否存在
            const user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(userId);
            if (!user) {
                throw new Error('用户不存在');
            }
            // 验证身份证号格式（简单验证）
            if (!this.isValidIdCard(verificationData.idCard)) {
                throw new Error('无效的身份证号码');
            }
            // 更新用户实名认证信息
            const success = await postgreSQLSecurityDAO_1.postgreSQLSecurityDAO.updateRealNameVerification(userId, verificationData);
            if (success) {
                loggerService_1.default.info('用户提交实名认证请求', {
                    userId,
                    realName: verificationData.realName
                });
            }
            return success;
        }
        catch (error) {
            loggerService_1.default.error('提交实名认证请求失败', {
                userId,
                error: error instanceof Error ? error.message : '未知错误'
            });
            throw error;
        }
    }
    // 处理实名认证结果
    async processVerificationResult(userId, status, reason) {
        try {
            // 验证用户是否存在
            const user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(userId);
            if (!user) {
                throw new Error('用户不存在');
            }
            // 更新实名认证状态
            const success = await postgreSQLSecurityDAO_1.postgreSQLSecurityDAO.updateVerificationStatus(userId, status, reason);
            if (success) {
                loggerService_1.default.info('处理实名认证结果', {
                    userId,
                    status,
                    reason
                });
            }
            return success;
        }
        catch (error) {
            loggerService_1.default.error('处理实名认证结果失败', {
                userId,
                error: error instanceof Error ? error.message : '未知错误'
            });
            throw error;
        }
    }
    // 记录反作弊检测
    async recordCheatDetection(userId, detectionType, detectionScore, evidenceData, gameSessionId) {
        try {
            // 验证用户是否存在
            const user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(userId);
            if (!user) {
                throw new Error('用户不存在');
            }
            // 创建反作弊检测记录
            const detection = await postgreSQLSecurityDAO_1.postgreSQLSecurityDAO.createCheatDetection({
                userId,
                gameSessionId,
                detectionType,
                detectionScore,
                detectionTime: new Date(),
                status: detectionScore >= 70 ? 'confirmed' : 'pending',
                evidenceData
            });
            // 如果检测分数很高，自动创建警告
            if (detectionScore >= 70) {
                await this.createUserWarning(userId, {
                    userId,
                    warningType: 'cheating',
                    reason: `检测到${detectionType}行为，检测分数: ${detectionScore}`,
                    severity: detectionScore >= 90 ? 'high' : 'medium',
                    issuedBy: 'system',
                    issuedAt: new Date(),
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后过期
                });
            }
            loggerService_1.default.info('记录反作弊检测', {
                userId,
                detectionType,
                detectionScore,
                gameSessionId
            });
            return detection;
        }
        catch (error) {
            loggerService_1.default.error('记录反作弊检测失败', {
                userId,
                detectionType,
                error: error instanceof Error ? error.message : '未知错误'
            });
            throw error;
        }
    }
    // 确认作弊检测
    async confirmCheatDetection(detectionId, actionTaken) {
        try {
            // 更新检测状态
            const detection = await postgreSQLSecurityDAO_1.postgreSQLSecurityDAO.updateCheatDetection(detectionId, {
                status: 'confirmed',
                actionTaken,
                actionTime: new Date()
            });
            if (detection) {
                loggerService_1.default.info('确认作弊检测', {
                    detectionId,
                    userId: detection.userId,
                    actionTaken
                });
            }
            return detection;
        }
        catch (error) {
            loggerService_1.default.error('确认作弊检测失败', {
                detectionId,
                error: error instanceof Error ? error.message : '未知错误'
            });
            throw error;
        }
    }
    // 驳回作弊检测
    async dismissCheatDetection(detectionId) {
        try {
            // 更新检测状态
            const detection = await postgreSQLSecurityDAO_1.postgreSQLSecurityDAO.updateCheatDetection(detectionId, {
                status: 'dismissed'
            });
            if (detection) {
                loggerService_1.default.info('驳回作弊检测', {
                    detectionId,
                    userId: detection.userId
                });
            }
            return detection;
        }
        catch (error) {
            loggerService_1.default.error('驳回作弊检测失败', {
                detectionId,
                error: error instanceof Error ? error.message : '未知错误'
            });
            throw error;
        }
    }
    // 创建用户警告
    async createUserWarning(userId, warningData) {
        try {
            // 验证用户是否存在
            const user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(userId);
            if (!user) {
                throw new Error('用户不存在');
            }
            // 创建警告记录
            const warning = await postgreSQLSecurityDAO_1.postgreSQLSecurityDAO.createUserWarning({
                ...warningData,
                isResolved: false
            });
            loggerService_1.default.info('创建用户警告', {
                userId,
                warningType: warningData.warningType,
                severity: warningData.severity
            });
            return warning;
        }
        catch (error) {
            loggerService_1.default.error('创建用户警告失败', {
                userId,
                error: error instanceof Error ? error.message : '未知错误'
            });
            throw error;
        }
    }
    // 获取用户警告
    async getUserWarnings(userId, includeResolved = false) {
        try {
            // 验证用户是否存在
            const user = await postgreSQLUserDAO_1.postgreSQLUserDAO.getById(userId);
            if (!user) {
                throw new Error('用户不存在');
            }
            return await postgreSQLSecurityDAO_1.postgreSQLSecurityDAO.getUserWarnings(userId, includeResolved);
        }
        catch (error) {
            loggerService_1.default.error('获取用户警告失败', {
                userId,
                error: error instanceof Error ? error.message : '未知错误'
            });
            throw error;
        }
    }
    // 解决用户警告
    async resolveUserWarning(warningId, resolvedBy) {
        try {
            const success = await postgreSQLSecurityDAO_1.postgreSQLSecurityDAO.resolveWarning(warningId, resolvedBy);
            if (success) {
                loggerService_1.default.info('解决用户警告', {
                    warningId,
                    resolvedBy
                });
            }
            return success;
        }
        catch (error) {
            loggerService_1.default.error('解决用户警告失败', {
                warningId,
                error: error instanceof Error ? error.message : '未知错误'
            });
            throw error;
        }
    }
    // 检查用户是否有严重警告
    async checkUserHasSevereWarnings(userId) {
        try {
            return await postgreSQLSecurityDAO_1.postgreSQLSecurityDAO.hasSevereWarnings(userId);
        }
        catch (error) {
            loggerService_1.default.error('检查用户严重警告失败', {
                userId,
                error: error instanceof Error ? error.message : '未知错误'
            });
            throw error;
        }
    }
    // 检测异常游戏行为
    async detectAbnormalGameBehavior(userId, gameSessionId, gameData) {
        try {
            // 这里可以实现具体的异常行为检测算法
            // 例如：检测快速决策、异常的胜率、与其他玩家的异常互动等
            const detectionScore = this.calculateAbnormalScore(gameData);
            if (detectionScore > 50) {
                return await this.recordCheatDetection(userId, 'abnormal_pattern', detectionScore, gameData, gameSessionId);
            }
            return null;
        }
        catch (error) {
            loggerService_1.default.error('检测异常游戏行为失败', {
                userId,
                gameSessionId,
                error: error instanceof Error ? error.message : '未知错误'
            });
            throw error;
        }
    }
    // 检测多账户操作
    async detectMultiAccount(userId, ipAddress, deviceInfo) {
        try {
            // 这里可以实现多账户检测逻辑
            // 例如：检查同一IP地址或设备上的多个账户
            const detectionScore = 0; // 暂时返回0，实际实现中需要检测
            if (detectionScore > 70) {
                return await this.recordCheatDetection(userId, 'multi_account', detectionScore, { ipAddress, deviceInfo });
            }
            return null;
        }
        catch (error) {
            loggerService_1.default.error('检测多账户操作失败', {
                userId,
                error: error instanceof Error ? error.message : '未知错误'
            });
            throw error;
        }
    }
    // 计算异常行为分数（简单实现）
    calculateAbnormalScore(gameData) {
        let score = 0;
        // 示例：检测异常高的胜率
        if (gameData.winRate && gameData.winRate > 0.8) {
            score += 30;
        }
        // 示例：检测异常快的决策时间
        if (gameData.averageDecisionTime && gameData.averageDecisionTime < 500) {
            score += 25;
        }
        // 示例：检测异常的下注模式
        if (gameData.betPattern && gameData.betPattern === 'abnormal') {
            score += 25;
        }
        // 示例：检测与其他玩家的异常互动
        if (gameData.playerInteraction && gameData.playerInteraction === 'suspicious') {
            score += 20;
        }
        return Math.min(score, 100);
    }
    // 简单的身份证号验证
    isValidIdCard(idCard) {
        // 身份证号格式验证（18位）
        const idCardRegex = /^\d{17}[\dXx]$/;
        return idCardRegex.test(idCard);
    }
}
exports.SecurityService = SecurityService;
SecurityService.INSTANCE = new SecurityService();
// 创建单例实例并导出
exports.securityService = SecurityService.getInstance();
//# sourceMappingURL=securityService.js.map