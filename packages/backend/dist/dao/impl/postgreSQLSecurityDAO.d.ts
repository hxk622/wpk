import { CheatDetection, UserWarning, RealNameVerificationRequest } from '../../types';
export declare class PostgreSQLSecurityDAO {
    private static readonly USER_TABLE;
    private static readonly CHEAT_DETECTION_TABLE;
    private static readonly USER_WARNING_TABLE;
    private static readonly CACHE_KEY_PREFIX;
    updateRealNameVerification(userId: string, verificationData: RealNameVerificationRequest): Promise<boolean>;
    updateVerificationStatus(userId: string, status: 'verified' | 'rejected', reason?: string): Promise<boolean>;
    createCheatDetection(detection: Omit<CheatDetection, 'id' | 'createdAt'>): Promise<CheatDetection>;
    updateCheatDetection(id: string, updates: Partial<CheatDetection>): Promise<CheatDetection | null>;
    getCheatDetectionsByUserId(userId: string, limit?: number, offset?: number): Promise<CheatDetection[]>;
    createUserWarning(warning: Omit<UserWarning, 'id' | 'createdAt'>): Promise<UserWarning>;
    getUserWarnings(userId: string, includeResolved?: boolean): Promise<UserWarning[]>;
    resolveWarning(warningId: string, resolvedBy: string): Promise<boolean>;
    hasSevereWarnings(userId: string): Promise<boolean>;
}
export declare const postgreSQLSecurityDAO: PostgreSQLSecurityDAO;
