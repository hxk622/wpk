"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// 确保上传目录存在
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// 配置multer存储
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        // 根据文件类型设置不同的上传目录
        let subdir = 'other';
        if (file.fieldname === 'idCardPhotoFront' || file.fieldname === 'idCardPhotoBack') {
            subdir = 'idcards';
        }
        const dir = path_1.default.join(uploadDir, subdir);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // 创建唯一的文件名，防止重复
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
// 文件过滤
const fileFilter = (req, file, cb) => {
    // 允许的文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('不支持的文件类型，仅支持JPG、PNG格式的图片'));
    }
};
// 配置multer实例
exports.upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 最大文件大小为5MB
        files: 2 // 最多同时上传2个文件
    }
});
//# sourceMappingURL=multer.js.map