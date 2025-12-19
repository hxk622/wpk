export interface RequestContext {
    requestId: string;
    sessionId?: string;
    userId?: string;
}
export declare class ContextManager {
    static generateRequestId(): string;
    static generateSessionId(): string;
    static setContext(context: RequestContext): void;
    static getContext(): RequestContext | undefined;
    static getRequestId(): string | undefined;
    static getSessionId(): string | undefined;
    static setSessionId(sessionId: string): void;
    static setUserId(userId: string): void;
}
