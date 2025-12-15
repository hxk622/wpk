import { Card, Suit, Rank } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const generateId = (): string => {
  return uuidv4();
};

export const createDeck = (): Card[] => {
  const suits: Suit[] = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];
  const ranks: Rank[] = [
    Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN, Rank.EIGHT,
    Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
  ];

  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const compareCards = (card1: Card, card2: Card): number => {
  const rankOrder = [
    Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN, Rank.EIGHT,
    Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
  ];
  const suitOrder = [Suit.CLUBS, Suit.DIAMONDS, Suit.HEARTS, Suit.SPADES];

  const rankComparison = rankOrder.indexOf(card1.rank) - rankOrder.indexOf(card2.rank);
  if (rankComparison !== 0) {
    return rankComparison;
  }
  return suitOrder.indexOf(card1.suit) - suitOrder.indexOf(card2.suit);
};

export const formatCard = (card: Card): string => {
  return `${card.rank}${card.suit.charAt(0).toUpperCase()}`;
};

export const formatMoney = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export const calculatePot = (players: { bet: number }[]): number => {
  return players.reduce((total, player) => total + player.bet, 0);
};

export const getNextPlayerPosition = (currentPosition: number, totalPlayers: number, players: { isActive: boolean, hasFolded: boolean }[]): number => {
  let nextPosition = (currentPosition + 1) % totalPlayers;
  while (nextPosition !== currentPosition) {
    const player = players[nextPosition];
    if (player && player.isActive && !player.hasFolded) {
      return nextPosition;
    }
    nextPosition = (nextPosition + 1) % totalPlayers;
  }
  return currentPosition;
};

export const generateToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
