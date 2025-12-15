import { User, RegisterUserInput } from '../types';
import { BaseDAO } from './baseDAO';
export interface UserDAO extends BaseDAO<User, string> {
    getByUsername(username: string): Promise<User | null>;
    getByEmail(email: string): Promise<User | null>;
    getByPhone(phone: string): Promise<User | null>;
    register(input: RegisterUserInput): Promise<User>;
    updateChips(userId: string, chips: number): Promise<User | null>;
}
