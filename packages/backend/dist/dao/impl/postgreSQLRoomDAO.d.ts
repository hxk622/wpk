import { GameRoom, CreateRoomInput } from '../../types';
import { RoomDAO } from '../roomDAO';
export declare class PostgreSQLRoomDAO implements RoomDAO {
    private static readonly TABLE_NAME;
    private static readonly CACHE_KEY_PREFIX;
    create(entity: Omit<GameRoom, 'id' | 'created_at' | 'updated_at'>): Promise<GameRoom>;
    getById(id: string): Promise<GameRoom | null>;
    update(id: string, entity: Partial<GameRoom>): Promise<GameRoom | null>;
    delete(id: string): Promise<boolean>;
    getAll(): Promise<GameRoom[]>;
    getPublicRooms(): Promise<GameRoom[]>;
    getRoomsByOwner(ownerId: string): Promise<GameRoom[]>;
    getRoomsByStatus(status: 'waiting' | 'playing' | 'finished'): Promise<GameRoom[]>;
    createRoom(input: CreateRoomInput, ownerId: string): Promise<GameRoom>;
    updatePlayerCount(roomId: string, delta: number): Promise<GameRoom | null>;
    updateStatus(roomId: string, status: 'waiting' | 'playing' | 'finished'): Promise<GameRoom | null>;
    joinRoom(roomId: string, userId: string): Promise<boolean>;
    leaveRoom(roomId: string, userId: string): Promise<boolean>;
    getUserCurrentRoom(userId: string): Promise<string | null>;
    private invalidateRoomListCache;
}
export declare const postgreSQLRoomDAO: PostgreSQLRoomDAO;
