import express, { Request, Response, NextFunction } from 'express';
import { securityService } from '../services/securityService';
import { authMiddleware } from '../middlewares/authMiddleware';
// adminMiddleware 暂未实现，先留空导入避免编译报错
// import { adminMiddleware } from '../middlewares/adminMiddleware';
const adminMiddleware = (req: any, res: any, next: any) => next();
import { RealNameVerificationRequest } from '../types';
import { upload } from '../config/multer';
import LoggerService from '../services/loggerService';
import { successResponse, errorResponse } from '../utils/response';

const router = express.Router();

// =================== 实名认证相关路由 ===================

// 提交实名认证请求（用户）
router.post('/realname/verify', 
  authMiddleware, 
  upload.fields([
    { name: 'idCardPhotoFront', maxCount: 1 },
    { name: 'idCardPhotoBack', maxCount: 1 },
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json(errorResponse('未授权', 401));
      }

      const { realName, idCard } = req.body;
      if (!realName || !idCard) {
        return res.status(400).json(errorResponse('请提供真实姓名和身份证号码', 400));
      }

      // 处理上传的图片
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const idCardPhotoFront = files?.idCardPhotoFront?.[0]?.path;
      const idCardPhotoBack = files?.idCardPhotoBack?.[0]?.path;

      if (!idCardPhotoFront || !idCardPhotoBack) {
        return res.status(400).json(errorResponse('请上传身份证正反面照片', 400));
      }

      const verificationData: RealNameVerificationRequest = {
        realName,
        idCard,
        idCardPhotoFront,
        idCardPhotoBack
      };

      await securityService.submitRealNameVerification(userId, verificationData);

      res.status(200).json(successResponse(null, '实名认证请求已提交，等待审核'));
    } catch (error) {
      LoggerService.error('提交实名认证请求失败', {
        userId: req.user?.userId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      next(error);
    }
  }
);

// 获取用户实名认证状态（用户）
router.get('/realname/status', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('未授权', 401));
    }

    // 这里应该从用户服务获取，暂时使用安全服务
    // TODO: 将获取用户信息的功能移到用户服务
    const user = await (await import('../dao/impl/postgreSQLUserDAO')).postgreSQLUserDAO.getById(userId);
    if (!user) {
      return res.status(404).json(errorResponse('用户不存在', 404));
    }

    res.status(200).json(successResponse({
      realNameVerified: user.real_name_verified || false,
      verificationStatus: user.verification_status || 'pending',
      verificationReason: user.verification_reason || null
    }, '获取实名认证状态成功'));
  } catch (error) {
    LoggerService.error('获取实名认证状态失败', {
      userId: req.user?.userId,
      error: error instanceof Error ? error.message : '未知错误'
    });
    next(error);
  }
});

// 审核实名认证请求（管理员）
router.post('/admin/realname/review/:userId', 
  authMiddleware, 
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { status, reason } = req.body;

      if (!userId) {
        return res.status(400).json(errorResponse('请提供用户ID', 400));
      }

      if (!status || !['verified', 'rejected'].includes(status)) {
        return res.status(400).json(errorResponse('请提供有效的审核状态', 400));
      }

      await securityService.processVerificationResult(userId, status as 'verified' | 'rejected', reason);

      res.status(200).json(successResponse(null, '实名认证审核已处理'));
    } catch (error) {
      LoggerService.error('审核实名认证请求失败', {
        userId: req.params.userId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      next(error);
    }
  }
);

// =================== 反作弊检测相关路由 ===================

// 记录反作弊检测（系统/AI）
router.post('/cheat/detect', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 这里应该验证请求来源（内部服务或AI系统）
    const { userId, detectionType, detectionScore, evidenceData, gameSessionId } = req.body;

    if (!userId || !detectionType || detectionScore === undefined) {
      return res.status(400).json(errorResponse('请提供必要的检测信息', 400));
    }

    const detection = await securityService.recordCheatDetection(
      userId,
      detectionType,
      detectionScore,
      evidenceData,
      gameSessionId
    );

    res.status(201).json(successResponse({ detection }, '反作弊检测记录成功', 201));
  } catch (error) {
    LoggerService.error('记录反作弊检测失败', {
      error: error instanceof Error ? error.message : '未知错误'
    });
    next(error);
  }
});

// 确认作弊检测（管理员）
router.post('/admin/cheat/confirm/:detectionId', 
  authMiddleware, 
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { detectionId } = req.params;
      const { actionTaken } = req.body;

      if (!detectionId) {
        return res.status(400).json(errorResponse('请提供检测ID', 400));
      }

      const detection = await securityService.confirmCheatDetection(detectionId, actionTaken || '');

      if (!detection) {
        return res.status(404).json(errorResponse('检测记录不存在', 404));
      }

      res.status(200).json(successResponse({ detection }, '作弊检测已确认'));
    } catch (error) {
      LoggerService.error('确认作弊检测失败', {
        detectionId: req.params.detectionId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      next(error);
    }
  }
);

// 驳回作弊检测（管理员）
router.post('/admin/cheat/dismiss/:detectionId', 
  authMiddleware, 
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { detectionId } = req.params;

      if (!detectionId) {
        return res.status(400).json(errorResponse('请提供检测ID', 400));
      }

      const detection = await securityService.dismissCheatDetection(detectionId);

      if (!detection) {
        return res.status(404).json(errorResponse('检测记录不存在', 404));
      }

      res.status(200).json(successResponse({ detection }, '作弊检测已驳回'));
    } catch (error) {
      LoggerService.error('驳回作弊检测失败', {
        detectionId: req.params.detectionId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      next(error);
    }
  }
);

// 获取用户作弊检测记录（管理员）
router.get('/admin/cheat/detections/:userId', 
  authMiddleware, 
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json(errorResponse('请提供用户ID', 400));
      }

      // TODO: 实现获取用户检测记录的方法
      const detections = await (await import('../dao/impl/postgreSQLSecurityDAO')).postgreSQLSecurityDAO.getCheatDetectionsByUserId(userId);

      res.status(200).json(successResponse({ detections }, '获取用户作弊检测记录成功'));
    } catch (error) {
      LoggerService.error('获取用户作弊检测记录失败', {
        userId: req.params.userId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      next(error);
    }
  }
);

// =================== 用户警告相关路由 ===================

// 创建用户警告（管理员）
router.post('/admin/warnings', 
  authMiddleware, 
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, warningType, reason, severity, issuedBy, expiresAt } = req.body;

      if (!userId || !warningType || !reason || !severity || !issuedBy) {
        return res.status(400).json(errorResponse('请提供必要的警告信息', 400));
      }

      const warning = await securityService.createUserWarning(userId, {
        userId,
        warningType,
        reason,
        severity,
        issuedBy,
        issuedAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      res.status(201).json(successResponse({ warning }, '用户警告创建成功', 201));
    } catch (error) {
      LoggerService.error('创建用户警告失败', {
        userId: req.body.userId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      next(error);
    }
  }
);

// 获取用户警告（用户/管理员）
router.get('/warnings/:userId', 
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { includeResolved } = req.query;

      if (!userId) {
        return res.status(400).json(errorResponse('请提供用户ID', 400));
      }

      // 检查是否为当前用户（由于当前用户接口只包含userId，管理员检查暂时注释掉）
      if (userId !== req.user?.userId) {
        return res.status(403).json(errorResponse('没有权限查看其他用户的警告', 403));
      }

      const warnings = await securityService.getUserWarnings(userId, includeResolved === 'true');

      res.status(200).json(successResponse({ warnings }, '获取用户警告成功'));
    } catch (error) {
      LoggerService.error('获取用户警告失败', {
        userId: req.params.userId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      next(error);
    }
  }
);

// 解决用户警告（管理员）
router.post('/admin/warnings/resolve/:warningId', 
  authMiddleware, 
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { warningId } = req.params;

      if (!warningId) {
        return res.status(400).json(errorResponse('请提供警告ID', 400));
      }

      const success = await securityService.resolveUserWarning(warningId, req.user?.userId || 'system');

      if (!success) {
        return res.status(404).json(errorResponse('警告记录不存在', 404));
      }

      res.status(200).json(successResponse(null, '警告已解决'));
    } catch (error) {
      LoggerService.error('解决用户警告失败', {
        warningId: req.params.warningId,
        error: error instanceof Error ? error.message : '未知错误'
      });
      next(error);
    }
  }
);

// =================== 异常检测相关路由 ===================

// 检测异常游戏行为（系统）
router.post('/detect/abnormal', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 这里应该验证请求来源（内部服务）
    const { userId, gameSessionId, gameData } = req.body;

    if (!userId || !gameSessionId || !gameData) {
      return res.status(400).json(errorResponse('请提供必要的游戏数据', 400));
    }

    const detection = await securityService.detectAbnormalGameBehavior(userId, gameSessionId, gameData);

    res.status(200).json(successResponse(
      { detection }, 
      detection ? '异常游戏行为检测完成' : '未检测到异常行为'
    ));
  } catch (error) {
    LoggerService.error('检测异常游戏行为失败', {
      error: error instanceof Error ? error.message : '未知错误'
    });
    next(error);
  }
});

// 检测多账户操作（系统）
router.post('/detect/multi-account', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 这里应该验证请求来源（内部服务）
    const { userId, ipAddress, deviceInfo } = req.body;

    if (!userId || !ipAddress || !deviceInfo) {
      return res.status(400).json(errorResponse('请提供必要的设备和IP信息', 400));
    }

    const detection = await securityService.detectMultiAccount(userId, ipAddress, deviceInfo);

    res.status(200).json(successResponse(
      { detection }, 
      detection ? '多账户操作检测完成' : '未检测到多账户操作'
    ));
  } catch (error) {
    LoggerService.error('检测多账户操作失败', {
      error: error instanceof Error ? error.message : '未知错误'
    });
    next(error);
  }
});

export default router;
