// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  userId: string;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  totalChipsWon: number;
  totalChipsLost: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface UserResponse {
  user: User;
  token: string;
}

// 房间相关类型
export interface Room {
  id: string;
  name: string;
  description: string;
  minBuyIn: number;
  maxBuyIn: number;
  currentPlayers: number;
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
}

export interface RoomDetail extends Room {
  players: Player[];
  gameHistory: GameHistory[];
}

export interface CreateRoomRequest {
  name: string;
  description: string;
  minBuyIn: number;
  maxBuyIn: number;
  maxPlayers: number;
}

// 游戏相关类型
export enum GameStatus {
  WAITING = 'waiting',
  PREFLOP = 'preflop',
  FLOP = 'flop',
  TURN = 'turn',
  RIVER = 'river',
  SHOWDOWN = 'showdown',
  FINISHED = 'finished'
}

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
}

export interface Player {
  userId: string;
  username: string;
  avatar?: string;
  chips: number;
  bet: number;
  cards: Card[];
  status: 'active' | 'folded' | 'all-in' | 'out';
  isTurn: boolean;
  isDealer: boolean;
}

export interface Game {
  id: string;
  roomId: string;
  status: GameStatus;
  currentPlayerIndex: number;
  pot: number;
  round: number;
  smallBlind: number;
  bigBlind: number;
  communityCards: Card[];
  players: Player[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GameHistory {
  id: string;
  gameId: string;
  roomId: string;
  winnerId: string;
  winningHand: string;
  potAmount: number;
  date: Date;
  players: Player[];
}

export interface GameAction {
  type: 'fold' | 'call' | 'raise' | 'check' | 'all-in';
  userId: string;
  amount?: number;
  timestamp: Date;
}

// 聊天相关类型
export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  type: 'normal' | 'system' | 'action';
}

// 通用类型
export interface ErrorResponse {
  message: string;
  code?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
