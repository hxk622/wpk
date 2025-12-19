import { postgreSQLSecurityDAO } from '../dao/impl/postgreSQLSecurityDAO';
import { postgreSQLUserDAO } from '../dao/impl/postgreSQLUserDAO';
import { CheatDetection, UserWarning, RealNameVerificationRequest } from '../types';
import { RedisCache } from './redisCache';
import LoggerService from './loggerService';

// 安全服务
export class SecurityService {
  private static readonly INSTANCE = new SecurityService();

  private constructor() {}

  static getInstance(): SecurityService {
    return SecurityService.INSTANCE;
  }

  // 提交实名认证请求
  async submitRealNameVerification(
    userId: string,
    verificationData: RealNameVerificationRequest
  ): Promise<boolean> {
    try {
      // 验证用户是否存在
      const user = await postgreSQLUserDAO.getById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 验证身份证号格式（简单验证）
      if (!this.isValidIdCard(verificationData.idCard)) {
        throw new Error('无效的身份证号码');
      }

      // 更新用户实名认证信息
      const success = await postgreSQLSecurityDAO.updateRealNameVerification(userId, verificationData);
      if (success) {
        LoggerService.info('用户提交实名认证请求', {
          userId,
          realName: verificationData.realName
        });
      }

      return success;
    } catch (error) {
      LoggerService.error('提交实名认证请求失败', {
        userId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      throw error;
    }
  }

  // 处理实名认证结果
  async processVerificationResult(
    userId: string,
    status: 'verified' | 'rejected',
    reason?: string
  ): Promise<boolean> {
    try {
      // 验证用户是否存在
      const user = await postgreSQLUserDAO.getById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 更新实名认证状态
      const success = await postgreSQLSecurityDAO.updateVerificationStatus(userId, status, reason);
      if (success) {
        LoggerService.info('处理实名认证结果', {
          userId,
          status,
          reason
        });
      }

      return success;
    } catch (error) {
      LoggerService.error('处理实名认证结果失败', {
        userId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      throw error;
    }
  }

  // 记录反作弊检测
  async recordCheatDetection(
    userId: string,
    detectionType: CheatDetection['detectionType'],
    detectionScore: number,
    evidenceData: any,
    gameSessionId?: string
  ): Promise<CheatDetection> {
    try {
      // 验证用户是否存在
      const user = await postgreSQLUserDAO.getById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 创建反作弊检测记录
      const detection = await postgreSQLSecurityDAO.createCheatDetection({
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

      LoggerService.info('记录反作弊检测', {
        userId,
        detectionType,
        detectionScore,
        gameSessionId
      });

      return detection;
    } catch (error) {
      LoggerService.error('记录反作弊检测失败', {
        userId,
        detectionType,
        error: error instanceof Error ? error.message : '未知错误'
      });
      throw error;
    }
  }

  // 确认作弊检测
  async confirmCheatDetection(
    detectionId: string,
    actionTaken: string
  ): Promise<CheatDetection | null> {
    try {
      // 更新检测状态
      const detection = await postgreSQLSecurityDAO.updateCheatDetection(detectionId, {
        status: 'confirmed',
        actionTaken,
        actionTime: new Date()
      });

      if (detection) {
        LoggerService.info('确认作弊检测', {
          detectionId,
          userId: detection.userId,
          actionTaken
        });
      }

      return detection;
    } catch (error) {
      LoggerService.error('确认作弊检测失败', {
        detectionId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      throw error;
    }
  }

  // 驳回作弊检测
  async dismissCheatDetection(detectionId: string): Promise<CheatDetection | null> {
    try {
      // 更新检测状态
      const detection = await postgreSQLSecurityDAO.updateCheatDetection(detectionId, {
        status: 'dismissed'
      });

      if (detection) {
        LoggerService.info('驳回作弊检测', {
          detectionId,
          userId: detection.userId
        });
      }

      return detection;
    } catch (error) {
      LoggerService.error('驳回作弊检测失败', {
        detectionId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      throw error;
    }
  }

  // 创建用户警告
  async createUserWarning(
    userId: string,
    warningData: Omit<UserWarning, 'id' | 'createdAt' | 'isResolved'>
  ): Promise<UserWarning> {
    try {
      // 验证用户是否存在
      const user = await postgreSQLUserDAO.getById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 创建警告记录
      const warning = await postgreSQLSecurityDAO.createUserWarning({
        ...warningData,
        isResolved: false
      });

      LoggerService.info('创建用户警告', {
        userId,
        warningType: warningData.warningType,
        severity: warningData.severity
      });

      return warning;
    } catch (error) {
      LoggerService.error('创建用户警告失败', {
        userId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      throw error;
    }
  }

  // 获取用户警告
  async getUserWarnings(
    userId: string,
    includeResolved: boolean = false
  ): Promise<UserWarning[]> {
    try {
      // 验证用户是否存在
      const user = await postgreSQLUserDAO.getById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      return await postgreSQLSecurityDAO.getUserWarnings(userId, includeResolved);
    } catch (error) {
      LoggerService.error('获取用户警告失败', {
        userId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      throw error;
    }
  }

  // 解决用户警告
  async resolveUserWarning(warningId: string, resolvedBy: string): Promise<boolean> {
    try {
      const success = await postgreSQLSecurityDAO.resolveWarning(warningId, resolvedBy);
      if (success) {
        LoggerService.info('解决用户警告', {
          warningId,
          resolvedBy
        });
      }

      return success;
    } catch (error) {
      LoggerService.error('解决用户警告失败', {
        warningId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      throw error;
    }
  }

  // 检查用户是否有严重警告
  async checkUserHasSevereWarnings(userId: string): Promise<boolean> {
    try {
      return await postgreSQLSecurityDAO.hasSevereWarnings(userId);
    } catch (error) {
      LoggerService.error('检查用户严重警告失败', {
        userId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      throw error;
    }
  }

  // 检测异常游戏行为
  async detectAbnormalGameBehavior(
    userId: string,
    gameSessionId: string,
    gameData: any
  ): Promise<CheatDetection | null> {
    try {
      // 这里可以实现具体的异常行为检测算法
      // 例如：检测快速决策、异常的胜率、与其他玩家的异常互动等
      const detectionScore = this.calculateAbnormalScore(gameData);
      
      if (detectionScore > 50) {
        return await this.recordCheatDetection(
          userId,
          'abnormal_pattern',
          detectionScore,
          gameData,
          gameSessionId
        );
      }

      return null;
    } catch (error) {
      LoggerService.error('检测异常游戏行为失败', {
        userId,
        gameSessionId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      throw error;
    }
  }

  // 检测多账户操作
  async detectMultiAccount(
    userId: string,
    ipAddress: string,
    deviceInfo: string
  ): Promise<CheatDetection | null> {
    try {
      // 这里可以实现多账户检测逻辑
      // 例如：检查同一IP地址或设备上的多个账户
      const detectionScore = 0; // 暂时返回0，实际实现中需要检测
      
      if (detectionScore > 70) {
        return await this.recordCheatDetection(
          userId,
          'multi_account',
          detectionScore,
          { ipAddress, deviceInfo }
        );
      }

      return null;
    } catch (error) {
      LoggerService.error('检测多账户操作失败', {
        userId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      throw error;
    }
  }

  // 计算异常行为分数（简单实现）
  private calculateAbnormalScore(gameData: any): number {
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
  private isValidIdCard(idCard: string): boolean {
    // 身份证号格式验证（18位）
    const idCardRegex = /^\d{17}[\dXx]$/;
    return idCardRegex.test(idCard);
  }
}

// 创建单例实例并导出
export const securityService = SecurityService.getInstance();
