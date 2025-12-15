import api from './axios';

// AI API服务
const aiApi = {
  // 获取AI建议
  getAiSuggestions: (gameId, params) => {
    return api.get(`/ai/${gameId}/suggestions`, { params });
  },

  // 分析牌力
  analyzeHand: (gameId, holeCards) => {
    return api.post(`/ai/${gameId}/analyze-hand`, {
      holeCards
    });
  },

  // 计算赔率
  calculateOdds: (gameId, holeCards, communityCards) => {
    return api.post(`/ai/${gameId}/calculate-odds`, {
      holeCards,
      communityCards
    });
  },

  // 对手行为分析
  analyzeOpponent: (gameId, opponentId) => {
    return api.get(`/ai/${gameId}/analyze-opponent/${opponentId}`);
  },

  // 设置AI模式
  setAiMode: (gameId, mode) => {
    return api.post(`/ai/${gameId}/set-mode`, {
      mode
    });
  }
};

export default aiApi;