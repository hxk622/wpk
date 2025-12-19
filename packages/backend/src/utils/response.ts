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
export const successResponse = (
  data: any,
  message: string = '操作成功',
  code: number = 0
): { code: number; message: string; data: any } => {
  return {
    code,
    message,
    data
  };
};

/**
 * 错误响应
 * @param message 错误消息
 * @param code 状态码
 * @param data 附加数据
 * @returns 标准响应对象
 */
export const errorResponse = (
  message: string,
  code: number = 500,
  data: any = null
): { code: number; message: string; data: any } => {
  return {
    code,
    message,
    data
  };
};
