import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
// 创建实例
app.use(ElementPlus, { size: 'small', zIndex: 3000 })
//调用方法

app.mount('#app')
