import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useChatStore } from '../../stores/chat'

describe('useChatStore', () => {
  let chatStore
  
  beforeEach(() => {
    // 创建一个新的Pinia实例
    const pinia = createPinia()
    setActivePinia(pinia)
    
    // 创建chatStore实例
    chatStore = useChatStore()
  })
  
  describe('state', () => {
    it('should have initial state', () => {
      expect(chatStore.messages).toEqual([])
      expect(chatStore.inputMessage).toBe('')
      expect(chatStore.showChat).toBe(true)
      expect(chatStore.chatType).toBe('room')
      expect(chatStore.privateChatUserId).toBe(null)
    })
  })
  
  describe('getters', () => {
    it('should return room messages', () => {
      // 添加一些测试消息
      const roomMessage1 = {
        id: 'msg-1',
        type: 'room',
        content: 'Hello everyone!',
        senderId: 'user-1',
        senderName: 'User1',
        timestamp: new Date().toISOString()
      }
      
      const roomMessage2 = {
        id: 'msg-2',
        type: 'room',
        content: 'Hi there!',
        senderId: 'user-2',
        senderName: 'User2',
        timestamp: new Date().toISOString()
      }
      
      const privateMessage = {
        id: 'msg-3',
        type: 'private',
        content: 'This is private',
        senderId: 'user-1',
        senderName: 'User1',
        receiverId: 'user-2',
        timestamp: new Date().toISOString()
      }
      
      chatStore.messages = [roomMessage1, privateMessage, roomMessage2]
      chatStore.privateChatUserId = 'user-2'
      
      const roomMessages = chatStore.getRoomMessages
      
      expect(roomMessages).toHaveLength(2)
      expect(roomMessages).toContainEqual(roomMessage1)
      expect(roomMessages).toContainEqual(roomMessage2)
      expect(roomMessages).not.toContainEqual(privateMessage)
    })
    
    it('should return private messages between two users', () => {
      // 添加一些测试消息
      const privateMessage1 = {
        id: 'msg-1',
        type: 'private',
        content: 'Hello',
        senderId: 'user-1',
        senderName: 'User1',
        receiverId: 'user-2',
        timestamp: new Date().toISOString()
      }
      
      const privateMessage2 = {
        id: 'msg-2',
        type: 'private',
        content: 'Hi there!',
        senderId: 'user-2',
        senderName: 'User2',
        receiverId: 'user-1',
        timestamp: new Date().toISOString()
      }
      
      const otherPrivateMessage = {
        id: 'msg-3',
        type: 'private',
        content: 'Not for user1',
        senderId: 'user-2',
        senderName: 'User2',
        receiverId: 'user-3',
        timestamp: new Date().toISOString()
      }
      
      const roomMessage = {
        id: 'msg-4',
        type: 'room',
        content: 'Room message',
        senderId: 'user-1',
        senderName: 'User1',
        timestamp: new Date().toISOString()
      }
      
      chatStore.messages = [privateMessage1, otherPrivateMessage, privateMessage2, roomMessage]
      chatStore.privateChatUserId = 'user-2'
      
      const privateMessages = chatStore.getPrivateMessages('user-1')
      
      expect(privateMessages).toHaveLength(2)
      expect(privateMessages).toContainEqual(privateMessage1)
      expect(privateMessages).toContainEqual(privateMessage2)
      expect(privateMessages).not.toContainEqual(otherPrivateMessage)
      expect(privateMessages).not.toContainEqual(roomMessage)
    })
    
    it('should return latest messages with limit', () => {
      // 添加一些测试消息
      const messages = []
      for (let i = 0; i < 10; i++) {
        messages.push({
          id: `msg-${i}`,
          type: 'room',
          content: `Message ${i}`,
          senderId: 'user-1',
          senderName: 'User1',
          timestamp: new Date(2024, 0, 1, 0, 0, i).toISOString()
        })
      }
      
      chatStore.messages = messages
      
      // 获取最新5条消息
      const latestMessages = chatStore.getLatestMessages(5)
      
      expect(latestMessages).toHaveLength(5)
      expect(latestMessages[0].id).toBe('msg-5') // 最旧的在前面
      expect(latestMessages[4].id).toBe('msg-9') // 最新的在后面
    })
    
    it('should return all messages when limit is larger than total messages', () => {
      // 添加一些测试消息
      const messages = [
        {
          id: 'msg-1',
          type: 'room',
          content: 'Message 1',
          senderId: 'user-1',
          senderName: 'User1',
          timestamp: new Date().toISOString()
        },
        {
          id: 'msg-2',
          type: 'room',
          content: 'Message 2',
          senderId: 'user-1',
          senderName: 'User1',
          timestamp: new Date().toISOString()
        }
      ]
      
      chatStore.messages = messages
      
      // 获取最新10条消息（超过总条数）
      const latestMessages = chatStore.getLatestMessages(10)
      
      expect(latestMessages).toHaveLength(2)
      expect(latestMessages).toEqual(messages)
    })
  })
  
  describe('actions', () => {
    it('should add a new message', () => {
      const messageData = {
        type: 'room',
        content: 'Hello world!',
        senderId: 'user-1',
        senderName: 'User1'
      }
      
      chatStore.addMessage(messageData)
      
      expect(chatStore.messages).toHaveLength(1)
      expect(chatStore.messages[0].id).toBeDefined() // 应该有自动生成的ID
      expect(chatStore.messages[0].timestamp).toBeDefined() // 应该有自动生成的时间戳
      expect(chatStore.messages[0].type).toBe(messageData.type)
      expect(chatStore.messages[0].content).toBe(messageData.content)
      expect(chatStore.messages[0].senderId).toBe(messageData.senderId)
      expect(chatStore.messages[0].senderName).toBe(messageData.senderName)
    })
    
    it('should send room message', () => {
      const content = 'Hello everyone!'
      const senderId = 'user-1'
      const senderName = 'User1'
      
      const result = chatStore.sendRoomMessage(content, senderId, senderName)
      
      // 返回的对象不包含id和timestamp
      expect(result.type).toBe('room')
      expect(result.content).toBe(content)
      expect(result.senderId).toBe(senderId)
      expect(result.senderName).toBe(senderName)
      expect(result.id).toBeUndefined()
      expect(result.timestamp).toBeUndefined()
      
      // 验证消息已添加到列表（包含id和timestamp）
      expect(chatStore.messages).toHaveLength(1)
      expect(chatStore.messages[0].type).toBe('room')
      expect(chatStore.messages[0].content).toBe(content)
      expect(chatStore.messages[0].senderId).toBe(senderId)
      expect(chatStore.messages[0].senderName).toBe(senderName)
      expect(chatStore.messages[0].id).toBeDefined()
      expect(chatStore.messages[0].timestamp).toBeDefined()
    })
    
    it('should send private message', () => {
      const content = 'This is private'
      const senderId = 'user-1'
      const senderName = 'User1'
      const receiverId = 'user-2'
      
      const result = chatStore.sendPrivateMessage(content, senderId, senderName, receiverId)
      
      // 返回的对象不包含id和timestamp
      expect(result.type).toBe('private')
      expect(result.content).toBe(content)
      expect(result.senderId).toBe(senderId)
      expect(result.senderName).toBe(senderName)
      expect(result.receiverId).toBe(receiverId)
      expect(result.id).toBeUndefined()
      expect(result.timestamp).toBeUndefined()
      
      // 验证消息已添加到列表（包含id和timestamp）
      expect(chatStore.messages).toHaveLength(1)
      expect(chatStore.messages[0].type).toBe('private')
      expect(chatStore.messages[0].content).toBe(content)
      expect(chatStore.messages[0].senderId).toBe(senderId)
      expect(chatStore.messages[0].senderName).toBe(senderName)
      expect(chatStore.messages[0].receiverId).toBe(receiverId)
      expect(chatStore.messages[0].id).toBeDefined()
      expect(chatStore.messages[0].timestamp).toBeDefined()
    })
    
    it('should set input message', () => {
      const message = 'Hello world!'
      
      chatStore.setInputMessage(message)
      
      expect(chatStore.inputMessage).toBe(message)
    })
    
    it('should clear input message', () => {
      chatStore.inputMessage = 'Hello world!'
      
      chatStore.clearInputMessage()
      
      expect(chatStore.inputMessage).toBe('')
    })
    
    it('should toggle chat visibility', () => {
      expect(chatStore.showChat).toBe(true)
      
      chatStore.toggleChat()
      expect(chatStore.showChat).toBe(false)
      
      chatStore.toggleChat()
      expect(chatStore.showChat).toBe(true)
    })
    
    it('should set chat type to room', () => {
      chatStore.setChatType('room')
      
      expect(chatStore.chatType).toBe('room')
      expect(chatStore.privateChatUserId).toBe(null)
    })
    
    it('should set chat type to private with user ID', () => {
      const userId = 'user-2'
      
      chatStore.setChatType('private', userId)
      
      expect(chatStore.chatType).toBe('private')
      expect(chatStore.privateChatUserId).toBe(userId)
    })
    
    it('should clear all messages', () => {
      // 添加一些测试消息
      chatStore.messages = [
        {
          id: 'msg-1',
          type: 'room',
          content: 'Message 1',
          senderId: 'user-1',
          senderName: 'User1',
          timestamp: new Date().toISOString()
        },
        {
          id: 'msg-2',
          type: 'private',
          content: 'Message 2',
          senderId: 'user-1',
          senderName: 'User1',
          receiverId: 'user-2',
          timestamp: new Date().toISOString()
        }
      ]
      
      chatStore.clearMessages()
      
      expect(chatStore.messages).toEqual([])
    })
  })
})
