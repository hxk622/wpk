import { GameSession, PlayerSession, Action, CommunityCards } from '../types';
import { BaseDAO } from './baseDAO';
export interface GameSessionDAO extends BaseDAO<GameSession, string> {
    getSessionsByRoom(roomId: string): Promise<GameSession[]>;
    getActiveSessions(): Promise<GameSession[]>;
    updateRound(sessionId: string, round: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'): Promise<GameSession | null>;
    updateStatus(sessionId: string, status: 'in_progress' | 'finished'): Promise<GameSession | null>;
    updatePot(sessionId: string, pot: number): Promise<GameSession | null>;
}
export interface PlayerSessionDAO extends BaseDAO<PlayerSession, string> {
    getPlayersBySession(sessionId: string): Promise<PlayerSession[]>;
    getActiveSessionByPlayer(roomId: string, playerId: string): Promise<PlayerSession | null>;
    updateStatus(sessionId: string, playerId: string, status: 'active' | 'folded' | 'all_in' | 'out'): Promise<PlayerSession | null>;
    updateChips(sessionId: string, playerId: string, chipsInPot: number, chipsRemaining: number): Promise<PlayerSession | null>;
}
export interface ActionDAO extends BaseDAO<Action, string> {
    getActionsBySession(sessionId: string): Promise<Action[]>;
    getActionsByRound(sessionId: string, round: 'preflop' | 'flop' | 'turn' | 'river'): Promise<Action[]>;
}
export interface CommunityCardsDAO extends BaseDAO<CommunityCards, string> {
    getBySession(sessionId: string): Promise<CommunityCards | null>;
    updateFlop(sessionId: string, flop: any[]): Promise<CommunityCards | null>;
    updateTurn(sessionId: string, turn: any): Promise<CommunityCards | null>;
    updateRiver(sessionId: string, river: any): Promise<CommunityCards | null>;
}
