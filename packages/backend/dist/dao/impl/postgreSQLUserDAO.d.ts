import { User, RegisterUserInput } from '../../types';
import { UserDAO } from '../userDAO';
export declare class PostgreSQLUserDAO implements UserDAO {
    private static readonly TABLE_NAME;
    private static readonly CACHE_KEY_PREFIX;
    create(entity: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User>;
    getById(id: string): Promise<User | null>;
    update(id: string, entity: Partial<User>): Promise<User | null>;
    delete(id: string): Promise<boolean>;
    getAll(): Promise<User[]>;
    getByUsername(username: string): Promise<User | null>;
    getByEmail(email: string): Promise<User | null>;
    getByPhone(phone: string): Promise<User | null>;
    register(input: RegisterUserInput): Promise<User>;
    updateChips(userId: string, chips: number): Promise<User | null>;
}
export declare const postgreSQLUserDAO: PostgreSQLUserDAO;
