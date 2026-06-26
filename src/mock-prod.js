/**
 * 生产环境 Mock 入口
 * ---------------------------------------------------------------
 * Netlify 等静态托管没有后端，这里用 vite-plugin-mock 的浏览器端能力
 * （createProdMockServer，底层基于 mockjs 拦截 XHR）让 axios 请求命中假数据。
 *
 * 仅当 VITE_USE_MOCK === 'true' 时，由 main.js 动态引入并启用。
 *
 * 说明：
 *   - rawResponse 形式的接口（如预警导出 CSV）在浏览器端 mock 不受支持，
 *     已在聚合时过滤；静态 demo 下导出功能本就无法真正下载文件。
 */
import { createProdMockServer } from 'vite-plugin-mock/client'

import commonMocks from '../mock/index.js'
import warningMocks from '../mock/warning.js'
import userMocks from '../mock/user.js'

// 聚合所有 mock 路由，过滤掉浏览器端不支持的 rawResponse 接口
const allMocks = [...commonMocks, ...warningMocks, ...userMocks].filter(
  item => typeof item.rawResponse !== 'function'
)

export function setupProdMock() {
  createProdMockServer(allMocks)
}
