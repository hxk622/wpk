import { GameRoom, CreateRoomInput } from '../types';
import { BaseDAO } from './baseDAO';
export interface RoomDAO extends BaseDAO<GameRoom, string> {
    getPublicRooms(): Promise<GameRoom[]>;
    getRoomsByOwner(ownerId: string): Promise<GameRoom[]>;
    getRoomsByStatus(status: 'waiting' | 'playing' | 'finished'): Promise<GameRoom[]>;
    createRoom(input: CreateRoomInput, ownerId: string): Promise<GameRoom>;
    updatePlayerCount(roomId: string, delta: number): Promise<GameRoom | null>;
    updateStatus(roomId: string, status: 'waiting' | 'playing' | 'finished'): Promise<GameRoom | null>;
    getUserCurrentRoom(userId: string): Promise<string | null>;
}
