import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '../../stores/user'

// 模拟localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => (store[key] = value.toString()),
    removeItem: (key) => delete store[key],
    clear: () => (store = {})
  }
})()

global.localStorage = localStorageMock

describe('useUserStore', () => {
  let userStore
  
  beforeEach(() => {
    // 创建一个新的Pinia实例
    const pinia = createPinia()
    setActivePinia(pinia)
    
    // 创建userStore实例
    userStore = useUserStore()
    
    // 清空localStorage
    localStorage.clear()
  })
  
  describe('state', () => {
    it('should have initial state', () => {
      expect(userStore.userInfo).toEqual({
        id: '',
        username: '',
        avatar: '',
        email: '',
        phone: ''
      })
      
      expect(userStore.isLoggedIn).toBe(false)
      expect(userStore.token).toBe('')
      
      expect(userStore.stats).toEqual({
        gamesPlayed: 0,
        gamesWon: 0,
        totalChips: 0,
        winRate: 0
      })
    })
    
    it('should initialize token from localStorage', () => {
      // 模拟localStorage中有token
      localStorage.setItem('token', 'test-token-123')
      
      // 创建新的store实例
      const pinia = createPinia()
      setActivePinia(pinia)
      const newUserStore = useUserStore()
      
      expect(newUserStore.token).toBe('test-token-123')
    })
  })
  
  describe('getters', () => {
    it('should return user ID', () => {
      userStore.userInfo.id = 'user-123'
      expect(userStore.getUserId).toBe('user-123')
    })
    
    it('should return username', () => {
      userStore.userInfo.username = 'testuser'
      expect(userStore.getUsername).toBe('testuser')
    })
    
    it('should return user avatar', () => {
      userStore.userInfo.avatar = 'https://example.com/avatar.jpg'
      expect(userStore.getAvatar).toBe('https://example.com/avatar.jpg')
    })
    
    it('should return login status', () => {
      userStore.isLoggedIn = true
      expect(userStore.getLoggedInStatus).toBe(true)
    })
    
    it('should return token', () => {
      userStore.token = 'test-token'
      expect(userStore.getToken).toBe('test-token')
    })
    
    it('should return user stats', () => {
      userStore.stats = {
        gamesPlayed: 10,
        gamesWon: 5,
        totalChips: 1000,
        winRate: 50
      }
      expect(userStore.getUserStats).toEqual(userStore.stats)
    })
  })
  
  describe('actions', () => {
    it('should set user info and update login status', () => {
      const userInfo = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        phone: '1234567890'
      }
      
      userStore.setUserInfo(userInfo)
      
      expect(userStore.userInfo).toEqual({...userStore.userInfo, ...userInfo})
      expect(userStore.isLoggedIn).toBe(true)
    })
    
    it('should set token and save to localStorage', () => {
      const token = 'test-token-123'
      
      userStore.setToken(token)
      
      expect(userStore.token).toBe(token)
      expect(localStorage.getItem('token')).toBe(token)
    })
    
    it('should set user stats', () => {
      const stats = {
        gamesPlayed: 10,
        gamesWon: 5,
        totalChips: 1000,
        winRate: 50
      }
      
      userStore.setUserStats(stats)
      
      expect(userStore.stats).toEqual(stats)
    })
    
    it('should login user and set token', () => {
      const userInfo = {
        id: 'user-123',
        username: 'testuser'
      }
      const token = 'test-token'
      
      userStore.login(userInfo, token)
      
      expect(userStore.userInfo).toEqual({...userStore.userInfo, ...userInfo})
      expect(userStore.isLoggedIn).toBe(true)
      expect(userStore.token).toBe(token)
      expect(localStorage.getItem('token')).toBe(token)
    })
    
    it('should logout user and clear all data', () => {
      // 先设置一些用户数据
      userStore.userInfo = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com'
      }
      userStore.isLoggedIn = true
      userStore.token = 'test-token'
      userStore.stats = {
        gamesPlayed: 10,
        gamesWon: 5
      }
      localStorage.setItem('token', 'test-token')
      
      // 执行登出
      userStore.logout()
      
      // 验证数据已清空
      expect(userStore.userInfo).toEqual({
        id: '',
        username: '',
        avatar: '',
        email: '',
        phone: ''
      })
      expect(userStore.isLoggedIn).toBe(false)
      expect(userStore.token).toBe('')
      expect(userStore.stats).toEqual({
        gamesPlayed: 0,
        gamesWon: 0,
        totalChips: 0,
        winRate: 0
      })
      expect(localStorage.getItem('token')).toBe(null)
    })
    
    it('should update user profile', () => {
      // 初始用户信息
      userStore.userInfo = {
        id: 'user-123',
        username: 'testuser',
        email: 'old@example.com'
      }
      
      // 更新部分信息
      const updateData = {
        email: 'new@example.com',
        phone: '1234567890'
      }
      
      userStore.updateUserProfile(updateData)
      
      // 验证更新
      expect(userStore.userInfo.email).toBe('new@example.com')
      expect(userStore.userInfo.phone).toBe('1234567890')
      expect(userStore.userInfo.username).toBe('testuser') // 未更新的字段保持不变
    })
  })
})
