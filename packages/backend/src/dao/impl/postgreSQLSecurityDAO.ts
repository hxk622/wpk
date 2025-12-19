import pool from '../../services/database';
import { RedisCache } from '../../services/redisCache';
import { CheatDetection, UserWarning, RealNameVerificationRequest } from '../../types';

// 实名认证相关DAO
export class PostgreSQLSecurityDAO {
  private static readonly USER_TABLE = 'users';
  private static readonly CHEAT_DETECTION_TABLE = 'cheat_detections';
  private static readonly USER_WARNING_TABLE = 'user_warnings';
  private static readonly CACHE_KEY_PREFIX = {
    USER: 'user:',
    CHEAT_DETECTION: 'cheat_detection:',
    USER_WARNINGS: 'user_warnings:'
  };

  // 更新用户实名认证信息
  async updateRealNameVerification(
    userId: string,
    verificationData: RealNameVerificationRequest
  ): Promise<boolean> {
    const result = await pool.query(
      `UPDATE ${PostgreSQLSecurityDAO.USER_TABLE} 
       SET real_name = $1, id_card = $2, id_card_photo_front = $3, 
           id_card_photo_back = $4, verification_status = 'pending', 
           updated_at = NOW() 
       WHERE id = $5`,
      [
        verificationData.realName,
        verificationData.idCard,
        verificationData.idCardPhotoFront,
        verificationData.idCardPhotoBack,
        userId
      ]
    );

    // 清除用户缓存
    await RedisCache.delete(`${PostgreSQLSecurityDAO.CACHE_KEY_PREFIX.USER}${userId}`);

    return result.rowCount !== null && result.rowCount > 0;
  }

  // 更新实名认证状态
  async updateVerificationStatus(
    userId: string,
    status: 'verified' | 'rejected',
    reason?: string
  ): Promise<boolean> {
    const result = await pool.query(
      `UPDATE ${PostgreSQLSecurityDAO.USER_TABLE} 
       SET verification_status = $1, real_name_verified = $2, 
           verification_reason = $3, updated_at = NOW() 
       WHERE id = $4`,
      [
        status,
        status === 'verified',
        reason,
        userId
      ]
    );

    // 清除用户缓存
    await RedisCache.delete(`${PostgreSQLSecurityDAO.CACHE_KEY_PREFIX.USER}${userId}`);

    return result.rowCount !== null && result.rowCount > 0;
  }

  // 创建反作弊检测记录
  async createCheatDetection(detection: Omit<CheatDetection, 'id' | 'createdAt'>): Promise<CheatDetection> {
    const result = await pool.query(
      `INSERT INTO ${PostgreSQLSecurityDAO.CHEAT_DETECTION_TABLE} 
       (user_id, game_session_id, detection_type, detection_score, detection_time, 
        status, evidence_data) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        detection.userId,
        detection.gameSessionId,
        detection.detectionType,
        detection.detectionScore,
        detection.detectionTime,
        detection.status,
        detection.evidenceData
      ]
    );

    const createdDetection = result.rows[0];
    // 缓存检测记录
    await RedisCache.set(
      `${PostgreSQLSecurityDAO.CACHE_KEY_PREFIX.CHEAT_DETECTION}${createdDetection.id}`,
      createdDetection,
      3600
    );

    return createdDetection;
  }

  // 更新反作弊检测记录
  async updateCheatDetection(
    id: string,
    updates: Partial<CheatDetection>
  ): Promise<CheatDetection | null> {
    // 构建更新语句
    const updateFields = Object.entries(updates)
      .map(([key, value], index) => `${key === 'detectionType' ? 'detection_type' : 
                                     key === 'detectionScore' ? 'detection_score' : 
                                     key === 'detectionTime' ? 'detection_time' : 
                                     key === 'evidenceData' ? 'evidence_data' : 
                                     key === 'actionTaken' ? 'action_taken' : 
                                     key === 'actionTime' ? 'action_time' : 
                                     key} = $${index + 2}`)
      .join(', ');

    const values = [...Object.values(updates), id];

    const result = await pool.query(
      `UPDATE ${PostgreSQLSecurityDAO.CHEAT_DETECTION_TABLE} 
       SET ${updateFields} 
       WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    const updatedDetection = result.rows[0];
    // 更新缓存
    await RedisCache.set(
      `${PostgreSQLSecurityDAO.CACHE_KEY_PREFIX.CHEAT_DETECTION}${updatedDetection.id}`,
      updatedDetection,
      3600
    );

    return updatedDetection;
  }

  // 获取用户的反作弊检测记录
  async getCheatDetectionsByUserId(userId: string, limit: number = 20, offset: number = 0): Promise<CheatDetection[]> {
    const result = await pool.query(
      `SELECT * FROM ${PostgreSQLSecurityDAO.CHEAT_DETECTION_TABLE} 
       WHERE user_id = $1 
       ORDER BY detection_time DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  }

  // 创建用户警告
  async createUserWarning(warning: Omit<UserWarning, 'id' | 'createdAt'>): Promise<UserWarning> {
    const result = await pool.query(
      `INSERT INTO ${PostgreSQLSecurityDAO.USER_WARNING_TABLE} 
       (user_id, warning_type, reason, severity, issued_by, issued_at, expires_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        warning.userId,
        warning.warningType,
        warning.reason,
        warning.severity,
        warning.issuedBy,
        warning.issuedAt,
        warning.expiresAt
      ]
    );

    const createdWarning = result.rows[0];
    // 清除用户警告缓存
    await RedisCache.delete(`${PostgreSQLSecurityDAO.CACHE_KEY_PREFIX.USER_WARNINGS}${warning.userId}`);

    return createdWarning;
  }

  // 获取用户的警告记录
  async getUserWarnings(userId: string, includeResolved: boolean = false): Promise<UserWarning[]> {
    const cacheKey = `${PostgreSQLSecurityDAO.CACHE_KEY_PREFIX.USER_WARNINGS}${userId}:${includeResolved}`;
    // 先从缓存获取
    const cachedWarnings = await RedisCache.get<UserWarning[]>(cacheKey);
    if (cachedWarnings) {
      return cachedWarnings;
    }

    const resolvedCondition = includeResolved ? '' : 'AND is_resolved = false';
    const result = await pool.query(
      `SELECT * FROM ${PostgreSQLSecurityDAO.USER_WARNING_TABLE} 
       WHERE user_id = $1 ${resolvedCondition} 
       ORDER BY issued_at DESC`,
      [userId]
    );

    // 缓存用户警告
    await RedisCache.set(cacheKey, result.rows, 3600);

    return result.rows;
  }

  // 标记警告为已解决
  async resolveWarning(warningId: string, resolvedBy: string): Promise<boolean> {
    const result = await pool.query(
      `UPDATE ${PostgreSQLSecurityDAO.USER_WARNING_TABLE} 
       SET is_resolved = true, resolved_by = $1, resolved_at = NOW() 
       WHERE id = $2`,
      [resolvedBy, warningId]
    );

    if (result.rowCount !== null && result.rowCount > 0) {
      // 获取用户ID以清除缓存
      const warningResult = await pool.query(
        `SELECT user_id FROM ${PostgreSQLSecurityDAO.USER_WARNING_TABLE} WHERE id = $1`,
        [warningId]
      );
      if (warningResult.rows.length > 0) {
        const userId = warningResult.rows[0].user_id;
        await RedisCache.delete(`${PostgreSQLSecurityDAO.CACHE_KEY_PREFIX.USER_WARNINGS}${userId}:true`);
        await RedisCache.delete(`${PostgreSQLSecurityDAO.CACHE_KEY_PREFIX.USER_WARNINGS}${userId}:false`);
      }
    }

    return result.rowCount !== null && result.rowCount > 0;
  }

  // 检测用户是否有严重警告
  async hasSevereWarnings(userId: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM ${PostgreSQLSecurityDAO.USER_WARNING_TABLE} 
       WHERE user_id = $1 AND severity = 'high' AND is_resolved = false`,
      [userId]
    );

    return parseInt(result.rows[0].count) > 0;
  }
}

// 创建单例实例
export const postgreSQLSecurityDAO = new PostgreSQLSecurityDAO();
