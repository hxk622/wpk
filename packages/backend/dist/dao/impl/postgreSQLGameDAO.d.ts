import { GameSession, PlayerSession, Action, CommunityCards } from '../../types';
import { GameSessionDAO, PlayerSessionDAO, ActionDAO, CommunityCardsDAO } from '../gameDAO';
export declare class PostgreSQLGameSessionDAO implements GameSessionDAO {
    private static readonly TABLE_NAME;
    private static readonly CACHE_KEY_PREFIX;
    create(entity: Omit<GameSession, 'id' | 'created_at' | 'updated_at'>): Promise<GameSession>;
    getById(id: string): Promise<GameSession | null>;
    update(id: string, entity: Partial<GameSession>): Promise<GameSession | null>;
    delete(id: string): Promise<boolean>;
    getAll(): Promise<GameSession[]>;
    getSessionsByRoom(roomId: string): Promise<GameSession[]>;
    getActiveSessions(): Promise<GameSession[]>;
    updateRound(sessionId: string, round: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'): Promise<GameSession | null>;
    updateStatus(sessionId: string, status: 'in_progress' | 'finished'): Promise<GameSession | null>;
    updatePot(sessionId: string, pot: number): Promise<GameSession | null>;
}
export declare class PostgreSQLPlayerSessionDAO implements PlayerSessionDAO {
    private static readonly TABLE_NAME;
    private static readonly CACHE_KEY_PREFIX;
    create(entity: Omit<PlayerSession, 'id' | 'created_at' | 'updated_at'>): Promise<PlayerSession>;
    getById(id: string): Promise<PlayerSession | null>;
    update(id: string, entity: Partial<PlayerSession>): Promise<PlayerSession | null>;
    delete(id: string): Promise<boolean>;
    getAll(): Promise<PlayerSession[]>;
    getPlayersBySession(sessionId: string): Promise<PlayerSession[]>;
    getActiveSessionByPlayer(roomId: string, playerId: string): Promise<PlayerSession | null>;
    updateStatus(sessionId: string, playerId: string, status: 'active' | 'folded' | 'all_in' | 'out'): Promise<PlayerSession | null>;
    updateChips(sessionId: string, playerId: string, chipsInPot: number, chipsRemaining: number): Promise<PlayerSession | null>;
}
export declare class PostgreSQLActionDAO implements ActionDAO {
    private static readonly TABLE_NAME;
    private static readonly CACHE_KEY_PREFIX;
    create(entity: Omit<Action, 'id' | 'created_at' | 'updated_at'>): Promise<Action>;
    getById(id: string): Promise<Action | null>;
    update(id: string, entity: Partial<Action>): Promise<Action | null>;
    delete(id: string): Promise<boolean>;
    getAll(): Promise<Action[]>;
    getActionsBySession(sessionId: string): Promise<Action[]>;
    getActionsByRound(sessionId: string, round: 'preflop' | 'flop' | 'turn' | 'river'): Promise<Action[]>;
}
export declare class PostgreSQLCommunityCardsDAO implements CommunityCardsDAO {
    private static readonly TABLE_NAME;
    private static readonly CACHE_KEY_PREFIX;
    create(entity: Omit<CommunityCards, 'id' | 'created_at' | 'updated_at'>): Promise<CommunityCards>;
    getById(id: string): Promise<CommunityCards | null>;
    update(id: string, entity: Partial<CommunityCards>): Promise<CommunityCards | null>;
    delete(id: string): Promise<boolean>;
    getAll(): Promise<CommunityCards[]>;
    getBySession(sessionId: string): Promise<CommunityCards | null>;
    updateFlop(sessionId: string, flop: any[]): Promise<CommunityCards | null>;
    updateTurn(sessionId: string, turn: any): Promise<CommunityCards | null>;
    updateRiver(sessionId: string, river: any): Promise<CommunityCards | null>;
}
export declare const postgreSQLGameSessionDAO: PostgreSQLGameSessionDAO;
export declare const postgreSQLPlayerSessionDAO: PostgreSQLPlayerSessionDAO;
export declare const postgreSQLActionDAO: PostgreSQLActionDAO;
export declare const postgreSQLCommunityCardsDAO: PostgreSQLCommunityCardsDAO;
