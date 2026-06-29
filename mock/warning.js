/**
 * 心理风险预警 Mock 数据与接口
 * 统一响应格式：{ code: 0, message: 'ok', data: ... }
 *
 * 注意：路由匹配按数组顺序「先到先得」，因此 /stats、/export 等
 * 固定路径必须排在 /:id 动态路径之前，避免被 :id 误匹配。
 */

// ===== 统计数据（按周期预聚合，与列表解耦，更贴近真实后端聚合查询） =====
// 业务约定: P3 低危预警由 AI 端内疏导,后台不留档、不发邮件;统计与列表仅维护 P0/P1/P2。
// 数字与下方 warnings 列表的 P0/P1/P2 实际条数(2/3/4)在 '7'/'30' 上保持一致,
// 避免演示 demo 时统计与筛选条数明显不对。'180'/'all' 仍按历史聚合给出,模拟真实增量。
const STATS_BY_PERIOD = {
  '7': { p0Count: 2, p1Count: 3, p2Count: 4 },
  '30': { p0Count: 2, p1Count: 3, p2Count: 4 },
  '180': { p0Count: 23, p1Count: 88, p2Count: 210 },
  all: { p0Count: 41, p1Count: 156, p2Count: 389 }
}

// ===== 列表假数据（9 条 P0/P1/P2,分页每页 10 条 → 单页可展示全部） =====
// 注: id 1004/1010/1011 三个号段为已下线 P3 历史预留,不复用以便演示时直接对应"P3 已退出"的事实。
let warnings = [
  {
    id: 1001, studentName: '林晓彤', studentNumber: '2021214301', college: '计算机与信息学院',
    major: '软件工程', className: '软工2101', counselorName: '王敏', counselorEmail: 'wangmin@hfut.edu.cn',
    riskLevel: 'P0', riskTypes: ['自伤自杀类', '情绪类'], triggerType: 'fast', confidence: 96,
    emailSendStatus: 'sent', createdAt: '2026-06-24 23:18:42', handledAt: null,
    sessionId: 'sess-9f2a1c', turnIndexRange: '12-15',
    triggerKeywords: ['不想活了', '结束这一切', '安眠药'],
    reasoning: '学生在连续多轮对话中明确表达了自杀计划，并提及已准备药物，情绪处于急性崩溃状态，结合关键词命中与语义研判，判定为 P0 紧急危机，需立即人工介入。',
    suggestedAction: {
      immediateResponse: '已触发紧急预案，立即电话联系学生本人及辅导员，启动校园危机干预流程。',
      notifyTargets: ['辅导员', '心理健康教育中心', '学院分管领导'],
      intervention: '24 小时内安排专业心理咨询师面谈，必要时联系家长并转介专业医疗机构。'
    },
    emailSendDecision: '命中 P0 紧急规则，强制即时发送', dedupResult: '近 24h 内无重复预警，正常发送'
  },
  {
    id: 1002, studentName: '陈昊然', studentNumber: '2022081145', college: '机械工程学院',
    major: '机械设计制造及其自动化', className: '机械2203', counselorName: '李国强', counselorEmail: 'ligq@hfut.edu.cn',
    riskLevel: 'P1', riskTypes: ['情绪类', '学业类'], triggerType: 'fast', confidence: 88,
    emailSendStatus: 'sent', createdAt: '2026-06-24 16:05:11', handledAt: '2026-06-24 18:30:00',
    sessionId: 'sess-7b3d22', turnIndexRange: '6-9',
    triggerKeywords: ['活着没意义', '撑不下去'],
    reasoning: '学生表达了较强的自杀意念与重度抑郁倾向，伴随学业挫败感，虽未提及具体计划，但情绪强度高，判定为 P1 高危风险。',
    suggestedAction: {
      immediateResponse: '辅导员主动联系学生，了解近况并给予情感支持。',
      notifyTargets: ['辅导员', '心理健康教育中心'],
      intervention: '建议预约校心理咨询，持续关注情绪变化。'
    },
    emailSendDecision: '命中 P1 高危规则，即时发送', dedupResult: '近 24h 内无重复预警，正常发送'
  },
  {
    id: 1003, studentName: '赵雨桐', studentNumber: '2020113087', college: '管理学院',
    major: '工商管理', className: '工管2002', counselorName: '孙丽', counselorEmail: 'sunli@hfut.edu.cn',
    riskLevel: 'P2', riskTypes: ['人际关系类', '情绪类'], triggerType: 'slow', confidence: 74,
    emailSendStatus: 'sent', createdAt: '2026-06-23 21:42:30', handledAt: null,
    sessionId: 'sess-4c8e90', turnIndexRange: '3-7',
    triggerKeywords: ['没人理解我', '孤独'],
    reasoning: '学生持续表达情绪低落与社交退缩，存在明显人际困扰，情绪状态需要关注，判定为 P2 中危关注。',
    suggestedAction: {
      immediateResponse: '辅导员适时关心，鼓励参与集体活动。',
      notifyTargets: ['辅导员'],
      intervention: '可推荐参加团体心理辅导或朋辈互助小组。'
    },
    emailSendDecision: '命中 P2 规则，慢路聚合后发送', dedupResult: '近 24h 内无重复预警，正常发送'
  },
  {
    id: 1005, studentName: '黄梓萱', studentNumber: '2021207466', college: '外国语学院',
    major: '英语', className: '英语2104', counselorName: '郑红', counselorEmail: 'zhenghong@hfut.edu.cn',
    riskLevel: 'P1', riskTypes: ['创伤类', '情绪类'], triggerType: 'fast', confidence: 91,
    emailSendStatus: 'failed', createdAt: '2026-06-22 19:33:57', handledAt: null,
    sessionId: 'sess-8d4b61', turnIndexRange: '8-11',
    triggerKeywords: ['噩梦', '控制不住地哭', '闪回'],
    reasoning: '学生描述创伤事件后的急性应激反应，伴随严重情绪崩溃与睡眠障碍，判定为 P1 高危风险。',
    suggestedAction: {
      immediateResponse: '辅导员尽快联系学生，提供稳定化支持。',
      notifyTargets: ['辅导员', '心理健康教育中心'],
      intervention: '建议尽快转介专业心理咨询，评估是否需要医疗支持。'
    },
    emailSendDecision: '命中 P1 高危规则，即时发送', dedupResult: '近 24h 内无重复预警，正常发送'
  },
  {
    id: 1006, studentName: '徐子轩', studentNumber: '2022149032', college: '材料科学与工程学院',
    major: '材料成型及控制工程', className: '材料2202', counselorName: '冯涛', counselorEmail: 'fengtao@hfut.edu.cn',
    riskLevel: 'P2', riskTypes: ['学业类', '情绪类'], triggerType: 'slow', confidence: 70,
    emailSendStatus: 'sent', createdAt: '2026-06-21 14:22:05', handledAt: '2026-06-21 20:10:00',
    sessionId: 'sess-2e7a48', turnIndexRange: '4-8',
    triggerKeywords: ['挂科', '压力大', '睡不着'],
    reasoning: '学生因学业压力出现持续情绪低落与睡眠异常，存在明显学业困扰，判定为 P2 中危关注。',
    suggestedAction: {
      immediateResponse: '辅导员了解学业困难，协助制定学习计划。',
      notifyTargets: ['辅导员'],
      intervention: '推荐学业辅导资源，关注睡眠与情绪。'
    },
    emailSendDecision: '命中 P2 规则，慢路聚合后发送', dedupResult: '近 24h 内无重复预警，正常发送'
  },
  {
    id: 1007, studentName: '罗浩宇', studentNumber: '2021233574', college: '数学学院',
    major: '信息与计算科学', className: '信计2103', counselorName: '王敏', counselorEmail: 'wangmin@hfut.edu.cn',
    riskLevel: 'P0', riskTypes: ['精神类', '自伤自杀类'], triggerType: 'fast', confidence: 94,
    emailSendStatus: 'failed', createdAt: '2026-06-15 02:11:36', handledAt: null,
    sessionId: 'sess-3b1d57', turnIndexRange: '10-14',
    triggerKeywords: ['有人在监视我', '幻听', '伤害自己'],
    reasoning: '学生出现疑似幻觉妄想等急性精神异常表现，并伴随自伤倾向，现实检验能力受损，判定为 P0 紧急危机。',
    suggestedAction: {
      immediateResponse: '立即启动危机干预，联系辅导员与家长，确保学生人身安全。',
      notifyTargets: ['辅导员', '心理健康教育中心', '学院分管领导', '家长'],
      intervention: '紧急转介精神专科医院进行评估与诊治。'
    },
    emailSendDecision: '命中 P0 紧急规则，强制即时发送', dedupResult: '近 24h 内无重复预警，正常发送'
  },
  {
    id: 1008, studentName: '高欣怡', studentNumber: '2022077198', college: '食品科学与工程学院',
    major: '食品科学与工程', className: '食品2201', counselorName: '李国强', counselorEmail: 'ligq@hfut.edu.cn',
    riskLevel: 'P2', riskTypes: ['家庭类', '情绪类'], triggerType: 'slow', confidence: 68,
    emailSendStatus: 'sent', createdAt: '2026-05-28 17:26:44', handledAt: '2026-05-29 09:00:00',
    sessionId: 'sess-5c2e83', turnIndexRange: '5-9',
    triggerKeywords: ['家里吵架', '不想回家'],
    reasoning: '学生因家庭关系紧张出现持续情绪低落，存在明显家庭困扰，判定为 P2 中危关注。',
    suggestedAction: {
      immediateResponse: '辅导员关心学生家庭情况，给予情感支持。',
      notifyTargets: ['辅导员'],
      intervention: '提供家庭关系议题的心理辅导资源。'
    },
    emailSendDecision: '命中 P2 规则，慢路聚合后发送', dedupResult: '近 24h 内无重复预警，正常发送'
  },
  {
    id: 1009, studentName: '邓承志', studentNumber: '2020166023', college: '土木与水利工程学院',
    major: '土木工程', className: '土木2003', counselorName: '孙丽', counselorEmail: 'sunli@hfut.edu.cn',
    riskLevel: 'P1', riskTypes: ['成瘾类', '情绪类'], triggerType: 'fast', confidence: 85,
    emailSendStatus: 'sent', createdAt: '2026-05-12 23:55:02', handledAt: null,
    sessionId: 'sess-9a6f30', turnIndexRange: '7-10',
    triggerKeywords: ['戒不掉', '通宵打游戏', '崩溃'],
    reasoning: '学生存在严重行为成瘾倾向并伴随情绪崩溃，自我控制困难，判定为 P1 高危风险。',
    suggestedAction: {
      immediateResponse: '辅导员介入了解成瘾行为，建立支持关系。',
      notifyTargets: ['辅导员', '心理健康教育中心'],
      intervention: '建议接受成瘾相关心理咨询与行为干预。'
    },
    emailSendDecision: '命中 P1 高危规则，即时发送', dedupResult: '近 24h 内无重复预警，正常发送'
  },
  {
    id: 1012, studentName: '范一鸣', studentNumber: '2021241160', college: '化学与化工学院',
    major: '化学工程与工艺', className: '化工2106', counselorName: '郑红', counselorEmail: 'zhenghong@hfut.edu.cn',
    riskLevel: 'P2', riskTypes: ['人际关系类', '学业类'], triggerType: 'slow', confidence: 72,
    emailSendStatus: 'failed', createdAt: '2026-02-26 20:18:50', handledAt: null,
    sessionId: 'sess-4e8a17', turnIndexRange: '6-10',
    triggerKeywords: ['和室友闹翻', '不想去上课'],
    reasoning: '学生因人际冲突出现社交退缩与学业回避，困扰持续，判定为 P2 中危关注。',
    suggestedAction: {
      immediateResponse: '辅导员协调寝室关系，了解学业状态。',
      notifyTargets: ['辅导员'],
      intervention: '提供人际沟通辅导与学业支持。'
    },
    emailSendDecision: '命中 P2 规则，慢路聚合后发送', dedupResult: '近 24h 内无重复预警，正常发送'
  }
]

// ===== 工具函数 =====
function success(data) {
  return { code: 0, message: 'ok', data }
}

function paginate(list, page, size) {
  const p = Number(page) || 1
  const s = Number(size) || 10
  const start = (p - 1) * s
  return { list: list.slice(start, start + s), total: list.length, page: p, size: s }
}

function getIdFromUrl(url, fromEnd = 0) {
  const path = url.split('?')[0]
  const segments = path.split('/').filter(Boolean)
  return Number(segments[segments.length - 1 - fromEnd])
}

// 生成对话记录（含关键证据标记）
function buildDialogues(warning) {
  const evidenceKeyword = (warning.triggerKeywords && warning.triggerKeywords[0]) || '最近压力很大'
  return [
    { turnIndex: 1, role: 'student', contentType: 'text', timestamp: warning.createdAt, isContext: true, isEvidence: false, content: '老师在吗，我想找人聊聊。' },
    { turnIndex: 2, role: 'assistant', contentType: 'text', timestamp: warning.createdAt, isContext: true, isEvidence: false, content: '我在的，随时可以听你说。最近发生了什么吗?' },
    {
      turnIndex: 3, role: 'student', contentType: 'text', timestamp: warning.createdAt, isContext: false, isEvidence: true,
      content: `${evidenceKeyword}……我真的不知道该怎么办了。`,
      evidenceReason: `命中高风险关键词「${evidenceKeyword}」，结合上下文判定情绪状态显著异常。`
    },
    { turnIndex: 4, role: 'assistant', contentType: 'text', timestamp: warning.createdAt, isContext: false, isEvidence: false, content: '听到你这样我很担心你。你愿意多和我说说现在的感受吗?我会一直在这里。' },
    {
      turnIndex: 5, role: 'student', contentType: 'voice', timestamp: warning.createdAt, isContext: false, isEvidence: warning.riskLevel === 'P0' || warning.riskLevel === 'P1',
      content: '[语音转写] 我已经好几天没怎么睡了，脑子里一直在想这些事情，感觉撑不下去了。',
      evidenceReason: warning.riskLevel === 'P0' || warning.riskLevel === 'P1' ? '语音中表达持续失眠与情绪耗竭，风险程度升级。' : ''
    },
    { turnIndex: 6, role: 'assistant', contentType: 'text', timestamp: warning.createdAt, isContext: false, isEvidence: false, content: '谢谢你愿意告诉我这些。你并不孤单，我们一起想办法，好吗?' }
  ]
}

// 生成邮件发送日志（邮件状态仅 sent / failed 两态）
function buildEmailLogs(warning) {
  if (warning.emailSendStatus === 'sent') {
    return [{ attemptOrder: 1, sendTime: warning.createdAt, status: 'success', failureReason: '', retryAfterSeconds: null }]
  }
  if (warning.emailSendStatus === 'failed') {
    return [
      { attemptOrder: 1, sendTime: warning.createdAt, status: 'fail', failureReason: 'SMTP 连接超时 (timeout)', retryAfterSeconds: 60 },
      { attemptOrder: 2, sendTime: warning.createdAt, status: 'fail', failureReason: '收件人邮箱服务器拒绝 (550 Mailbox unavailable)', retryAfterSeconds: 300 }
    ]
  }
  return []
}

// ===== 路由定义（固定路径在前，:id 动态路径在后） =====
export default [
  // 统计数据（支持 period: 7 / 30 / 180 / all，默认 30）
  {
    url: '/api/psychological-warnings/stats',
    method: 'get',
    response: ({ query }) => {
      const period = String(query.period || '30')
      const stat = STATS_BY_PERIOD[period] || STATS_BY_PERIOD['30']
      return success({ period, ...stat })
    }
  },

  // 导出（返回 CSV 文本，前端以 Blob 下载）
  {
    url: '/api/psychological-warnings/export',
    method: 'get',
    rawResponse: async (req, res) => {
      const header = 'ID,学生姓名,学号,学院,风险等级,风险类型,触发方式,置信度,邮件状态,辅导员,研判时间\n'
      const rows = warnings.map(w =>
        [w.id, w.studentName, w.studentNumber, w.college, w.riskLevel, w.riskTypes.join('|'),
         w.triggerType === 'fast' ? '快路' : '慢路', w.confidence + '%', w.emailSendStatus, w.counselorName, w.createdAt].join(',')
      ).join('\n')
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      // 加 BOM 以便 Excel 正确识别中文
      res.end('﻿' + header + rows)
    }
  },

  // 批量标记已处理
  {
    url: '/api/psychological-warnings/batch-mark-handled',
    method: 'post',
    response: ({ body }) => {
      const { ids = [], handledBy = '', remark = '' } = body || {}
      const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      warnings.forEach(w => {
        if (ids.includes(w.id)) {
          w.handledAt = now
          w.handledBy = handledBy
          w.handledRemark = remark
        }
      })
      return success({ updated: ids.length })
    }
  },

  // 分页查询列表（正则确保仅匹配 /api/psychological-warnings 本身，不吃掉 /:id；
  // 末尾允许是 query string 或结束，兼容 dev 中间件和 prod 浏览器端两种 mock 机制）
  {
    url: /^\/api\/psychological-warnings(\?|$)/,
    method: 'get',
    response: ({ query }) => {
      const { page = 1, size = 10, riskLevel, riskTypes, emailStatus, triggerType, studentSearch, startTime, endTime } = query
      let filtered = [...warnings]
      if (riskLevel) filtered = filtered.filter(w => w.riskLevel === riskLevel)
      if (riskTypes) {
        const wanted = String(riskTypes).split(',').filter(Boolean)
        filtered = filtered.filter(w => w.riskTypes.some(t => wanted.includes(t)))
      }
      if (emailStatus) filtered = filtered.filter(w => w.emailSendStatus === emailStatus)
      if (triggerType) filtered = filtered.filter(w => w.triggerType === triggerType)
      if (studentSearch) {
        const kw = String(studentSearch).toLowerCase()
        filtered = filtered.filter(w => w.studentName.includes(studentSearch) || w.studentNumber.toLowerCase().includes(kw))
      }
      if (startTime) filtered = filtered.filter(w => w.createdAt >= startTime)
      if (endTime) filtered = filtered.filter(w => w.createdAt <= endTime)
      // 按研判时间倒序
      filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      return success(paginate(filtered, page, size))
    }
  },

  // 关联对话记录
  {
    url: '/api/psychological-warnings/:id/dialogues',
    method: 'get',
    response: ({ url }) => {
      const id = getIdFromUrl(url, 1)
      const warning = warnings.find(w => w.id === id)
      return success(warning ? buildDialogues(warning) : [])
    }
  },

  // 邮件发送日志
  {
    url: '/api/psychological-warnings/:id/email-logs',
    method: 'get',
    response: ({ url }) => {
      const id = getIdFromUrl(url, 1)
      const warning = warnings.find(w => w.id === id)
      return success(warning ? buildEmailLogs(warning) : [])
    }
  },

  // 重新发送邮件
  {
    url: '/api/psychological-warnings/:id/resend-email',
    method: 'post',
    response: ({ url }) => {
      const id = getIdFromUrl(url, 1)
      const warning = warnings.find(w => w.id === id)
      if (warning) warning.emailSendStatus = 'sent'
      return success({ id, emailSendStatus: 'sent' })
    }
  },

  // 标记已处理
  {
    url: '/api/psychological-warnings/:id/mark-handled',
    method: 'put',
    response: ({ url, body }) => {
      const id = getIdFromUrl(url, 1)
      const warning = warnings.find(w => w.id === id)
      const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      if (warning) {
        warning.handledAt = now
        warning.handledBy = body?.handledBy || ''
        warning.handledRemark = body?.remark || ''
      }
      return success(warning)
    }
  },

  // 详情（:id 放在最后，避免误吞固定路径）
  {
    url: '/api/psychological-warnings/:id',
    method: 'get',
    response: ({ url }) => {
      const id = getIdFromUrl(url, 0)
      const warning = warnings.find(w => w.id === id)
      return success(warning || null)
    }
  }
]
