import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '../../stores/game'

describe('useGameStore', () => {
  let gameStore
  
  beforeEach(() => {
    // 创建一个新的Pinia实例
    const pinia = createPinia()
    setActivePinia(pinia)
    
    // 创建gameStore实例
    gameStore = useGameStore()
  })
  
  describe('state', () => {
    it('should have initial state', () => {
      expect(gameStore.currentRoom).toBeNull()
      expect(gameStore.rooms).toEqual([])
      expect(gameStore.gameState).toEqual({
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
      })
      expect(gameStore.players).toEqual([])
      expect(gameStore.holeCards).toEqual([])
      expect(gameStore.aiSuggestions).toEqual([])
      expect(gameStore.gameSettings).toEqual({
        maxPlayers: 6,
        minBuyIn: 1000,
        maxBuyIn: 10000,
        blindLevel: 1,
        blindIncreaseInterval: 15
      })
    })
  })
  
  describe('getters', () => {
    it('should return current room', () => {
      const mockRoom = { id: 'room-1', name: 'Test Room', maxPlayers: 6 }
      gameStore.currentRoom = mockRoom
      
      expect(gameStore.getCurrentRoom).toEqual(mockRoom)
    })
    
    it('should return rooms list', () => {
      const mockRooms = [
        { id: 'room-1', name: 'Test Room 1', maxPlayers: 6 },
        { id: 'room-2', name: 'Test Room 2', maxPlayers: 9 }
      ]
      gameStore.rooms = mockRooms
      
      expect(gameStore.getRooms).toEqual(mockRooms)
    })
    
    it('should return game state', () => {
      const mockGameState = {
        phase: 'preflop',
        currentPlayer: 'user-1',
        blinds: { small: 10, big: 20 },
        communityCards: [],
        pots: [{ amount: 40 }],
        currentBet: 20,
        log: ['Game started']
      }
      gameStore.gameState = mockGameState
      
      expect(gameStore.getGameState).toEqual(mockGameState)
    })
    
    it('should return players list', () => {
      const mockPlayers = [
        { id: 'user-1', name: 'Player 1', chips: 1000 },
        { id: 'user-2', name: 'Player 2', chips: 2000 }
      ]
      gameStore.players = mockPlayers
      
      expect(gameStore.getPlayers).toEqual(mockPlayers)
    })
    
    it('should return hole cards', () => {
      const mockCards = [
        { rank: 'A', suit: 'spades' },
        { rank: 'K', suit: 'hearts' }
      ]
      gameStore.holeCards = mockCards
      
      expect(gameStore.getHoleCards).toEqual(mockCards)
    })
    
    it('should return AI suggestions', () => {
      const mockSuggestions = [
        { type: 'call', confidence: 0.8 },
        { type: 'fold', confidence: 0.2 }
      ]
      gameStore.aiSuggestions = mockSuggestions
      
      expect(gameStore.getAiSuggestions).toEqual(mockSuggestions)
    })
    
    it('should return game settings', () => {
      const mockSettings = {
        maxPlayers: 9,
        minBuyIn: 500,
        maxBuyIn: 5000,
        blindLevel: 2,
        blindIncreaseInterval: 30
      }
      gameStore.gameSettings = mockSettings
      
      expect(gameStore.getGameSettings).toEqual(mockSettings)
    })
  })
  
  describe('actions', () => {
    it('should set current room', () => {
      const mockRoom = { id: 'room-1', name: 'Test Room', maxPlayers: 6 }
      
      gameStore.setCurrentRoom(mockRoom)
      
      expect(gameStore.currentRoom).toEqual(mockRoom)
    })
    
    it('should set rooms list', () => {
      const mockRooms = [
        { id: 'room-1', name: 'Test Room 1', maxPlayers: 6 },
        { id: 'room-2', name: 'Test Room 2', maxPlayers: 9 }
      ]
      
      gameStore.setRooms(mockRooms)
      
      expect(gameStore.rooms).toEqual(mockRooms)
    })
    
    it('should update game state', () => {
      const initialGameState = {
        phase: 'waiting',
        currentPlayer: null,
        blinds: { small: 0, big: 0 },
        communityCards: [],
        pots: [],
        currentBet: 0,
        log: []
      }
      
      // 验证初始状态
      expect(gameStore.gameState).toEqual(initialGameState)
      
      const updateData = {
        phase: 'preflop',
        currentPlayer: 'user-1',
        blinds: { small: 10, big: 20 },
        currentBet: 20
      }
      
      gameStore.updateGameState(updateData)
      
      // 验证更新后的状态（只有提供的字段被更新）
      expect(gameStore.gameState).toEqual({
        ...initialGameState,
        ...updateData
      })
    })
    
    it('should set players list', () => {
      const mockPlayers = [
        { id: 'user-1', name: 'Player 1', chips: 1000 },
        { id: 'user-2', name: 'Player 2', chips: 2000 }
      ]
      
      gameStore.setPlayers(mockPlayers)
      
      expect(gameStore.players).toEqual(mockPlayers)
    })
    
    it('should set hole cards', () => {
      const mockCards = [
        { rank: 'A', suit: 'spades' },
        { rank: 'K', suit: 'hearts' }
      ]
      
      gameStore.setHoleCards(mockCards)
      
      expect(gameStore.holeCards).toEqual(mockCards)
    })
    
    it('should set AI suggestions', () => {
      const mockSuggestions = [
        { type: 'call', confidence: 0.8 },
        { type: 'fold', confidence: 0.2 }
      ]
      
      gameStore.setAiSuggestions(mockSuggestions)
      
      expect(gameStore.aiSuggestions).toEqual(mockSuggestions)
    })
    
    it('should update game settings', () => {
      const initialSettings = {
        maxPlayers: 6,
        minBuyIn: 1000,
        maxBuyIn: 10000,
        blindLevel: 1,
        blindIncreaseInterval: 15
      }
      
      // 验证初始设置
      expect(gameStore.gameSettings).toEqual(initialSettings)
      
      const updateData = {
        maxPlayers: 9,
        minBuyIn: 500,
        blindLevel: 2
      }
      
      gameStore.updateGameSettings(updateData)
      
      // 验证更新后的设置（只有提供的字段被更新）
      expect(gameStore.gameSettings).toEqual({
        ...initialSettings,
        ...updateData
      })
    })
    
    it('should reset game state', () => {
      // 设置一些测试数据
      gameStore.gameState = {
        phase: 'preflop',
        currentPlayer: 'user-1',
        blinds: { small: 10, big: 20 },
        communityCards: [{ rank: '2', suit: 'spades' }],
        pots: [{ amount: 40 }],
        currentBet: 20,
        log: ['Game started']
      }
      gameStore.holeCards = [{ rank: 'A', suit: 'spades' }, { rank: 'K', suit: 'hearts' }]
      gameStore.aiSuggestions = [{ type: 'call', confidence: 0.8 }]
      
      gameStore.resetGameState()
      
      // 验证所有状态已重置
      expect(gameStore.gameState).toEqual({
        phase: 'waiting',
        currentPlayer: null,
        blinds: { small: 0, big: 0 },
        communityCards: [],
        pots: [],
        currentBet: 0,
        log: []
      })
      expect(gameStore.holeCards).toEqual([])
      expect(gameStore.aiSuggestions).toEqual([])
    })
    
    it('should add game log', () => {
      const logMessage = 'Game started'
      
      // 验证初始日志为空
      expect(gameStore.gameState.log).toEqual([])
      
      gameStore.addGameLog(logMessage)
      
      // 验证日志已添加
      expect(gameStore.gameState.log).toEqual([logMessage])
      
      // 添加另一条日志
      const anotherLog = 'Player 1 joined'
      gameStore.addGameLog(anotherLog)
      
      // 验证两条日志都存在
      expect(gameStore.gameState.log).toEqual([logMessage, anotherLog])
    })
    
    it('should update player information', () => {
      // 设置初始玩家列表
      gameStore.players = [
        { id: 'user-1', name: 'Player 1', chips: 1000, isActive: true },
        { id: 'user-2', name: 'Player 2', chips: 2000, isActive: true }
      ]
      
      // 更新玩家1的信息
      const updateData = { chips: 1500, isActive: false }
      gameStore.updatePlayer('user-1', updateData)
      
      // 验证玩家1的信息已更新，玩家2的信息未改变
      expect(gameStore.players).toEqual([
        { id: 'user-1', name: 'Player 1', chips: 1500, isActive: false },
        { id: 'user-2', name: 'Player 2', chips: 2000, isActive: true }
      ])
    })
    
    it('should do nothing when updating non-existent player', () => {
      // 设置初始玩家列表
      gameStore.players = [
        { id: 'user-1', name: 'Player 1', chips: 1000, isActive: true }
      ]
      
      // 更新不存在的玩家
      const updateData = { chips: 1500, isActive: false }
      gameStore.updatePlayer('non-existent', updateData)
      
      // 验证玩家列表未改变
      expect(gameStore.players).toEqual([
        { id: 'user-1', name: 'Player 1', chips: 1000, isActive: true }
      ])
    })
  })
})
