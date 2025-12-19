/**
 * 统一响应工具函数
 * 用于生成标准的API响应格式：{ code, data, message }
 */
/**
 * 成功响应
 * @param data 业务数据
 * @param message 响应消息
 * @param code 状态码
 * @returns 标准响应对象
 */
export declare const successResponse: (data: any, message?: string, code?: number) => {
    code: number;
    message: string;
    data: any;
};
/**
 * 错误响应
 * @param message 错误消息
 * @param code 状态码
 * @param data 附加数据
 * @returns 标准响应对象
 */
export declare const errorResponse: (message: string, code?: number, data?: any) => {
    code: number;
    message: string;
    data: any;
};
