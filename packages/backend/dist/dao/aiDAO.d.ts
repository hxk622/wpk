import { AIAnalysis, AISuggestion, AITrainingData } from '../types';
import { BaseDAO } from './baseDAO';
export interface AIAnalysisDAO extends BaseDAO<AIAnalysis, string> {
    getByUser(userId: string): Promise<AIAnalysis[]>;
    getBySession(sessionId: string): Promise<AIAnalysis[]>;
    getLatestBySession(sessionId: string): Promise<AIAnalysis | null>;
}
export interface AISuggestionDAO extends BaseDAO<AISuggestion, string> {
    getByUser(userId: string): Promise<AISuggestion[]>;
    getBySession(sessionId: string): Promise<AISuggestion[]>;
    getLatestBySession(sessionId: string): Promise<AISuggestion | null>;
}
export interface AITrainingDataDAO extends BaseDAO<AITrainingData, string> {
    getByUser(userId: string, limit?: number): Promise<AITrainingData[]>;
    getBySession(sessionId: string): Promise<AITrainingData[]>;
    batchInsert(data: AITrainingData[]): Promise<string[]>;
    getTrainingStats(userId?: string): Promise<{
        total: number;
        byResult: Record<string, number>;
        byAction: Record<string, number>;
    }>;
}
