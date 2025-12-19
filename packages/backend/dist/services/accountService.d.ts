import { PaymentMethod, Transaction, CreatePaymentMethodInput, DepositInput, WithdrawInput } from '../types';
export declare class AccountService {
    private static instance;
    private constructor();
    static getInstance(): AccountService;
    createPaymentMethod(userId: string, input: CreatePaymentMethodInput): Promise<PaymentMethod>;
    getPaymentMethods(userId: string): Promise<PaymentMethod[]>;
    getPaymentMethodById(userId: string, methodId: string): Promise<PaymentMethod | null>;
    updatePaymentMethod(userId: string, methodId: string, updates: Partial<CreatePaymentMethodInput>): Promise<PaymentMethod | null>;
    deletePaymentMethod(userId: string, methodId: string): Promise<boolean>;
    deposit(userId: string, input: DepositInput): Promise<Transaction>;
    withdraw(userId: string, input: WithdrawInput): Promise<Transaction>;
    getTransactions(userId: string, limit?: number, offset?: number): Promise<Transaction[]>;
    getTransactionById(userId: string, transactionId: string): Promise<Transaction | null>;
    recordGameTransaction(userId: string, sessionId: string, type: 'game_win' | 'game_loss', amount: number): Promise<Transaction>;
    getAccountBalance(userId: string): Promise<{
        chips: number;
        moneyEquivalent: number;
    }>;
}
export declare const accountService: AccountService;
