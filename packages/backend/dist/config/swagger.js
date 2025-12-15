"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
// Swagger配置选项
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '德州扑克游戏API',
            version: '1.0.0',
            description: '德州扑克游戏后端API文档',
            contact: {
                name: '项目团队',
                email: 'contact@example.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: '本地开发服务器',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // 指定API文档的源文件路径
    apis: ['./src/routes/*.ts', './src/types/index.ts'],
};
// 生成Swagger规范
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
exports.default = swaggerSpec;
//# sourceMappingURL=swagger.js.map