import { PaymentMethod, Transaction } from '../../types';
export declare class PostgreSQLPaymentMethodDAO {
    private static readonly TABLE_NAME;
    private static readonly CACHE_KEY_PREFIX;
    create(entity: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethod>;
    getById(id: string): Promise<PaymentMethod | null>;
    getByUserId(userId: string): Promise<PaymentMethod[]>;
    update(id: string, entity: Partial<PaymentMethod>): Promise<PaymentMethod | null>;
    delete(id: string): Promise<boolean>;
    private setAllNonDefault;
}
export declare class PostgreSQLTransactionDAO {
    private static readonly TABLE_NAME;
    private static readonly CACHE_KEY_PREFIX;
    create(entity: Omit<Transaction, 'id' | 'createdAt' | 'completedAt'>): Promise<Transaction>;
    getById(id: string): Promise<Transaction | null>;
    getByUserId(userId: string, limit?: number, offset?: number): Promise<Transaction[]>;
    updateStatus(id: string, status: Transaction['status']): Promise<Transaction | null>;
    getByStatus(status: Transaction['status'], limit?: number): Promise<Transaction[]>;
}
export declare const postgreSQLPaymentMethodDAO: PostgreSQLPaymentMethodDAO;
export declare const postgreSQLTransactionDAO: PostgreSQLTransactionDAO;
