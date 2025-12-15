"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const securityService_1 = require("../services/securityService");
const authMiddleware_1 = require("../middlewares/authMiddleware");
// adminMiddleware 暂未实现，先留空导入避免编译报错
// import { adminMiddleware } from '../middlewares/adminMiddleware';
const adminMiddleware = (req, res, next) => next();
const multer_1 = require("../config/multer");
const loggerService_1 = __importDefault(require("../services/loggerService"));
const response_1 = require("../utils/response");
const router = express_1.default.Router();
// =================== 实名认证相关路由 ===================
// 提交实名认证请求（用户）
router.post('/realname/verify', authMiddleware_1.authMiddleware, multer_1.upload.fields([
    { name: 'idCardPhotoFront', maxCount: 1 },
    { name: 'idCardPhotoBack', maxCount: 1 },
]), async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('未授权', 401));
        }
        const { realName, idCard } = req.body;
        if (!realName || !idCard) {
            return res.status(400).json((0, response_1.errorResponse)('请提供真实姓名和身份证号码', 400));
        }
        // 处理上传的图片
        const files = req.files;
        const idCardPhotoFront = files?.idCardPhotoFront?.[0]?.path;
        const idCardPhotoBack = files?.idCardPhotoBack?.[0]?.path;
        if (!idCardPhotoFront || !idCardPhotoBack) {
            return res.status(400).json((0, response_1.errorResponse)('请上传身份证正反面照片', 400));
        }
        const verificationData = {
            realName,
            idCard,
            idCardPhotoFront,
            idCardPhotoBack
        };
        await securityService_1.securityService.submitRealNameVerification(userId, verificationData);
        res.status(200).json((0, response_1.successResponse)(null, '实名认证请求已提交，等待审核'));
    }
    catch (error) {
        loggerService_1.default.error('提交实名认证请求失败', {
            userId: req.user?.userId,
            error: error instanceof Error ? error.message : '未知错误'
        });
        next(error);
    }
});
// 获取用户实名认证状态（用户）
router.get('/realname/status', authMiddleware_1.authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('未授权', 401));
        }
        // 这里应该从用户服务获取，暂时使用安全服务
        // TODO: 将获取用户信息的功能移到用户服务
        const user = await (await Promise.resolve().then(() => __importStar(require('../dao/impl/postgreSQLUserDAO')))).postgreSQLUserDAO.getById(userId);
        if (!user) {
            return res.status(404).json((0, response_1.errorResponse)('用户不存在', 404));
        }
        res.status(200).json((0, response_1.successResponse)({
            realNameVerified: user.real_name_verified || false,
            verificationStatus: user.verification_status || 'pending',
            verificationReason: user.verification_reason || null
        }, '获取实名认证状态成功'));
    }
    catch (error) {
        loggerService_1.default.error('获取实名认证状态失败', {
            userId: req.user?.userId,
            error: error instanceof Error ? error.message : '未知错误'
        });
        next(error);
    }
});
// 审核实名认证请求（管理员）
router.post('/admin/realname/review/:userId', authMiddleware_1.authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { status, reason } = req.body;
        if (!userId) {
            return res.status(400).json((0, response_1.errorResponse)('请提供用户ID', 400));
        }
        if (!status || !['verified', 'rejected'].includes(status)) {
            return res.status(400).json((0, response_1.errorResponse)('请提供有效的审核状态', 400));
        }
        await securityService_1.securityService.processVerificationResult(userId, status, reason);
        res.status(200).json((0, response_1.successResponse)(null, '实名认证审核已处理'));
    }
    catch (error) {
        loggerService_1.default.error('审核实名认证请求失败', {
            userId: req.params.userId,
            error: error instanceof Error ? error.message : '未知错误'
        });
        next(error);
    }
});
// =================== 反作弊检测相关路由 ===================
// 记录反作弊检测（系统/AI）
router.post('/cheat/detect', async (req, res, next) => {
    try {
        // 这里应该验证请求来源（内部服务或AI系统）
        const { userId, detectionType, detectionScore, evidenceData, gameSessionId } = req.body;
        if (!userId || !detectionType || detectionScore === undefined) {
            return res.status(400).json((0, response_1.errorResponse)('请提供必要的检测信息', 400));
        }
        const detection = await securityService_1.securityService.recordCheatDetection(userId, detectionType, detectionScore, evidenceData, gameSessionId);
        res.status(201).json((0, response_1.successResponse)({ detection }, '反作弊检测记录成功', 201));
    }
    catch (error) {
        loggerService_1.default.error('记录反作弊检测失败', {
            error: error instanceof Error ? error.message : '未知错误'
        });
        next(error);
    }
});
// 确认作弊检测（管理员）
router.post('/admin/cheat/confirm/:detectionId', authMiddleware_1.authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const { detectionId } = req.params;
        const { actionTaken } = req.body;
        if (!detectionId) {
            return res.status(400).json((0, response_1.errorResponse)('请提供检测ID', 400));
        }
        const detection = await securityService_1.securityService.confirmCheatDetection(detectionId, actionTaken || '');
        if (!detection) {
            return res.status(404).json((0, response_1.errorResponse)('检测记录不存在', 404));
        }
        res.status(200).json((0, response_1.successResponse)({ detection }, '作弊检测已确认'));
    }
    catch (error) {
        loggerService_1.default.error('确认作弊检测失败', {
            detectionId: req.params.detectionId,
            error: error instanceof Error ? error.message : '未知错误'
        });
        next(error);
    }
});
// 驳回作弊检测（管理员）
router.post('/admin/cheat/dismiss/:detectionId', authMiddleware_1.authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const { detectionId } = req.params;
        if (!detectionId) {
            return res.status(400).json((0, response_1.errorResponse)('请提供检测ID', 400));
        }
        const detection = await securityService_1.securityService.dismissCheatDetection(detectionId);
        if (!detection) {
            return res.status(404).json((0, response_1.errorResponse)('检测记录不存在', 404));
        }
        res.status(200).json((0, response_1.successResponse)({ detection }, '作弊检测已驳回'));
    }
    catch (error) {
        loggerService_1.default.error('驳回作弊检测失败', {
            detectionId: req.params.detectionId,
            error: error instanceof Error ? error.message : '未知错误'
        });
        next(error);
    }
});
// 获取用户作弊检测记录（管理员）
router.get('/admin/cheat/detections/:userId', authMiddleware_1.authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json((0, response_1.errorResponse)('请提供用户ID', 400));
        }
        // TODO: 实现获取用户检测记录的方法
        const detections = await (await Promise.resolve().then(() => __importStar(require('../dao/impl/postgreSQLSecurityDAO')))).postgreSQLSecurityDAO.getCheatDetectionsByUserId(userId);
        res.status(200).json((0, response_1.successResponse)({ detections }, '获取用户作弊检测记录成功'));
    }
    catch (error) {
        loggerService_1.default.error('获取用户作弊检测记录失败', {
            userId: req.params.userId,
            error: error instanceof Error ? error.message : '未知错误'
        });
        next(error);
    }
});
// =================== 用户警告相关路由 ===================
// 创建用户警告（管理员）
router.post('/admin/warnings', authMiddleware_1.authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const { userId, warningType, reason, severity, issuedBy, expiresAt } = req.body;
        if (!userId || !warningType || !reason || !severity || !issuedBy) {
            return res.status(400).json((0, response_1.errorResponse)('请提供必要的警告信息', 400));
        }
        const warning = await securityService_1.securityService.createUserWarning(userId, {
            userId,
            warningType,
            reason,
            severity,
            issuedBy,
            issuedAt: new Date(),
            expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
        res.status(201).json((0, response_1.successResponse)({ warning }, '用户警告创建成功', 201));
    }
    catch (error) {
        loggerService_1.default.error('创建用户警告失败', {
            userId: req.body.userId,
            error: error instanceof Error ? error.message : '未知错误'
        });
        next(error);
    }
});
// 获取用户警告（用户/管理员）
router.get('/warnings/:userId', authMiddleware_1.authMiddleware, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { includeResolved } = req.query;
        if (!userId) {
            return res.status(400).json((0, response_1.errorResponse)('请提供用户ID', 400));
        }
        // 检查是否为当前用户（由于当前用户接口只包含userId，管理员检查暂时注释掉）
        if (userId !== req.user?.userId) {
            return res.status(403).json((0, response_1.errorResponse)('没有权限查看其他用户的警告', 403));
        }
        const warnings = await securityService_1.securityService.getUserWarnings(userId, includeResolved === 'true');
        res.status(200).json((0, response_1.successResponse)({ warnings }, '获取用户警告成功'));
    }
    catch (error) {
        loggerService_1.default.error('获取用户警告失败', {
            userId: req.params.userId,
            error: error instanceof Error ? error.message : '未知错误'
        });
        next(error);
    }
});
// 解决用户警告（管理员）
router.post('/admin/warnings/resolve/:warningId', authMiddleware_1.authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const { warningId } = req.params;
        if (!warningId) {
            return res.status(400).json((0, response_1.errorResponse)('请提供警告ID', 400));
        }
        const success = await securityService_1.securityService.resolveUserWarning(warningId, req.user?.userId || 'system');
        if (!success) {
            return res.status(404).json((0, response_1.errorResponse)('警告记录不存在', 404));
        }
        res.status(200).json((0, response_1.successResponse)(null, '警告已解决'));
    }
    catch (error) {
        loggerService_1.default.error('解决用户警告失败', {
            warningId: req.params.warningId,
            error: error instanceof Error ? error.message : '未知错误'
        });
        next(error);
    }
});
// =================== 异常检测相关路由 ===================
// 检测异常游戏行为（系统）
router.post('/detect/abnormal', async (req, res, next) => {
    try {
        // 这里应该验证请求来源（内部服务）
        const { userId, gameSessionId, gameData } = req.body;
        if (!userId || !gameSessionId || !gameData) {
            return res.status(400).json((0, response_1.errorResponse)('请提供必要的游戏数据', 400));
        }
        const detection = await securityService_1.securityService.detectAbnormalGameBehavior(userId, gameSessionId, gameData);
        res.status(200).json((0, response_1.successResponse)({ detection }, detection ? '异常游戏行为检测完成' : '未检测到异常行为'));
    }
    catch (error) {
        loggerService_1.default.error('检测异常游戏行为失败', {
            error: error instanceof Error ? error.message : '未知错误'
        });
        next(error);
    }
});
// 检测多账户操作（系统）
router.post('/detect/multi-account', async (req, res, next) => {
    try {
        // 这里应该验证请求来源（内部服务）
        const { userId, ipAddress, deviceInfo } = req.body;
        if (!userId || !ipAddress || !deviceInfo) {
            return res.status(400).json((0, response_1.errorResponse)('请提供必要的设备和IP信息', 400));
        }
        const detection = await securityService_1.securityService.detectMultiAccount(userId, ipAddress, deviceInfo);
        res.status(200).json((0, response_1.successResponse)({ detection }, detection ? '多账户操作检测完成' : '未检测到多账户操作'));
    }
    catch (error) {
        loggerService_1.default.error('检测多账户操作失败', {
            error: error instanceof Error ? error.message : '未知错误'
        });
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=security.js.map