// 前端自动化测试示例 - 创建房间功能测试
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CreateRoomView from '../src/views/CreateRoomView.vue';
import { useUserStore } from '../src/stores/user';
import roomApi from '../src/api/room';
import { showToast } from 'vant';

// 模拟依赖
vi.mock('../src/api/room');
vi.mock('vant', () => ({
  showToast: vi.fn(),
  showLoadingToast: vi.fn(),
  closeToast: vi.fn()
}));

// 模拟路由
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn()
  })
}));

describe('CreateRoomView 组件测试', () => {
  let wrapper;
  let userStore;
  
  beforeEach(() => {
    // 重置所有模拟
    vi.clearAllMocks();
    
    // 模拟userStore
    userStore = {
      getUsername: 'testuser'
    };
    
    // 挂载组件
    wrapper = mount(CreateRoomView, {
      global: {
        plugins: [
          // 模拟pinia
          {
            install: (app) => {
              app.config.globalProperties.$pinia = {
                state: () => ({ user: userStore })
              };
            }
          }
        ]
      }
    });
  });
  
  it('初始渲染时应该显示创建房间表单', () => {
    expect(wrapper.find('.create-room-container').exists()).toBe(true);
    expect(wrapper.find('.room-form').exists()).toBe(true);
    expect(wrapper.find('.form-item').exists()).toBe(true);
  });
  
  it('输入框应该能正常输入', async () => {
    // 找到房间名输入框
    const roomNameInput = wrapper.find('input[name="roomName"]');
    expect(roomNameInput.exists()).toBe(true);
    
    // 输入房间名
    await roomNameInput.setValue('测试房间');
    
    // 验证输入值
    expect(roomNameInput.element.value).toBe('测试房间');
  });
  
  it('表单验证应该正常工作', async () => {
    // 模拟提交表单
    const createRoomBtn = wrapper.find('.create-room-btn');
    await createRoomBtn.trigger('click');
    
    // 验证是否显示了错误提示
    expect(showToast).toHaveBeenCalledWith(expect.any(String));
  });
  
  it('创建房间成功后应该跳转到房间详情页', async () => {
    // 模拟roomApi.createRoom成功响应
    const mockRoom = {
      id: 'room-123',
      name: '测试房间',
      room_type: 'public',
      small_blind: 10,
      big_blind: 20,
      max_players: 6
    };
    
    roomApi.createRoom.mockResolvedValue({
      room: mockRoom
    });
    
    // 填写表单
    const roomNameInput = wrapper.find('input[name="roomName"]');
    await roomNameInput.setValue('测试房间');
    
    const smallBlindInput = wrapper.find('input[name="smallBlind"]');
    await smallBlindInput.setValue(10);
    
    const bigBlindInput = wrapper.find('input[name="bigBlind"]');
    await bigBlindInput.setValue(20);
    
    // 点击创建按钮
    const createRoomBtn = wrapper.find('.create-room-btn');
    await createRoomBtn.trigger('click');
    
    // 验证API调用
    expect(roomApi.createRoom).toHaveBeenCalledWith(expect.objectContaining({
      name: '测试房间',
      small_blind: 10,
      big_blind: 20
    }));
    
    // 验证跳转
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/room/${mockRoom.id}`);
  });
  
  it('创建房间失败后应该显示错误提示', async () => {
    // 模拟roomApi.createRoom失败响应
    roomApi.createRoom.mockRejectedValue(new Error('创建房间失败'));
    
    // 填写表单
    const roomNameInput = wrapper.find('input[name="roomName"]');
    await roomNameInput.setValue('测试房间');
    
    const smallBlindInput = wrapper.find('input[name="smallBlind"]');
    await smallBlindInput.setValue(10);
    
    const bigBlindInput = wrapper.find('input[name="bigBlind"]');
    await bigBlindInput.setValue(20);
    
    // 点击创建按钮
    const createRoomBtn = wrapper.find('.create-room-btn');
    await createRoomBtn.trigger('click');
    
    // 验证错误提示
    expect(showToast).toHaveBeenCalledWith('房间创建失败，请稍后重试');
  });
});
