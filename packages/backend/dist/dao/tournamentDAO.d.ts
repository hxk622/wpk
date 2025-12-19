import { BaseDAO } from './baseDAO';
import { Tournament, TournamentRegistration, TournamentRanking, BlindStructure } from '../types';
export interface TournamentDAO extends BaseDAO<Tournament, string> {
    getByStatus(status: Tournament['status']): Promise<Tournament[]>;
    getUpcomingTournaments(limit?: number): Promise<Tournament[]>;
    getUserTournaments(userId: string): Promise<Tournament[]>;
}
export interface TournamentRegistrationDAO extends BaseDAO<TournamentRegistration, string> {
    getByTournamentId(tournamentId: string): Promise<TournamentRegistration[]>;
    getByTournamentAndUserId(tournamentId: string, userId: string): Promise<TournamentRegistration | null>;
    updateRegistrationStatus(registrationId: string, status: TournamentRegistration['status']): Promise<TournamentRegistration | null>;
}
export interface TournamentRankingDAO extends BaseDAO<TournamentRanking, string> {
    getByTournamentId(tournamentId: string): Promise<TournamentRanking[]>;
    getByTournamentAndUserId(tournamentId: string, userId: string): Promise<TournamentRanking | null>;
}
export interface BlindStructureDAO extends BaseDAO<BlindStructure, string> {
    getDefaultStructure(): Promise<BlindStructure | null>;
}
