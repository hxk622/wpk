"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextManager = void 0;
const uuid_1 = require("uuid");
// 创建一个AsyncLocalStorage来存储请求上下文
const async_hooks_1 = require("async_hooks");
// 创建AsyncLocalStorage实例
const requestContextStorage = new async_hooks_1.AsyncLocalStorage();
// 上下文管理工具类
class ContextManager {
    // 生成唯一的requestId
    static generateRequestId() {
        return (0, uuid_1.v4)();
    }
    // 生成唯一的sessionId
    static generateSessionId() {
        return (0, uuid_1.v4)();
    }
    // 设置请求上下文
    static setContext(context) {
        requestContextStorage.enterWith(context);
    }
    // 获取当前请求上下文
    static getContext() {
        return requestContextStorage.getStore();
    }
    // 获取当前requestId
    static getRequestId() {
        const context = this.getContext();
        return context?.requestId;
    }
    // 获取当前sessionId
    static getSessionId() {
        const context = this.getContext();
        return context?.sessionId;
    }
    // 设置sessionId到当前上下文
    static setSessionId(sessionId) {
        const context = this.getContext();
        if (context) {
            context.sessionId = sessionId;
        }
    }
    // 设置userId到当前上下文
    static setUserId(userId) {
        const context = this.getContext();
        if (context) {
            context.userId = userId;
        }
    }
}
exports.ContextManager = ContextManager;
//# sourceMappingURL=contextManager.js.map