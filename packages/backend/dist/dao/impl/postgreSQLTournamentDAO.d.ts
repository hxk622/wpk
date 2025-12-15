import { Tournament, TournamentRegistration, TournamentRanking, BlindStructure } from '../../types';
import { TournamentDAO, TournamentRegistrationDAO, TournamentRankingDAO, BlindStructureDAO } from '../tournamentDAO';
export declare class PostgreSQLTournamentDAO implements TournamentDAO {
    private static readonly TABLE_NAME;
    private static readonly CACHE_KEY_PREFIX;
    create(entity: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>): Promise<Tournament>;
    getById(id: string): Promise<Tournament | null>;
    update(id: string, entity: Partial<Tournament>): Promise<Tournament | null>;
    delete(id: string): Promise<boolean>;
    getAll(): Promise<Tournament[]>;
    getByStatus(status: Tournament['status']): Promise<Tournament[]>;
    getUpcomingTournaments(limit?: number): Promise<Tournament[]>;
    getUserTournaments(userId: string): Promise<Tournament[]>;
}
export declare class PostgreSQLTournamentRegistrationDAO implements TournamentRegistrationDAO {
    private static readonly TABLE_NAME;
    private static readonly CACHE_KEY_PREFIX;
    create(entity: Omit<TournamentRegistration, 'id' | 'created_at' | 'updated_at'>): Promise<TournamentRegistration>;
    getById(id: string): Promise<TournamentRegistration | null>;
    update(id: string, entity: Partial<TournamentRegistration>): Promise<TournamentRegistration | null>;
    delete(id: string): Promise<boolean>;
    getAll(): Promise<TournamentRegistration[]>;
    getByTournamentId(tournamentId: string): Promise<TournamentRegistration[]>;
    getByTournamentAndUserId(tournamentId: string, userId: string): Promise<TournamentRegistration | null>;
    updateRegistrationStatus(registrationId: string, status: TournamentRegistration['status']): Promise<TournamentRegistration | null>;
}
export declare class PostgreSQLTournamentRankingDAO implements TournamentRankingDAO {
    private static readonly TABLE_NAME;
    private static readonly CACHE_KEY_PREFIX;
    create(entity: Omit<TournamentRanking, 'id' | 'created_at' | 'updated_at'>): Promise<TournamentRanking>;
    getById(id: string): Promise<TournamentRanking | null>;
    update(id: string, entity: Partial<TournamentRanking>): Promise<TournamentRanking | null>;
    delete(id: string): Promise<boolean>;
    getAll(): Promise<TournamentRanking[]>;
    getByTournamentId(tournamentId: string): Promise<TournamentRanking[]>;
    getByTournamentAndUserId(tournamentId: string, userId: string): Promise<TournamentRanking | null>;
}
export declare class PostgreSQLBlindStructureDAO implements BlindStructureDAO {
    private static readonly TABLE_NAME;
    private static readonly CACHE_KEY_PREFIX;
    create(entity: Omit<BlindStructure, 'id' | 'created_at' | 'updated_at'>): Promise<BlindStructure>;
    getById(id: string): Promise<BlindStructure | null>;
    update(id: string, entity: Partial<BlindStructure>): Promise<BlindStructure | null>;
    delete(id: string): Promise<boolean>;
    getAll(): Promise<BlindStructure[]>;
    getDefaultStructure(): Promise<BlindStructure | null>;
}
