"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capitalizeFirstLetter = exports.isValidEmail = exports.generateToken = exports.getNextPlayerPosition = exports.calculatePot = exports.formatMoney = exports.formatCard = exports.compareCards = exports.shuffleDeck = exports.createDeck = exports.generateId = void 0;
const types_1 = require("../types");
const uuid_1 = require("uuid");
const generateId = () => {
    return (0, uuid_1.v4)();
};
exports.generateId = generateId;
const createDeck = () => {
    const suits = [types_1.Suit.HEARTS, types_1.Suit.DIAMONDS, types_1.Suit.CLUBS, types_1.Suit.SPADES];
    const ranks = [
        types_1.Rank.TWO, types_1.Rank.THREE, types_1.Rank.FOUR, types_1.Rank.FIVE, types_1.Rank.SIX, types_1.Rank.SEVEN, types_1.Rank.EIGHT,
        types_1.Rank.NINE, types_1.Rank.TEN, types_1.Rank.JACK, types_1.Rank.QUEEN, types_1.Rank.KING, types_1.Rank.ACE
    ];
    const deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    return deck;
};
exports.createDeck = createDeck;
const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
exports.shuffleDeck = shuffleDeck;
const compareCards = (card1, card2) => {
    const rankOrder = [
        types_1.Rank.TWO, types_1.Rank.THREE, types_1.Rank.FOUR, types_1.Rank.FIVE, types_1.Rank.SIX, types_1.Rank.SEVEN, types_1.Rank.EIGHT,
        types_1.Rank.NINE, types_1.Rank.TEN, types_1.Rank.JACK, types_1.Rank.QUEEN, types_1.Rank.KING, types_1.Rank.ACE
    ];
    const suitOrder = [types_1.Suit.CLUBS, types_1.Suit.DIAMONDS, types_1.Suit.HEARTS, types_1.Suit.SPADES];
    const rankComparison = rankOrder.indexOf(card1.rank) - rankOrder.indexOf(card2.rank);
    if (rankComparison !== 0) {
        return rankComparison;
    }
    return suitOrder.indexOf(card1.suit) - suitOrder.indexOf(card2.suit);
};
exports.compareCards = compareCards;
const formatCard = (card) => {
    return `${card.rank}${card.suit.charAt(0).toUpperCase()}`;
};
exports.formatCard = formatCard;
const formatMoney = (amount) => {
    return `$${amount.toFixed(2)}`;
};
exports.formatMoney = formatMoney;
const calculatePot = (players) => {
    return players.reduce((total, player) => total + player.bet, 0);
};
exports.calculatePot = calculatePot;
const getNextPlayerPosition = (currentPosition, totalPlayers, players) => {
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
exports.getNextPlayerPosition = getNextPlayerPosition;
const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
exports.generateToken = generateToken;
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
exports.capitalizeFirstLetter = capitalizeFirstLetter;
