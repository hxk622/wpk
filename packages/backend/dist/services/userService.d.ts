import { RegisterUserInput, LoginUserInput } from '@poker/shared';
import { User } from '../types/index';
export declare const registerUser: (input: RegisterUserInput) => Promise<User>;
export declare const loginUser: (input: LoginUserInput) => Promise<{
    user: User;
    token: string;
}>;
export declare const getUserById: (userId: string) => Promise<User | null>;
export declare const updateUserProfile: (userId: string, data: Partial<User>) => Promise<User | null>;
export declare const getUserStats: (userId: string) => Promise<any>;
export declare const updateUserChips: (userId: string, chips: number) => Promise<User | null>;
export declare const resetPassword: (userId: string, oldPassword: string, newPassword: string) => Promise<User | null>;
