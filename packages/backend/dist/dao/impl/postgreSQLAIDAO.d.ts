import { AIAnalysis, AISuggestion, AITrainingData } from '../../types';
import { AIAnalysisDAO, AISuggestionDAO, AITrainingDataDAO } from '../aiDAO';
export declare class PostgreSQLAIAnalysisDAO implements AIAnalysisDAO {
    private static readonly TABLE_NAME;
    private static readonly CACHE_KEY_PREFIX;
    create(entity: Omit<AIAnalysis, 'id' | 'created_at' | 'updated_at'>): Promise<AIAnalysis>;
    getById(id: string): Promise<AIAnalysis | null>;
    update(id: string, entity: Partial<AIAnalysis>): Promise<AIAnalysis | null>;
    delete(id: string): Promise<boolean>;
    getAll(): Promise<AIAnalysis[]>;
    getByUser(userId: string): Promise<AIAnalysis[]>;
    getBySession(sessionId: string): Promise<AIAnalysis[]>;
    getLatestBySession(sessionId: string): Promise<AIAnalysis | null>;
}
export declare class PostgreSQLAISuggestionDAO implements AISuggestionDAO {
    private static readonly TABLE_NAME;
    private static readonly CACHE_KEY_PREFIX;
    create(entity: Omit<AISuggestion, 'id' | 'created_at' | 'updated_at'>): Promise<AISuggestion>;
    getById(id: string): Promise<AISuggestion | null>;
    update(id: string, entity: Partial<AISuggestion>): Promise<AISuggestion | null>;
    delete(id: string): Promise<boolean>;
    getAll(): Promise<AISuggestion[]>;
    getByUser(userId: string): Promise<AISuggestion[]>;
    getBySession(sessionId: string): Promise<AISuggestion[]>;
    getLatestBySession(sessionId: string): Promise<AISuggestion | null>;
}
export declare class PostgreSQLAITrainingDataDAO implements AITrainingDataDAO {
    private static readonly TABLE_NAME;
    private static readonly CACHE_KEY_PREFIX;
    create(entity: Omit<AITrainingData, 'id' | 'createdAt'>): Promise<AITrainingData>;
    getById(id: string): Promise<AITrainingData | null>;
    update(id: string, entity: Partial<AITrainingData>): Promise<AITrainingData | null>;
    delete(id: string): Promise<boolean>;
    getAll(): Promise<AITrainingData[]>;
    getByUser(userId: string, limit?: number): Promise<AITrainingData[]>;
    getBySession(sessionId: string): Promise<AITrainingData[]>;
    batchInsert(data: AITrainingData[]): Promise<string[]>;
    getTrainingStats(userId?: string): Promise<{
        total: number;
        byResult: Record<string, number>;
        byAction: Record<string, number>;
    }>;
}
export declare const postgreSQLAIAnalysisDAO: PostgreSQLAIAnalysisDAO;
export declare const postgreSQLAISuggestionDAO: PostgreSQLAISuggestionDAO;
export declare const postgreSQLAITrainingDataDAO: PostgreSQLAITrainingDataDAO;
