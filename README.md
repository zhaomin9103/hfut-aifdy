# AI 辅导员后台管理系统

基于 Vue 3 + Vite + Element Plus 的后台管理前端。

## 技术栈

- Vue 3（`<script setup>` 组合式 API）
- Vue Router 4（history 模式）
- Element Plus
- ECharts 5 / vue-echarts
- Axios（统一封装见 `src/api/request.js`）
- 构建工具：Vite 5

## 快速开始

```bash
npm install      # 安装依赖
npm run dev      # 本地开发，默认 http://localhost:3000（端口被占用会自动顺延）
```

## 环境与构建

项目用 Vite 的环境文件区分场景，**研发只需关心正式构建**：

| 命令 | 加载的环境文件 | Mock | 用途 |
|------|----------------|------|------|
| `npm run dev` | `.env`（开发） | 开（`VITE_USE_MOCK=true`） | 本地开发，由 vite-plugin-mock 中间件拦截 `/api` |
| `npm run build` | `.env.production` | **关** | **正式构建，接真实后端** |
| `npm run build:demo` | `.env.demo` | 开 | 演示构建（Netlify），打包前端假数据 |

### 接入真实后端（交付研发关注）

正式构建（`npm run build`）默认 **不含任何 Mock 代码**，直接调用真实后端。需要做的只是配置后端地址，二选一：

1. **改环境变量**：编辑 `.env.production`，把 `VITE_API_BASE_URL` 改为后端地址，例如
   ```
   VITE_API_BASE_URL=https://api.your-domain.com
   ```
2. **网关/反向代理**：保留 `VITE_API_BASE_URL=/api`，由 Nginx 等把 `/api` 转发到后端。

> 接口契约：后端响应统一格式 `{ code, message, data }`，`code === 0` 为成功；
> 分页接口 `data` 形如 `{ list, total, page, size }`。详见 `src/api/request.js` 拦截器。
> 各业务接口路径与参数见 `src/api/*.js`，对应的字段结构可参考 `mock/*.js`（仅作契约参考，不参与正式构建）。

### 登录态约定

- 登录成功后 token 存于 `localStorage`（key: `token`），由请求拦截器自动注入 `Authorization: Bearer <token>`。
- 401 响应会自动清除登录态并跳转 `/login`。
- 演示用 token 为 `mock-token-<id>` 简化格式，**真实后端应替换为 JWT 等正式方案**。

## 目录结构

```
├─ src/
│  ├─ api/            # 接口封装（按模块拆分）
│  ├─ layout/         # 整体布局（侧边栏、顶栏、修改密码/退出）
│  ├─ views/          # 各业务页面
│  ├─ utils/auth.js   # 登录态读写
│  ├─ router.js       # 路由 + 登录守卫
│  ├─ mock-prod.js    # 【仅演示构建用】浏览器端 mock 入口
│  └─ main.js         # 入口（mock 仅在演示构建动态加载）
├─ mock/              # Mock 数据与接口（dev 与演示构建共用，正式构建不打包）
├─ .env               # 开发环境变量
├─ .env.production    # 正式构建变量（接后端）
├─ .env.demo          # 演示构建变量（Netlify 专用）
└─ netlify.toml       # Netlify 演示部署配置
```

## Mock 体系说明

Mock 仅用于开发联调与演示，**对正式交付无侵入**：

- **开发**（`npm run dev`）：`vite-plugin-mock` 以服务端中间件方式拦截 `/api`。
- **演示**（`npm run build:demo`）：通过 `src/mock-prod.js` 在浏览器端拦截 XHR（基于 mockjs），数据为内存态，刷新页面会重置。
- **正式**（`npm run build`）：`main.js` 中的 mock 引入条件恒为 false，被构建工具死代码消除，产物中 **不含 mockjs 与任何 mock 代码**。

如需彻底移除演示能力，删除 `src/mock-prod.js`、`mock/` 目录、`.env.demo`、`netlify.toml`、`public/_redirects` 即可，正式构建不受影响。

## 演示部署（Netlify）

仓库已含 `netlify.toml`，Netlify 导入后自动执行 `npm run build:demo`，并通过 `public/_redirects` 处理 SPA 路由回退。详见仓库内部署说明。

演示账号：`admin / admin123`，其余用户初始密码 `hfut123456`。
