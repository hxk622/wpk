"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accountService_1 = require("../services/accountService");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
// 支付方式相关路由
router.post('/payment-methods', authMiddleware_1.authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('用户未登录', 401));
        }
        const input = req.body;
        const paymentMethod = await accountService_1.accountService.createPaymentMethod(userId, input);
        return res.status(201).json((0, response_1.successResponse)({ paymentMethod }, '支付方式创建成功', 201));
    }
    catch (error) {
        next(error);
    }
});
router.get('/payment-methods', authMiddleware_1.authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('用户未登录', 401));
        }
        const paymentMethods = await accountService_1.accountService.getPaymentMethods(userId);
        return res.status(200).json((0, response_1.successResponse)({ paymentMethods }, '获取支付方式列表成功'));
    }
    catch (error) {
        next(error);
    }
});
router.get('/payment-methods/:id', authMiddleware_1.authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('用户未登录', 401));
        }
        const methodId = req.params.id;
        const paymentMethod = await accountService_1.accountService.getPaymentMethodById(userId, methodId);
        if (!paymentMethod) {
            return res.status(404).json((0, response_1.errorResponse)('支付方式不存在', 404));
        }
        return res.status(200).json((0, response_1.successResponse)({ paymentMethod }, '获取支付方式成功'));
    }
    catch (error) {
        next(error);
    }
});
router.put('/payment-methods/:id', authMiddleware_1.authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('用户未登录', 401));
        }
        const methodId = req.params.id;
        const updates = req.body;
        const paymentMethod = await accountService_1.accountService.updatePaymentMethod(userId, methodId, updates);
        if (!paymentMethod) {
            return res.status(404).json((0, response_1.errorResponse)('支付方式不存在', 404));
        }
        return res.status(200).json((0, response_1.successResponse)({ paymentMethod }, '支付方式更新成功'));
    }
    catch (error) {
        next(error);
    }
});
router.delete('/payment-methods/:id', authMiddleware_1.authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: '用户未登录' });
        }
        const methodId = req.params.id;
        const success = await accountService_1.accountService.deletePaymentMethod(userId, methodId);
        if (!success) {
            return res.status(404).json({ message: '支付方式不存在' });
        }
        return res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// 交易相关路由
router.post('/deposit', authMiddleware_1.authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('用户未登录', 401));
        }
        const input = req.body;
        const transaction = await accountService_1.accountService.deposit(userId, input);
        return res.status(201).json((0, response_1.successResponse)({ transaction }, '存款成功', 201));
    }
    catch (error) {
        next(error);
    }
});
router.post('/withdraw', authMiddleware_1.authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('用户未登录', 401));
        }
        const input = req.body;
        const transaction = await accountService_1.accountService.withdraw(userId, input);
        return res.status(201).json((0, response_1.successResponse)({ transaction }, '取款成功', 201));
    }
    catch (error) {
        next(error);
    }
});
router.get('/transactions', authMiddleware_1.authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('用户未登录', 401));
        }
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const transactions = await accountService_1.accountService.getTransactions(userId, limit, offset);
        return res.status(200).json((0, response_1.successResponse)({ transactions }, '获取交易记录成功'));
    }
    catch (error) {
        next(error);
    }
});
router.get('/transactions/:id', authMiddleware_1.authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('用户未登录', 401));
        }
        const transactionId = req.params.id;
        const transaction = await accountService_1.accountService.getTransactionById(userId, transactionId);
        if (!transaction) {
            return res.status(404).json((0, response_1.errorResponse)('交易记录不存在', 404));
        }
        return res.status(200).json((0, response_1.successResponse)({ transaction }, '获取交易记录成功'));
    }
    catch (error) {
        next(error);
    }
});
// 账户信息路由
router.get('/balance', authMiddleware_1.authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json((0, response_1.errorResponse)('用户未登录', 401));
        }
        const balance = await accountService_1.accountService.getAccountBalance(userId);
        return res.status(200).json((0, response_1.successResponse)({ balance }, '获取账户余额成功'));
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=accounts.js.map