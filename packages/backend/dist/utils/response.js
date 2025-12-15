"use strict";
/**
 * 统一响应工具函数
 * 用于生成标准的API响应格式：{ code, data, message }
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
/**
 * 成功响应
 * @param data 业务数据
 * @param message 响应消息
 * @param code 状态码
 * @returns 标准响应对象
 */
const successResponse = (data, message = '操作成功', code = 200) => {
    return {
        code,
        message,
        data
    };
};
exports.successResponse = successResponse;
/**
 * 错误响应
 * @param message 错误消息
 * @param code 状态码
 * @param data 附加数据
 * @returns 标准响应对象
 */
const errorResponse = (message, code = 500, data = null) => {
    return {
        code,
        message,
        data
    };
};
exports.errorResponse = errorResponse;
//# sourceMappingURL=response.js.map