/**
 * 加密工具类
 */
export declare class EncryptionUtil {
    /**
     * 加密文本
     * @param text 要加密的文本
     * @returns 加密后的文本（格式：iv:encryptedData）
     */
    static encrypt(text: string): string;
    /**
     * 解密文本
     * @param encryptedText 加密后的文本（格式：iv:encryptedData）
     * @returns 解密后的文本
     */
    static decrypt(encryptedText: string): string;
    /**
     * 生成密码哈希
     * @param password 原始密码
     * @returns 哈希后的密码（格式：salt:hash）
     */
    static hashPassword(password: string): string;
    /**
     * 验证密码
     * @param password 原始密码
     * @param hashPassword 哈希后的密码（格式：salt:hash）
     * @returns 是否匹配
     */
    static verifyPassword(password: string, hashPassword: string): boolean;
    /**
     * 生成随机密钥
     * @param length 密钥长度（字节）
     * @returns 随机密钥的十六进制表示
     */
    static generateSecretKey(length?: number): string;
    /**
     * 生成数据的哈希值
     * @param data 要哈希的数据
     * @returns 哈希值
     */
    static generateHash(data: string): string;
}
