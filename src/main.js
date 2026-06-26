import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 注册 ECharts 组件（按需引入）
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
])

// 全局注册 vue-echarts 组件
app.component('v-chart', VChart)

// Register all Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus, { locale: undefined })
app.use(router)

// 启动流程：生产构建开启 Mock 时，先装载浏览器端 mock 再挂载应用，
// 避免首屏请求早于 mock 拦截器就绪。dev 模式由插件中间件处理。
async function bootstrap() {
  if (import.meta.env.PROD && import.meta.env.VITE_USE_MOCK === 'true') {
    try {
      const { setupProdMock } = await import('./mock-prod')
      setupProdMock()
    } catch (e) {
      console.error('[mock] 生产 Mock 启用失败：', e)
    }
  }
  app.mount('#app')
}

bootstrap()
