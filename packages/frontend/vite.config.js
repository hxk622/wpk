import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  // 配置解析别名
  resolve: {
    alias: {
      '@poker/shared': path.resolve(__dirname, '../shared/dist/index.js'),
    },
  },
  // 配置服务器
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: true,
    // 配置代理
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
})
