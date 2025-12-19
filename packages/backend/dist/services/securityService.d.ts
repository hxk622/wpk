import { CheatDetection, UserWarning, RealNameVerificationRequest } from '../types';
export declare class SecurityService {
    private static readonly INSTANCE;
    private constructor();
    static getInstance(): SecurityService;
    submitRealNameVerification(userId: string, verificationData: RealNameVerificationRequest): Promise<boolean>;
    processVerificationResult(userId: string, status: 'verified' | 'rejected', reason?: string): Promise<boolean>;
    recordCheatDetection(userId: string, detectionType: CheatDetection['detectionType'], detectionScore: number, evidenceData: any, gameSessionId?: string): Promise<CheatDetection>;
    confirmCheatDetection(detectionId: string, actionTaken: string): Promise<CheatDetection | null>;
    dismissCheatDetection(detectionId: string): Promise<CheatDetection | null>;
    createUserWarning(userId: string, warningData: Omit<UserWarning, 'id' | 'createdAt' | 'isResolved'>): Promise<UserWarning>;
    getUserWarnings(userId: string, includeResolved?: boolean): Promise<UserWarning[]>;
    resolveUserWarning(warningId: string, resolvedBy: string): Promise<boolean>;
    checkUserHasSevereWarnings(userId: string): Promise<boolean>;
    detectAbnormalGameBehavior(userId: string, gameSessionId: string, gameData: any): Promise<CheatDetection | null>;
    detectMultiAccount(userId: string, ipAddress: string, deviceInfo: string): Promise<CheatDetection | null>;
    private calculateAbnormalScore;
    private isValidIdCard;
}
export declare const securityService: SecurityService;
