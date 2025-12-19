import { BaseDAO } from './baseDAO';
import { Tournament, TournamentRegistration, TournamentRanking, BlindStructure } from '../types';

// 锦标赛DAO接口
export interface TournamentDAO extends BaseDAO<Tournament, string> {
  // 根据状态获取锦标赛
  getByStatus(status: Tournament['status']): Promise<Tournament[]>;
  
  // 获取即将开始的锦标赛
  getUpcomingTournaments(limit?: number): Promise<Tournament[]>;
  
  // 获取用户注册的锦标赛
  getUserTournaments(userId: string): Promise<Tournament[]>;
}

// 锦标赛注册DAO接口
export interface TournamentRegistrationDAO extends BaseDAO<TournamentRegistration, string> {
  // 获取锦标赛的所有注册信息
  getByTournamentId(tournamentId: string): Promise<TournamentRegistration[]>;
  
  // 获取用户在特定锦标赛的注册信息
  getByTournamentAndUserId(tournamentId: string, userId: string): Promise<TournamentRegistration | null>;
  
  // 更新用户在锦标赛中的状态
  updateRegistrationStatus(registrationId: string, status: TournamentRegistration['status']): Promise<TournamentRegistration | null>;
}

// 锦标赛排名DAO接口
export interface TournamentRankingDAO extends BaseDAO<TournamentRanking, string> {
  // 获取锦标赛的排名
  getByTournamentId(tournamentId: string): Promise<TournamentRanking[]>;
  
  // 获取用户在锦标赛中的排名
  getByTournamentAndUserId(tournamentId: string, userId: string): Promise<TournamentRanking | null>;
}

// 盲注结构DAO接口
export interface BlindStructureDAO extends BaseDAO<BlindStructure, string> {
  // 获取默认盲注结构
  getDefaultStructure(): Promise<BlindStructure | null>;
}
