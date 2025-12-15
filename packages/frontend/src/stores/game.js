import { defineStore } from 'pinia';

// 游戏状态管理
export const useGameStore = defineStore('game', {
  // 状态
  state: () => ({
    // 当前房间信息
    currentRoom: null,
    // 房间列表
    rooms: [],
    // 游戏状态
    gameState: {
      // 游戏阶段: waiting, preflop, flop, turn, river, showdown
      phase: 'waiting',
      // 当前回合玩家
      currentPlayer: null,
      // 盲注信息
      blinds: {
        small: 0,
        big: 0
      },
      // 公共牌
      communityCards: [],
      // 底池信息
      pots: [],
      // 当前回合下注金额
      currentBet: 0,
      // 游戏日志
      log: []
    },
    // 玩家信息
    players: [],
    // 自己的手牌
    holeCards: [],
    // AI建议
    aiSuggestions: [],
    // 游戏设置
    gameSettings: {
      maxPlayers: 6,
      minBuyIn: 1000,
      maxBuyIn: 10000,
      blindLevel: 1,
      blindIncreaseInterval: 15
    }
  }),

  // getter
  getters: {
    // 获取当前房间
    getCurrentRoom: (state) => state.currentRoom,
    // 获取房间列表
    getRooms: (state) => state.rooms,
    // 获取游戏状态
    getGameState: (state) => state.gameState,
    // 获取玩家列表
    getPlayers: (state) => state.players,
    // 获取自己的手牌
    getHoleCards: (state) => state.holeCards,
    // 获取AI建议
    getAiSuggestions: (state) => state.aiSuggestions,
    // 获取游戏设置
    getGameSettings: (state) => state.gameSettings
  },

  // 动作
  actions: {
    // 设置当前房间
    setCurrentRoom(room) {
      this.currentRoom = room;
    },

    // 设置房间列表
    setRooms(rooms) {
      this.rooms = rooms;
    },

    // 更新游戏状态
    updateGameState(gameState) {
      this.gameState = { ...this.gameState, ...gameState };
    },

    // 设置玩家列表
    setPlayers(players) {
      this.players = players;
    },

    // 设置自己的手牌
    setHoleCards(cards) {
      this.holeCards = cards;
    },

    // 设置AI建议
    setAiSuggestions(suggestions) {
      this.aiSuggestions = suggestions;
    },

    // 更新游戏设置
    updateGameSettings(settings) {
      this.gameSettings = { ...this.gameSettings, ...settings };
    },

    // 重置游戏状态
    resetGameState() {
      this.gameState = {
        phase: 'waiting',
        currentPlayer: null,
        blinds: {
          small: 0,
          big: 0
        },
        communityCards: [],
        pots: [],
        currentBet: 0,
        log: []
      };
      this.holeCards = [];
      this.aiSuggestions = [];
    },

    // 添加游戏日志
    addGameLog(log) {
      this.gameState.log.push(log);
    },

    // 更新玩家信息
    updatePlayer(playerId, data) {
      const playerIndex = this.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        this.players[playerIndex] = { ...this.players[playerIndex], ...data };
      }
    }
  }
});