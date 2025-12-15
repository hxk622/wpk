/**
 * 前端日志工具
 * 提供不同级别的日志记录功能
 */

// 日志级别
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// 当前日志级别（可以根据环境变量配置）
const currentLevel = import.meta.env.DEV ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

class Logger {
  constructor(namespace = 'app') {
    this.namespace = namespace;
  }

  /**
   * 格式化日志消息
   * @param {string} level - 日志级别
   * @param {*} message - 日志消息
   * @param {*} data - 附加数据
   */
  _formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] [${this.namespace}] ${message}`;
    
    if (data !== null) {
      logMessage += `: ${JSON.stringify(data)}`;
    }
    
    return logMessage;
  }

  /**
   * 调试日志
   * @param {string} message - 日志消息
   * @param {*} data - 附加数据
   */
  debug(message, data = null) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.debug(this._formatMessage('DEBUG', message, data));
    }
  }

  /**
   * 信息日志
   * @param {string} message - 日志消息
   * @param {*} data - 附加数据
   */
  info(message, data = null) {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.info(this._formatMessage('INFO', message, data));
    }
  }

  /**
   * 警告日志
   * @param {string} message - 日志消息
   * @param {*} data - 附加数据
   */
  warn(message, data = null) {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn(this._formatMessage('WARN', message, data));
    }
  }

  /**
   * 错误日志
   * @param {string} message - 日志消息
   * @param {*} error - 错误对象
   */
  error(message, error = null) {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      if (error instanceof Error) {
        console.error(this._formatMessage('ERROR', message), error);
      } else {
        console.error(this._formatMessage('ERROR', message, error));
      }
    }
  }

  /**
   * API请求日志
   * @param {string} method - HTTP方法
   * @param {string} url - 请求URL
   * @param {*} data - 请求数据
   */
  apiRequest(method, url, data = null) {
    // 添加调试信息，确认方法被调用
    console.log('apiRequest方法被调用', method, url, data);
    // 始终记录API请求，不受默认日志级别限制
    const requestInfo = { method, url, data };
    console.info(this._formatMessage('API', 'Request', requestInfo));
  }

  /**
   * API响应日志
   * @param {string} method - HTTP方法
   * @param {string} url - 请求URL
   * @param {*} response - 响应数据
   * @param {number} status - HTTP状态码
   */
  apiResponse(method, url, response, status) {
    // 添加调试信息，确认方法被调用
    console.log('apiResponse方法被调用', method, url, status, response);
    // 始终记录API响应，不受默认日志级别限制
    const responseInfo = { method, url, status, response };
    console.info(this._formatMessage('API', 'Response', responseInfo));
  }

  /**
   * API错误日志
   * @param {string} method - HTTP方法
   * @param {string} url - 请求URL
   * @param {*} error - 错误信息
   */
  apiError(method, url, error) {
    // 添加调试信息，确认方法被调用
    console.log('apiError方法被调用', method, url, error);
    // 始终记录API错误，不受默认日志级别限制
    const errorInfo = { method, url, error };
    console.error(this._formatMessage('API', 'Error', errorInfo));
  }
}

// 创建默认日志实例
export const logger = new Logger();

// 导出Logger类以便创建命名空间日志
export default Logger;
