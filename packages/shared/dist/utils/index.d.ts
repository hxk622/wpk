import { Card } from '../types';
export declare const generateId: () => string;
export declare const createDeck: () => Card[];
export declare const shuffleDeck: (deck: Card[]) => Card[];
export declare const compareCards: (card1: Card, card2: Card) => number;
export declare const formatCard: (card: Card) => string;
export declare const formatMoney: (amount: number) => string;
export declare const calculatePot: (players: {
    bet: number;
}[]) => number;
export declare const getNextPlayerPosition: (currentPosition: number, totalPlayers: number, players: {
    isActive: boolean;
    hasFolded: boolean;
}[]) => number;
export declare const generateToken: () => string;
export declare const isValidEmail: (email: string) => boolean;
export declare const capitalizeFirstLetter: (str: string) => string;
