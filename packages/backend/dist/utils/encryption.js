"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionUtil = void 0;
const crypto_1 = __importDefault(require("crypto"));
// 加密算法配置
const ALGORITHM = 'aes-256-cbc';
const HASH_ALGORITHM = 'sha256';
const IV_LENGTH = 16; // AES-256-CBC使用16字节的IV
// 从环境变量获取加密密钥，如果没有则生成一个临时密钥
const SECRET_KEY = process.env.ENCRYPTION_KEY
    ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
    : crypto_1.default.randomBytes(32); // AES-256需要32字节的密钥
/**
 * 加密工具类
 */
class EncryptionUtil {
    /**
     * 加密文本
     * @param text 要加密的文本
     * @returns 加密后的文本（格式：iv:encryptedData）
     */
    static encrypt(text) {
        // 生成随机IV
        const iv = crypto_1.default.randomBytes(IV_LENGTH);
        // 创建加密器
        const cipher = crypto_1.default.createCipheriv(ALGORITHM, SECRET_KEY, iv);
        // 执行加密
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        // 返回IV和加密数据的组合
        return `${iv.toString('hex')}:${encrypted}`;
    }
    /**
     * 解密文本
     * @param encryptedText 加密后的文本（格式：iv:encryptedData）
     * @returns 解密后的文本
     */
    static decrypt(encryptedText) {
        // 分离IV和加密数据
        const parts = encryptedText.split(':');
        if (parts.length !== 2) {
            throw new Error('无效的加密格式');
        }
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        // 创建解密器
        const decipher = crypto_1.default.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
        // 执行解密
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    /**
     * 生成密码哈希
     * @param password 原始密码
     * @returns 哈希后的密码（格式：salt:hash）
     */
    static hashPassword(password) {
        // 生成随机盐值
        const salt = crypto_1.default.randomBytes(16).toString('hex');
        // 创建哈希
        const hash = crypto_1.default
            .pbkdf2Sync(password, salt, 100000, 64, HASH_ALGORITHM)
            .toString('hex');
        // 返回盐值和哈希的组合
        return `${salt}:${hash}`;
    }
    /**
     * 验证密码
     * @param password 原始密码
     * @param hashPassword 哈希后的密码（格式：salt:hash）
     * @returns 是否匹配
     */
    static verifyPassword(password, hashPassword) {
        // 分离盐值和哈希
        const parts = hashPassword.split(':');
        if (parts.length !== 2) {
            throw new Error('无效的哈希格式');
        }
        const salt = parts[0];
        const originalHash = parts[1];
        // 创建新的哈希
        const hash = crypto_1.default
            .pbkdf2Sync(password, salt, 100000, 64, HASH_ALGORITHM)
            .toString('hex');
        // 比较哈希
        return hash === originalHash;
    }
    /**
     * 生成随机密钥
     * @param length 密钥长度（字节）
     * @returns 随机密钥的十六进制表示
     */
    static generateSecretKey(length = 32) {
        return crypto_1.default.randomBytes(length).toString('hex');
    }
    /**
     * 生成数据的哈希值
     * @param data 要哈希的数据
     * @returns 哈希值
     */
    static generateHash(data) {
        return crypto_1.default
            .createHash(HASH_ALGORITHM)
            .update(data)
            .digest('hex');
    }
}
exports.EncryptionUtil = EncryptionUtil;
//# sourceMappingURL=encryption.js.map