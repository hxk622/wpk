// 验证工具函数
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateUsername = (username) => {
  return username.length >= 3 && username.length <= 20;
};

// 游戏工具函数
export const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const calculateWinRate = (wins, total) => {
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
};

export const formatChips = (chips) => {
  if (chips >= 1000000) {
    return `${(chips / 1000000).toFixed(2)}M`;
  } else if (chips >= 1000) {
    return `${(chips / 1000).toFixed(2)}K`;
  }
  return chips.toString();
};

// 日期工具函数
export const formatDate = (date) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (date) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return formatDate(date);
};

// 通用工具函数
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 常量
export const GAME_CONSTANTS = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 9,
  DEFAULT_SMALL_BLIND: 10,
  DEFAULT_BIG_BLIND: 20,
  DEFAULT_MIN_BUYIN: 1000,
  DEFAULT_MAX_BUYIN: 10000
};

export const ROOM_STATUS = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished'
};

export const GAME_STATUS = {
  WAITING: 'waiting',
  PREFLOP: 'preflop',
  FLOP: 'flop',
  TURN: 'turn',
  RIVER: 'river',
  SHOWDOWN: 'showdown',
  FINISHED: 'finished'
};

export const PLAYER_STATUS = {
  ACTIVE: 'active',
  FOLDED: 'folded',
  ALL_IN: 'all-in',
  OUT: 'out'
};

export const GAME_ACTIONS = {
  FOLD: 'fold',
  CALL: 'call',
  RAISE: 'raise',
  CHECK: 'check',
  ALL_IN: 'all-in'
};
