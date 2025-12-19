import { WebSocket } from 'ws';
import http from 'http';
import { WebSocketEvent, RealTimeAnalysisConfig } from '../types';
export interface WebSocketClient {
    id: string;
    userId: string;
    socket: WebSocket;
    roomId?: string;
    sessionId?: string;
    realTimeAnalysisConfig?: RealTimeAnalysisConfig;
    analysisIntervalId?: NodeJS.Timeout;
}
export declare class WebSocketService {
    private wss;
    private clients;
    private chatHistory;
    private maxHistoryLength;
    private gameDataCache;
    constructor(server: http.Server);
    private setupEventHandlers;
    private handleConnection;
    private handleMessage;
    private handleJoinRoom;
    private handleLeaveRoom;
    private handlePlayerReady;
    private handleGameAction;
    private handleChatMessage;
    private handleClose;
    private handleError;
    sendToClient(clientId: string, message: WebSocketEvent): void;
    broadcastToRoom(roomId: string, message: WebSocketEvent, excludeClientId?: string): void;
    broadcastToUser(userId: string, message: WebSocketEvent): void;
    broadcast(message: WebSocketEvent): void;
    getClientsInRoom(roomId: string): WebSocketClient[];
    private sendChatMessageToUser;
    getChatHistory(roomId: string): Array<{
        id: string;
        userId: string;
        username?: string;
        message: string;
        timestamp: string;
        isPrivate?: boolean;
        recipientId?: string;
    }>;
    sendChatHistory(clientId: string, roomId: string): void;
    private handleRealTimeAnalysisToggle;
    private handleGameDataUpdate;
    private startRealTimeAnalysis;
    private performRealTimeAnalysis;
    getClientCount(): number;
    close(): void;
}
export default WebSocketService;
