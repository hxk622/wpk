import { Router, Request, Response, NextFunction } from 'express';
import { accountService } from '../services/accountService';
import { authMiddleware } from '../middlewares/authMiddleware';
import { DepositInput, WithdrawInput, CreatePaymentMethodInput } from '../types';
import { successResponse, errorResponse } from '../utils/response';

const router = Router();

// 支付方式相关路由
router.post('/payment-methods', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('用户未登录', 401));
    }

    const input: CreatePaymentMethodInput = req.body;
    const paymentMethod = await accountService.createPaymentMethod(userId, input);
    return res.status(201).json(successResponse({ paymentMethod }, '支付方式创建成功', 201));
  } catch (error) {
    next(error);
  }
});

router.get('/payment-methods', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('用户未登录', 401));
    }

    const paymentMethods = await accountService.getPaymentMethods(userId);
    return res.status(200).json(successResponse({ paymentMethods }, '获取支付方式列表成功'));
  } catch (error) {
    next(error);
  }
});

router.get('/payment-methods/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('用户未登录', 401));
    }

    const methodId = req.params.id;
    const paymentMethod = await accountService.getPaymentMethodById(userId, methodId);
    if (!paymentMethod) {
      return res.status(404).json(errorResponse('支付方式不存在', 404));
    }

    return res.status(200).json(successResponse({ paymentMethod }, '获取支付方式成功'));
  } catch (error) {
    next(error);
  }
});

router.put('/payment-methods/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('用户未登录', 401));
    }

    const methodId = req.params.id;
    const updates: Partial<CreatePaymentMethodInput> = req.body;
    const paymentMethod = await accountService.updatePaymentMethod(userId, methodId, updates);
    if (!paymentMethod) {
      return res.status(404).json(errorResponse('支付方式不存在', 404));
    }

    return res.status(200).json(successResponse({ paymentMethod }, '支付方式更新成功'));
  } catch (error) {
    next(error);
  }
});

router.delete('/payment-methods/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: '用户未登录' });
    }

    const methodId = req.params.id;
    const success = await accountService.deletePaymentMethod(userId, methodId);
    if (!success) {
      return res.status(404).json({ message: '支付方式不存在' });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// 交易相关路由
router.post('/deposit', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('用户未登录', 401));
    }

    const input: DepositInput = req.body;
    const transaction = await accountService.deposit(userId, input);
    return res.status(201).json(successResponse({ transaction }, '存款成功', 201));
  } catch (error) {
    next(error);
  }
});

router.post('/withdraw', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('用户未登录', 401));
    }

    const input: WithdrawInput = req.body;
    const transaction = await accountService.withdraw(userId, input);
    return res.status(201).json(successResponse({ transaction }, '取款成功', 201));
  } catch (error) {
    next(error);
  }
});

router.get('/transactions', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('用户未登录', 401));
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const transactions = await accountService.getTransactions(userId, limit, offset);
    return res.status(200).json(successResponse({ transactions }, '获取交易记录成功'));
  } catch (error) {
    next(error);
  }
});

router.get('/transactions/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('用户未登录', 401));
    }

    const transactionId = req.params.id;
    const transaction = await accountService.getTransactionById(userId, transactionId);
    if (!transaction) {
      return res.status(404).json(errorResponse('交易记录不存在', 404));
    }

    return res.status(200).json(successResponse({ transaction }, '获取交易记录成功'));
  } catch (error) {
    next(error);
  }
});

// 账户信息路由
router.get('/balance', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json(errorResponse('用户未登录', 401));
    }

    const balance = await accountService.getAccountBalance(userId);
    return res.status(200).json(successResponse({ balance }, '获取账户余额成功'));
  } catch (error) {
    next(error);
  }
});

export default router;
