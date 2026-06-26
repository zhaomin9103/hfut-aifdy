/**
 * 生产环境 Mock 入口
 * ---------------------------------------------------------------
 * Netlify 等静态托管没有后端，这里用 mockjs 浏览器端拦截 XHR 让请求命中假数据。
 *
 * 核心问题：vite-plugin-mock 的 prod 客户端实现在包装 response 时丢失了 url 参数，
 * 导致所有依赖 url 解析 ID 的路由报错。这里自己实现 createProdMockServer，
 * 修改参数传递逻辑，让 response 同时接收 { url, query, body, headers }。
 */
import Mock from 'mockjs'
import { pathToRegexp } from 'path-to-regexp'

import commonMocks from '../mock/index.js'
import warningMocks from '../mock/warning.js'
import userMocks from '../mock/user.js'

// 聚合所有 mock 路由，过滤掉浏览器端不支持的 rawResponse 接口
const allMocks = [...commonMocks, ...warningMocks, ...userMocks].filter(
  item => typeof item.rawResponse !== 'function'
)

/**
 * 自实现 createProdMockServer（基于 vite-plugin-mock/client，修改传参逻辑）
 * 关键修改：wrapResponse 传递 url 参数给 response（兼容 dev 模式写法）
 */
function createProdMockServerWithUrl(mockList) {
  // 复用 vite-plugin-mock 的 XHR patch（支持 withCredentials、responseType）
  Mock.XHR.prototype.__send = Mock.XHR.prototype.send
  Mock.XHR.prototype.send = function() {
    if (this.custom.xhr) {
      this.custom.xhr.withCredentials = this.withCredentials || false
      if (this.responseType) {
        this.custom.xhr.responseType = this.responseType
      }
    }
    if (this.custom.requestHeaders) {
      const headers = {}
      for (let k in this.custom.requestHeaders) {
        headers[k.toString().toLowerCase()] = this.custom.requestHeaders[k]
      }
      this.custom.options = Object.assign({}, this.custom.options, { headers })
    }
    this.__send.apply(this, arguments)
  }

  Mock.XHR.prototype.proxy_open = Mock.XHR.prototype.open
  Mock.XHR.prototype.open = function() {
    let responseType = this.responseType
    this.proxy_open(...arguments)
    if (this.custom.xhr) {
      if (responseType) {
        this.custom.xhr.responseType = responseType
      }
    }
  }

  // 解析 URL query string
  function param2Obj(url) {
    const search = url.split('?')[1]
    if (!search) return {}
    try {
      return JSON.parse(
        '{"' + decodeURIComponent(search)
          .replace(/"/g, '\\"')
          .replace(/&/g, '","')
          .replace(/=/g, '":"')
          .replace(/\+/g, ' ') + '"}'
      )
    } catch (e) {
      console.warn('[mock] query parse error:', url, e)
      return {}
    }
  }

  // 包装 response，注入 url（关键修改点）
  function wrapResponse(Mock, handle) {
    return function(options) {
      let result = null
      if (typeof handle === 'function') {
        const { body, type, url, headers } = options
        let b = body
        try {
          b = JSON.parse(body)
        } catch {}
        try {
          // 修改：同时传递 url 和 query，兼容 dev 模式写法
          result = handle({
            method: type,
            body: b,
            query: param2Obj(url),
            headers,
            url  // ← 关键：注入 url 参数
          })
        } catch (e) {
          console.error('[mock] response error:', url, e)
          return { code: 1, message: 'Mock response error: ' + e.message }
        }
      } else {
        result = handle
      }
      return Mock.mock(result)
    }
  }

  // 注册所有 mock 路由
  for (const { url, method, response, timeout } of mockList) {
    if (timeout) Mock.setup({ timeout })
    Mock.mock(
      pathToRegexp(url, void 0, { end: false }),
      method || 'get',
      wrapResponse(Mock, response)
    )
  }
}

export function setupProdMock() {
  createProdMockServerWithUrl(allMocks)
}
