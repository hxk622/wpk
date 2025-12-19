import api from './axios';

// 游戏API服务
const gameApi = {
  // 获取游戏状态
  getGameState: (gameId) => {
    return api.get(`/games/${gameId}`);
  },

  // 开始游戏
  startGame: (gameId) => {
    return api.post(`/games/${gameId}/start`);
  },

  // 重新开始游戏（复用startGame端点）
  restartGame: (gameId) => {
    return api.post(`/games/${gameId}/start`);
  },

  // 玩家行动（下注、跟注、弃牌等）
  playerAction: (gameId, actionType, amount) => {
    return api.post(`/games/${gameId}/action`, {
      action: actionType,
      amount
    });
  },

  // 获取游戏历史
  getGameHistory: () => {
    return api.get(`/games/history`);
  },

  // 获取游戏统计
  getGameStats: (gameId) => {
    return api.get(`/games/${gameId}/stats`);
  },

  // 请求AI分析
  requestAiAnalysis: (gameId, playerCards, communityCards) => {
    return api.post(`/games/${gameId}/ai/analysis`, {
      playerCards,
      communityCards
    });
  }
};

export default gameApi;
