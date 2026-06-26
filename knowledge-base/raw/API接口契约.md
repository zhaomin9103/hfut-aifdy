# 接口契约说明（前后端对接文档）

> 本文档供研发团队对接后端使用。前端 Demo 阶段使用 `vite-plugin-mock` 拦截以下接口返回假数据，
> 后端按本文档实现真实接口后，前端只需关闭 Mock 开关即可无缝切换，组件代码无需改动。

## 一、通用约定

### 1. 基础路径
所有接口以 `/api` 为前缀（由环境变量 `VITE_API_BASE_URL` 配置）。

### 2. 统一响应格式
所有接口返回 JSON，结构如下：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 0 表示成功；非 0 表示业务错误 |
| message | string | 提示信息，业务错误时前端会直接弹出该文案 |
| data | any | 业务数据；失败时可为 null |

### 3. 分页响应格式
列表类接口的 `data` 统一为：

```json
{
  "list": [],
  "total": 100,
  "page": 1,
  "size": 10
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| list | array | 当前页数据列表 |
| total | number | 总记录数（用于前端分页器） |
| page | number | 当前页码（从 1 开始） |
| size | number | 每页条数 |

### 4. 鉴权
前端会在请求头携带 `Authorization: Bearer <token>`（如本地存有 token）。后端按需校验。

### 5. HTTP 状态码约定
- 401：登录过期，前端提示「登录已过期，请重新登录」
- 403：无权限
- 5xx：服务器异常

---

## 二、智能体管理

### 1. 分页查询智能体列表
```
GET /api/agents
```
**Query 参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 是 | 页码，从 1 开始 |
| size | number | 是 | 每页条数 |
| category | string | 否 | 按分类名称过滤 |
| name | string | 否 | 按智能体名称模糊搜索 |

**响应 data.list 元素结构：**
```json
{
  "id": 1,
  "name": "学业辅导助手",
  "link": "https://ai.example.com/agent/1",
  "category": "学业辅导",
  "status": "active",
  "sortOrder": 1
}
```
> status 取值：`active`（启用）/ `inactive`（停用）。列表需按 sortOrder 升序返回。

### 2. 创建智能体
```
POST /api/agents
```
**请求体：** `{ name, category, link, sortOrder }`
**响应：** 新建的智能体对象（含 id）

### 3. 更新智能体
```
PUT /api/agents/{id}
```
**请求体（部分更新，字段均可选）：** `{ name?, category?, link?, sortOrder?, status? }`
> 启用/停用开关、排序框均通过此接口更新对应字段。

### 4. 删除智能体
```
DELETE /api/agents/{id}
```

---

## 三、分类管理

### 1. 分页查询分类列表
```
GET /api/categories
```
**Query 参数：** `page`、`size`、`name?`（按名称模糊搜索）

**响应 data.list 元素结构：**
```json
{ "id": 1, "name": "学业辅导", "sortOrder": 1 }
```
> 列表需按 sortOrder 升序返回。
> 注：智能体管理页、快捷问题页的「分类/智能体下拉」会以 `size=100` 调用列表接口获取全量选项。

### 2. 创建分类
```
POST /api/categories
```
**请求体：** `{ name }`

### 3. 更新分类
```
PUT /api/categories/{id}
```
**请求体：** `{ name?, sortOrder? }`

### 4. 删除分类
```
DELETE /api/categories/{id}
```

---

## 四、快捷问题配置

### 1. 分页查询快捷问题列表
```
GET /api/quick-questions
```
**Query 参数：** `page`、`size`、`title?`（按问题名称模糊搜索）

**响应 data.list 元素结构：**
```json
{
  "id": 1,
  "title": "期末考试安排",
  "agentId": 1,
  "agentName": "学业辅导助手",
  "useCount": 1280,
  "createTime": "2026-05-01 10:00:00"
}
```
> agentName 为关联智能体名称（后端联表返回，前端只读展示）。useCount 为点击次数。

### 2. 创建快捷问题
```
POST /api/quick-questions
```
**请求体：** `{ title, agentId }`
> 后端根据 agentId 关联智能体，useCount 初始为 0，createTime 由后端生成。

### 3. 更新快捷问题
```
PUT /api/quick-questions/{id}
```
**请求体：** `{ title?, agentId? }`

### 4. 删除快捷问题
```
DELETE /api/quick-questions/{id}
```

---

## 五、用户反馈

### 1. 分页查询反馈记录列表
```
GET /api/feedback-records
```
**Query 参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 是 | 页码 |
| size | number | 是 | 每页条数 |
| userSearch | string | 否 | 按用户姓名或用户ID模糊搜索 |
| type | string | 否 | 反馈类型：`反馈` / `建议` |
| status | string | 否 | 处理状态：`pending` / `processed` |

**响应 data.list 元素结构：**
```json
{
  "id": 1,
  "userId": "U10001",
  "userName": "张三",
  "type": "反馈",
  "content": "反馈的具体内容……",
  "agentName": "学业辅导助手",
  "status": "processed",
  "createTime": "2026-05-21 14:30:00",
  "handledBy": "系统管理员",
  "handledRemark": "处理情况说明……",
  "handledTime": "2026-05-21 16:00:00"
}
```
> type 取值：`反馈` / `建议`；status 取值：`pending`（待处理）/ `processed`（已处理）。
> handledBy / handledRemark / handledTime 为处理信息，待处理记录为空字符串；已处理记录通过「处理结果」弹窗展示这些字段。

### 2. 反馈统计

```
GET /api/feedback-records/stats
```
**响应 data 结构：**
```json
{
  "total": 10,
  "pendingCount": 4,
  "processedCount": 6,
  "typeStats": [
    { "type": "反馈", "count": 6, "percent": 60 },
    { "type": "建议", "count": 4, "percent": 40 }
  ]
}
```
> total 为反馈总数；typeStats 为各反馈类型的数量与占比（percent 为百分比数值，保留 1 位小数）。前端用于列表上方的统计卡片。

### 3. 处理反馈（更新处理状态）
```
PUT /api/feedback-records/{id}/status
```
**请求体：** `{ status: "processed", handledBy: string, handledRemark: string }`
> 点击「处理」按钮并在弹窗中填写处理人、处理记录后调用，将状态置为 processed，handledTime 由后端生成。

---

## 六、心理风险预警

> 风险等级共四级，含义如下（前端在统计卡片上以 info 图标悬浮展示）：
> - **P0-紧急危机**：明确自杀计划 / 正在实施自伤 / 急性精神异常 / 幻觉妄想失控
> - **P1-高危风险**：自杀意念表达 / 重度抑郁倾向 / 严重情绪崩溃 / 创伤急性反应
> - **P2-中危关注**：持续情绪低落 / 明显社交退缩 / 学业人际严重困扰 / 睡眠食欲显著异常
> - **P3-低危预警**：偶发负面情绪 / 轻度压力反应 / 一般性困惑 / 需一般性支持

### 1. 风险等级统计

```
GET /api/psychological-warnings/stats
```
**Query 参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| period | string | 否 | 统计周期：`7`（近7天）/ `30`（近30天，默认）/ `180`（近180天）/ `all`（累计） |

**响应 data 结构：**
```json
{ "period": "30", "p0Count": 6, "p1Count": 19, "p2Count": 42, "p3Count": 73 }
```
> 仅统计 P0~P3 四个等级的数量，按传入的 period 聚合返回。

### 2. 分页查询预警列表

```
GET /api/psychological-warnings
```
**Query 参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 是 | 页码 |
| size | number | 是 | 每页条数 |
| riskLevel | string | 否 | 风险等级：`P0` / `P1` / `P2` / `P3` |
| riskTypes | string | 否 | 风险类型，多个以英文逗号分隔，命中任一即匹配 |
| emailStatus | string | 否 | 邮件状态：`sent`（已发送）/ `failed`（发送失败） |
| studentSearch | string | 否 | 按学生姓名或学号模糊搜索 |
| startTime | string | 否 | 研判时间起（`YYYY-MM-DD HH:mm:ss`） |
| endTime | string | 否 | 研判时间止（`YYYY-MM-DD HH:mm:ss`） |

**响应 data.list 元素结构：**
```json
{
  "id": 1001,
  "studentName": "林晓彤",
  "studentNumber": "2021214301",
  "college": "计算机与信息学院",
  "major": "软件工程",
  "className": "软工2101",
  "counselorName": "王敏",
  "counselorEmail": "wangmin@hfut.edu.cn",
  "riskLevel": "P0",
  "riskTypes": ["自伤自杀类", "情绪类"],
  "triggerType": "fast",
  "confidence": 96,
  "emailSendStatus": "sent",
  "createdAt": "2026-06-24 23:18:42",
  "handledAt": null
}
```
> riskLevel 取值 `P0`~`P3`；triggerType：`fast`（快路）/ `slow`（慢路）；confidence 为 0~100 整数；列表按 createdAt 倒序返回。

### 3. 获取预警详情

```
GET /api/psychological-warnings/{id}
```
**响应 data 结构：** 在列表元素基础上额外包含
`sessionId`、`turnIndexRange`、`triggerKeywords`(string[])、`reasoning`、`suggestedAction`(`{ immediateResponse, notifyTargets[], intervention }`)、`emailSendDecision`、`dedupResult`。

### 4. 获取关联对话记录

```
GET /api/psychological-warnings/{id}/dialogues
```
**响应 data 为数组，元素结构：**
```json
{
  "turnIndex": 3,
  "role": "student",
  "contentType": "text",
  "timestamp": "2026-06-24 23:18:42",
  "isContext": false,
  "isEvidence": true,
  "content": "对话内容……",
  "evidenceReason": "命中高风险关键词的研判说明（仅 isEvidence=true 时有）"
}
```
> role：`student` / `assistant`；contentType：`text` / `voice` / `image` / `file`。

### 5. 获取邮件发送日志

```
GET /api/psychological-warnings/{id}/email-logs
```
**响应 data 为数组，元素结构：**
```json
{ "attemptOrder": 1, "sendTime": "2026-06-24 23:18:42", "status": "success", "failureReason": "", "retryAfterSeconds": null }
```
> status：`success` / `fail`；retryAfterSeconds 为下次重试间隔秒数（无则为 null）。

### 6. 重新发送预警邮件

```
POST /api/psychological-warnings/{id}/resend-email
```

### 7. 标记已处理

```
PUT /api/psychological-warnings/{id}/mark-handled
```
**请求体：** `{ handledBy: string, remark?: string }`

### 8. 批量标记已处理

```
POST /api/psychological-warnings/batch-mark-handled
```
**请求体：** `{ ids: number[], handledBy: string, remark?: string }`

### 9. 导出预警记录

```
GET /api/psychological-warnings/export
```
**Query 参数：** 同列表查询的筛选参数（不含分页）。
**响应：** 文件流（CSV / Excel，前端以 Blob 下载）。

---

## 七、数据表设计建议（供后端 MyBatis-Plus 参考）

| 表名 | 对应模块 | 关键字段 |
|------|---------|---------|
| agent | 智能体 | id, name, link, category(或 category_id), status, sort_order |
| category | 分类 | id, name, sort_order |
| quick_question | 快捷问题 | id, title, agent_id, use_count, create_time |
| feedback_record | 反馈记录 | id, user_id, user_name, type, content, agent_id(或 agent_name), status, create_time |
| psych_warning | 心理风险预警 | id, student_id, risk_level, risk_types, trigger_type, confidence, reasoning, email_send_status, counselor_id, created_at, handled_at, handled_by |
| psych_warning_dialogue | 预警对话记录 | id, warning_id, turn_index, role, content_type, content, is_context, is_evidence, evidence_reason, timestamp |
| psych_warning_email_log | 邮件发送日志 | id, warning_id, attempt_order, send_time, status, failure_reason, retry_after_seconds |

> 说明：上述 JSON 字段使用 camelCase，数据库字段建议 snake_case，
> MyBatis-Plus 开启 `map-underscore-to-camel-case` 自动映射即可。
> 实际外键关系（如 quick_question.agent_id、agent.category_id）由后端根据业务确定。
