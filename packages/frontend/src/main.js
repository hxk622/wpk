import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import pinia from './stores'

// 引入移动端适配
import 'amfe-flexible'

// 引入Vant组件
import { registerVant } from './plugins/vant'
// 引入Vant样式
import 'vant/lib/index.css'

// 创建应用实例
const app = createApp(App)

// 使用路由
app.use(router)
// 使用状态管理
app.use(pinia)
// 注册Vant组件
registerVant(app)

// 挂载应用
app.mount('#app')
