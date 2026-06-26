import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const useMock = env.VITE_USE_MOCK === 'true'

  return {
    plugins: [
      vue(),
      // 仅在开启 Mock 时拦截 /api 请求并返回假数据
      viteMockServe({
        mockPath: 'mock',
        enable: useMock
      })
    ],
    server: {
      port: 3000,
      open: true,
      // 关闭 Mock 后，将 /api 代理到真实后端（研发联调时按需修改 target）
      proxy: useMock
        ? undefined
        : {
            '/api': {
              target: 'http://localhost:8080',
              changeOrigin: true
            }
          }
    }
  }
})
