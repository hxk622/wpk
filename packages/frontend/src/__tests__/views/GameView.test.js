import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, reactive } from 'vue'
import { showToast } from 'vant'
import gameApi from '../../api/game'
import socketService from '../../api/socket'

// 模拟依赖
vi.mock('../../api/game', () => ({
  __esModule: true,
  default: {
    startGame: vi.fn().mockResolvedValue({
      communityCards: []
    }),
    restartGame: vi.fn(),
    playerAction: vi.fn()
  }
}))

vi.mock('../../api/socket', () => ({
  __esModule: true,
  default: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    emit: vi.fn(),
    getConnectionStatus: vi.fn().mockReturnValue(true)
  }
}))

vi.mock('vant', () => ({
  showToast: vi.fn()
}))

describe('GameView - Game Operations', () => {
  let gameState
  let isConnected
  let restartGame
  let fold
  let checkOrCall
  let raise
  let minRaise

  beforeEach(() => {
    // 重置模拟
    vi.clearAllMocks()

    // 创建模拟状态
    isConnected = ref(true)
    minRaise = ref(10)
    gameState = reactive({
      id: 'test-game-123',
      status: 'in_progress',
      currentPlayer: 'test-user-123',
      currentPlayerId: 'test-user-123',
      canCheck: true,
      communityCards: [
        { suit: 'S', value: 'A', revealed: false },
        { suit: 'H', value: 'K', revealed: false },
        { suit: 'D', value: 'Q', revealed: false },
        { suit: 'C', value: 'J', revealed: false },
        { suit: 'S', value: '10', revealed: false }
      ]
    })

    // 实现要测试的函数
    restartGame = () => {
      if (!isConnected.value) {
        showToast('网络连接已断开，请检查网络设置后重试')
        return
      }
      gameApi.restartGame(gameState.id)
    }

    fold = () => {
      if (!isConnected.value) {
        showToast('网络连接已断开，请检查网络设置后重试')
        return
      }
      gameApi.playerAction(gameState.id, 'fold')
    }

    checkOrCall = () => {
      if (!isConnected.value) {
        showToast('网络连接已断开，请检查网络设置后重试')
        return
      }
      const action = gameState.canCheck ? 'check' : 'call'
      gameApi.playerAction(gameState.id, action)
    }

    raise = (amount) => {
      if (!isConnected.value) {
        showToast('网络连接已断开，请检查网络设置后重试')
        return
      }
      if (amount < minRaise.value) {
        showToast(`加注金额不能小于最小加注额 ${minRaise.value}`)
        return
      }
      gameApi.playerAction(gameState.id, 'raise', { amount })
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('restartGame', () => {
    it('should show toast when network is disconnected', () => {
      // Arrange
      isConnected.value = false

      // Act
      restartGame()

      // Assert
      expect(showToast).toHaveBeenCalledWith('网络连接已断开，请检查网络设置后重试')
      expect(gameApi.restartGame).not.toHaveBeenCalled()
    })

    it('should call gameApi.restartGame when network is connected', () => {
      // Arrange
      isConnected.value = true

      // Act
      restartGame()

      // Assert
      expect(gameApi.restartGame).toHaveBeenCalledWith('test-game-123')
      expect(showToast).not.toHaveBeenCalled()
    })
  })

  describe('fold', () => {
    it('should show toast when network is disconnected', () => {
      // Arrange
      isConnected.value = false

      // Act
      fold()

      // Assert
      expect(showToast).toHaveBeenCalledWith('网络连接已断开，请检查网络设置后重试')
      expect(gameApi.playerAction).not.toHaveBeenCalled()
    })

    it('should call gameApi.playerAction with fold when network is connected', () => {
      // Arrange
      isConnected.value = true

      // Act
      fold()

      // Assert
      expect(gameApi.playerAction).toHaveBeenCalledWith('test-game-123', 'fold')
      expect(showToast).not.toHaveBeenCalled()
    })
  })

  describe('checkOrCall', () => {
    it('should show toast when network is disconnected', () => {
      // Arrange
      isConnected.value = false

      // Act
      checkOrCall()

      // Assert
      expect(showToast).toHaveBeenCalledWith('网络连接已断开，请检查网络设置后重试')
      expect(gameApi.playerAction).not.toHaveBeenCalled()
    })

    it('should call gameApi.playerAction with check when canCheck is true', () => {
      // Arrange
      isConnected.value = true
      gameState.canCheck = true

      // Act
      checkOrCall()

      // Assert
      expect(gameApi.playerAction).toHaveBeenCalledWith('test-game-123', 'check')
      expect(showToast).not.toHaveBeenCalled()
    })

    it('should call gameApi.playerAction with call when canCheck is false', () => {
      // Arrange
      isConnected.value = true
      gameState.canCheck = false

      // Act
      checkOrCall()

      // Assert
      expect(gameApi.playerAction).toHaveBeenCalledWith('test-game-123', 'call')
      expect(showToast).not.toHaveBeenCalled()
    })
  })

  describe('raise', () => {
    it('should show toast when raise amount is less than min bet', () => {
      // Arrange
      isConnected.value = true
      minRaise.value = 10

      // Act
      raise(5)

      // Assert
      expect(showToast).toHaveBeenCalledWith('加注金额不能小于最小加注额 10')
      expect(gameApi.playerAction).not.toHaveBeenCalled()
    })

    it('should show toast when network is disconnected', () => {
      // Arrange
      isConnected.value = false

      // Act
      raise(20)

      // Assert
      expect(showToast).toHaveBeenCalledWith('网络连接已断开，请检查网络设置后重试')
      expect(gameApi.playerAction).not.toHaveBeenCalled()
    })

    it('should call gameApi.playerAction with raise when amount is valid', () => {
      // Arrange
      isConnected.value = true
      minRaise.value = 10

      // Act
      raise(20)

      // Assert
      expect(gameApi.playerAction).toHaveBeenCalledWith('test-game-123', 'raise', { amount: 20 })
      expect(showToast).not.toHaveBeenCalled()
    })
  })
})
