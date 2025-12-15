import { v4 as uuidv4 } from 'uuid';

export enum UserRole {
  PLAYER = 'player',
  ADMIN = 'admin',
  GUEST = 'guest'
}

export enum RoomStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  CLOSED = 'closed'
}

export enum GameStatus {
  PENDING = 'pending',
  FLOP = 'flop',
  TURN = 'turn',
  RIVER = 'river',
  SHOWDOWN = 'showdown',
  COMPLETED = 'completed'
}

export enum GameRound {
  PREFLOP = 'preflop',
  FLOP = 'flop',
  TURN = 'turn',
  RIVER = 'river',
  SHOWDOWN = 'showdown'
}

export enum PlayerAction {
  FOLD = 'fold',
  CHECK = 'check',
  CALL = 'call',
  RAISE = 'raise',
  BET = 'bet',
  ALL_IN = 'all_in'
}

export enum PlayerStatus {
  ACTIVE = 'active',
  FOLDED = 'folded',
  ALL_IN = 'all_in',
  OUT = 'out'
}

export enum PlayerPosition {
  SB = 'sb',
  BB = 'bb',
  UTG = 'utg',
  MP = 'mp',
  CO = 'co',
  BTN = 'btn'
}

export enum Suit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
  SPADES = 'spades'
}

export enum Rank {
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
  ACE = 'A'
}

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
  balance: number;
  role: UserRole;
  chips: number;
  real_name?: string;
  id_card?: string;
  real_name_verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterUserInput {
  username: string;
  password: string;
  email?: string;
  phone?: string;
}

export interface LoginUserInput {
  email?: string;
  phone?: string;
  username?: string;
  password: string;
}

export interface Player {
  id: string;
  userId: string;
  username: string;
  balance: number;
  bet: number;
  chips_in_pot: number;
  chips_remaining: number;
  status: PlayerStatus;
  position: PlayerPosition;
  seat_number: number;
  hasFolded: boolean;
  isAllIn: boolean;
  cards: Card[];
}

export interface Room {
  id: string;
  name: string;
  owner_id: string;
  room_type: 'public' | 'private';
  status: RoomStatus;
  maxPlayers: number;
  current_players: number;
  buyIn: number;
  smallBlind: number;
  bigBlind: number;
  min_buy_in?: number;
  max_buy_in?: number;
  table_type: 'cash' | 'tournament';
  game: Game | null;
  players: Player[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoomRequest {
  name: string;
  room_type: 'public' | 'private';
  maxPlayers: number;
  buyIn: number;
  smallBlind: number;
  bigBlind: number;
  password?: string;
  min_buy_in?: number;
  max_buy_in?: number;
  table_type: 'cash' | 'tournament';
}

export interface JoinRoomRequest {
  roomId: string;
  buyIn: number;
  password?: string;
}

export interface Game {
  id: string;
  roomId: string;
  status: GameStatus;
  dealerPosition: number;
  currentPlayerPosition: number;
  currentRound: GameRound;
  pot: number;
  roundBet: number;
  communityCards: Card[];
  flop: Card[];
  turn?: Card;
  river?: Card;
  turnIndex: number;
  history: GameHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GameSession {
  id: string;
  room_id: string;
  dealer_id: string;
  pot: number;
  current_round: GameRound;
  status: 'in_progress' | 'finished';
  created_at: Date;
  finished_at?: Date;
}

export interface GameHistory {
  id: string;
  gameId: string;
  session_id?: string;
  action: PlayerAction;
  playerId: string;
  amount: number;
  timestamp: Date;
  round: GameRound;
}

export interface Action {
  id: string;
  session_id: string;
  player_id: string;
  action_type: PlayerAction;
  amount: number;
  round: GameRound;
  created_at: Date;
}

export interface GameAction {
  action_type: PlayerAction;
  amount?: number;
}

export interface ActionRequest {
  action: PlayerAction;
  amount?: number;
}

export interface CommunityCards {
  id: string;
  session_id: string;
  flop: Card[];
  turn?: Card;
  river?: Card;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username?: string;
  message: string;
  roomId: string;
  timestamp: string;
  isPrivate?: boolean;
  recipientId?: string;
}

export interface FriendRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface PrivateMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  buy_in: number;
  prize_pool: number;
  max_players: number;
  current_players: number;
  status: 'registration' | 'in_progress' | 'completed' | 'cancelled';
  start_time: Date;
  end_time?: Date;
  blind_structure_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface TournamentRound {
  id: string;
  tournament_id: string;
  round_number: number;
  small_blind: number;
  big_blind: number;
  duration: number;
  start_time?: Date;
  end_time?: Date;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  user_id: string;
  registration_time: Date;
  buy_in_paid: number;
  status: 'registered' | 'active' | 'eliminated' | 'won' | 'withdrawn';
}

export interface TournamentRanking {
  id: string;
  tournament_id: string;
  user_id: string;
  rank: number;
  prize: number;
  chips: number;
  eliminated_round?: number;
  eliminated_reason?: string;
}

export interface BlindStructure {
  id: string;
  name: string;
  description: string;
  levels: Array<{
    level: number;
    small_blind: number;
    big_blind: number;
    ante?: number;
    duration: number;
  }>;
}

export interface ErrorResponse {
  code: string;
  message: string;
}

export interface SuccessResponse<T> {
  data: T;
  message?: string;
}

export interface WebSocketMessage {
  type: string;
  payload: any;
}

export interface WebSocketEvent {
  type: string;
  data: any;
}

export interface RoomUpdateMessage extends WebSocketMessage {
  type: 'room_update';
  payload: Room;
}

export interface GameUpdateMessage extends WebSocketMessage {
  type: 'game_update';
  payload: Game;
}

export interface PlayerActionMessage extends WebSocketMessage {
  type: 'player_action';
  payload: {
    playerId: string;
    action: PlayerAction;
    amount?: number;
    timestamp: Date;
  };
}

export interface ChatMessageEvent extends WebSocketEvent {
  type: 'chat_message';
  data: ChatMessage;
}

export interface ChatHistoryEvent extends WebSocketEvent {
  type: 'chat_history';
  data: ChatMessage[];
}

export interface TournamentEvent extends WebSocketEvent {
  type: 'tournament_update';
  data: {
    tournament_id: string;
    status: string;
    update_type: 'registration' | 'start' | 'round_change' | 'elimination' | 'winner' | 'end';
    details?: any;
  };
}

export interface FriendRequestEvent extends WebSocketEvent {
  type: 'friend_request';
  data: FriendRequest;
}

export interface FriendRequestResponseEvent extends WebSocketEvent {
  type: 'friend_request_response';
  data: {
    request_id: string;
    status: 'accepted' | 'rejected';
    from_user_id: string;
    to_user_id: string;
  };
}

export interface PrivateMessageEvent extends WebSocketEvent {
  type: 'private_message';
  data: PrivateMessage;
}

export interface ErrorMessage extends WebSocketMessage {
  type: 'error';
  payload: ErrorResponse;
}

// AI相关类型
export interface AITrainingData {
  id?: string;
  userId: string;
  sessionId: string;
  holeCards: Card[];
  communityCards: Card[];
  handStrength: number;
  recommendedAction: string;
  actualAction: string;
  actionResult: string;
  contextData?: any;
  createdAt?: Date;
}

export interface AITrainingResult {
  success: boolean;
  message: string;
  trainingId?: string;
  metrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
}

export interface AIAnalysis {
  id: string;
  session_id: string;
  user_id: string;
  hand_strength: number;
  pot_odds: number;
  recommended_action: string;
  confidence: number;
  created_at: Date;
}

export interface AISuggestion {
  id: string;
  session_id: string;
  user_id: string;
  style: 'gto' | 'professional';
  recommended_action: string;
  recommended_amount?: number;
  confidence: number;
  explanation: string;
  created_at: Date;
}

export interface AIActionRecommendation {
  action: PlayerAction;
  amount?: number;
  reasoning: string;
  confidence: number;
}

export interface RealTimeAnalysisConfig {
  enabled: boolean;
  analysisInterval: number;
  style: 'gto' | 'professional';
  autoAnalyzeOnAction: boolean;
}

export interface AIAnalysisEvent extends WebSocketEvent {
  type: 'ai_analysis';
  data: {
    session_id: string;
    analysis: AIAnalysis;
    suggestion: AISuggestion;
  };
}

export interface RealTimeAnalysisToggleEvent extends WebSocketEvent {
  type: 'real_time_analysis_toggle';
  data: {
    enabled: boolean;
    style?: 'gto' | 'professional';
  };
}

// 支付相关类型
export interface PaymentMethod {
  id: string;
  userId: string;
  methodType: 'wechat' | 'alipay' | 'bank_card';
  accountInfo: string;
  nickname?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentMethodInput {
  methodType: 'wechat' | 'alipay' | 'bank_card';
  accountInfo: string;
  nickname?: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'game_win' | 'game_loss';
  amount: number;
  chipsChange: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethodId?: string;
  gameSessionId?: string;
  description?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface DepositInput {
  amount: number;
  paymentMethodId: string;
  description?: string;
}

export interface WithdrawInput {
  amount: number;
  paymentMethodId: string;
  description?: string;
}

export interface RealNameVerificationRequest {
  realName: string;
  idCard: string;
  idCardPhotoFront: string;
  idCardPhotoBack: string;
}
