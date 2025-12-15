declare class LoggerService {
    static error(message: string, meta?: any): void;
    static warn(message: string, meta?: any): void;
    static info(message: string, meta?: any): void;
    static http(message: string, meta?: any): void;
    static verbose(message: string, meta?: any): void;
    static debug(message: string, meta?: any): void;
    static silly(message: string, meta?: any): void;
    static gameEvent(event: string, sessionId: string, playerId?: string, data?: any): void;
    static playerAction(action: string, sessionId: string, playerId: string, details?: any): void;
    static errorEvent(error: Error, sessionId?: string, playerId?: string): void;
    static tournamentEvent(event: string, tournamentId: string, userId?: string, data?: any): void;
    private static enrichMeta;
}
export default LoggerService;
