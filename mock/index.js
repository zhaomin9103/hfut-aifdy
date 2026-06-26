/**
 * Mock HTTP 拦截处理器
 * 返回格式统一为：{ code: 0, message: 'ok', data: ... }
 */

import riskInterception from './riskInterception'

// ===== Mock 数据源（从 src/mock/data.js 迁移） =====
let agents = [
  { id: 1, name: '学业辅导助手', link: 'https://ai.example.com/agent/1', category: '学业辅导', status: 'active', sortOrder: 1 },
  { id: 2, name: '就业指导顾问', link: 'https://ai.example.com/agent/2', category: '就业指导', status: 'active', sortOrder: 2 },
  { id: 3, name: '心理咨询师', link: 'https://ai.example.com/agent/3', category: '心理支持', status: 'inactive', sortOrder: 3 },
  { id: 4, name: '宿舍生活助手', link: 'https://ai.example.com/agent/4', category: '生活服务', status: 'active', sortOrder: 4 },
  { id: 5, name: '科研创新导师', link: 'https://ai.example.com/agent/5', category: '科研创新', status: 'active', sortOrder: 5 }
]

let categories = [
  { id: 1, name: '学业辅导', sortOrder: 1 },
  { id: 2, name: '就业指导', sortOrder: 2 },
  { id: 3, name: '心理支持', sortOrder: 3 },
  { id: 4, name: '生活服务', sortOrder: 4 },
  { id: 5, name: '科研创新', sortOrder: 5 }
]

let quickQuestions = [
  { id: 1, title: '期末考试安排', agentId: 1, agentName: '学业辅导助手', useCount: 1280, createTime: '2026-05-01 10:00:00' },
  { id: 2, title: '简历怎么写', agentId: 2, agentName: '就业指导顾问', useCount: 960, createTime: '2026-05-02 10:00:00' },
  { id: 3, title: '如何缓解焦虑', agentId: 3, agentName: '心理咨询师', useCount: 750, createTime: '2026-05-03 10:00:00' },
  { id: 4, title: '宿舍报修流程', agentId: 4, agentName: '宿舍生活助手', useCount: 520, createTime: '2026-05-04 10:00:00' },
  { id: 5, title: '大创项目申报', agentId: 5, agentName: '科研创新导师', useCount: 180, createTime: '2026-05-05 10:00:00' },
  { id: 6, title: '四六级备考', agentId: 1, agentName: '学业辅导助手', useCount: 890, createTime: '2026-05-06 10:00:00' }
]

let feedbackRecords = [
  { id: 1, userId: 'U10001', userName: '张三', type: '反馈', content: 'AI回答的内容不太准确,比如课程安排的问题,它给的时间是错的,而且也没有提到考试地点的信息,希望改进回答的准确性。', agentName: '学业辅导助手', status: 'pending', createTime: '2026-05-21 14:30:00', handledBy: '', handledRemark: '', handledTime: '', images: ['https://picsum.photos/400/300?random=1', 'https://picsum.photos/400/300?random=2'] },
  { id: 2, userId: 'U10002', userName: '李四', type: '反馈', content: '回复内容显示不完整,截断了', agentName: '就业指导顾问', status: 'processed', createTime: '2026-05-20 10:00:00', handledBy: '系统管理员', handledRemark: '已定位为前端文本截断问题,已修复并发布,回复内容现可完整展示。', handledTime: '2026-05-20 15:20:00', images: [] },
  { id: 3, userId: 'U10003', userName: '王五', type: '建议', content: '建议增加语音输入功能,这样在上课的时候可以用语音提问,不用手动打字,会方便很多。', agentName: '科研创新导师', status: 'pending', createTime: '2026-05-19 16:00:00', handledBy: '', handledRemark: '', handledTime: '', images: [] },
  { id: 4, userId: 'U10004', userName: '赵六', type: '建议', content: '关于宿舍报修的流程说明很详细,很有帮助,希望能增加更多生活类问题的回答。', agentName: '宿舍生活助手', status: 'processed', createTime: '2026-05-18 09:00:00', handledBy: '王敏', handledRemark: '感谢反馈,已将生活服务类知识库扩充,新增报修、水电、网络等高频问题。', handledTime: '2026-05-18 17:45:00', images: ['https://picsum.photos/400/300?random=3'] },
  { id: 5, userId: 'U10005', userName: '孙七', type: '反馈', content: 'AI给出的建议有点不靠谱,心理咨询方面的问题它给了很官方的回答,没有真正解决我的困惑。', agentName: '心理咨询师', status: 'pending', createTime: '2026-05-17 11:00:00', handledBy: '', handledRemark: '', handledTime: '', images: [] },
  { id: 6, userId: 'U10006', userName: '周八', type: '反馈', content: '上传图片后没有响应,页面卡住了,刷新后图片也丢了', agentName: '学业辅导助手', status: 'processed', createTime: '2026-05-16 15:00:00', handledBy: '系统管理员', handledRemark: '复现为大图上传超时导致,已优化压缩与超时重试逻辑,问题不再出现。', handledTime: '2026-05-16 18:10:00', images: ['https://picsum.photos/400/300?random=4', 'https://picsum.photos/400/300?random=5', 'https://picsum.photos/400/300?random=6'] },
  { id: 7, userId: 'U10007', userName: '吴九', type: '建议', content: '希望能有学习计划生成功能,根据我的课程表和考试日期自动生成复习计划。', agentName: '学业辅导助手', status: 'pending', createTime: '2026-05-15 08:00:00', handledBy: '', handledRemark: '', handledTime: '', images: [] },
  { id: 8, userId: 'U10008', userName: '郑十', type: '反馈', content: '智能体回复速度有点慢,经常要等十几秒才能看到回复', agentName: '就业指导顾问', status: 'pending', createTime: '2026-05-14 09:30:00', handledBy: '', handledRemark: '', handledTime: '', images: ['https://picsum.photos/400/300?random=7'] },
  { id: 9, userId: 'U10001', userName: '张三', type: '建议', content: '希望能给智能体添加个性化设置,比如允许我自定义智能体的回答风格', agentName: '科研创新导师', status: 'processed', createTime: '2026-05-13 14:00:00', handledBy: '李国强', handledRemark: '已纳入产品规划,个性化回答风格设置预计下个迭代上线。', handledTime: '2026-05-13 16:30:00', images: [] },
  { id: 10, userId: 'U10009', userName: '钱一', type: '反馈', content: '回答中提到的图书馆开放时间不准确,已经更新了但AI还在说旧的信息', agentName: '学业辅导助手', status: 'processed', createTime: '2026-05-12 11:00:00', handledBy: '系统管理员', handledRemark: '已同步最新图书馆开放时间至知识库,并清理旧缓存。', handledTime: '2026-05-12 14:00:00', images: [] }
]

// 工具：模拟分页
function paginate(list, page, size) {
  const start = (page - 1) * size
  return {
    list: list.slice(start, start + size),
    total: list.length,
    page: Number(page),
    size: Number(size)
  }
}

// 工具：统一成功响应
function success(data) {
  return { code: 0, message: 'ok', data }
}

// ===== Mock 路由定义 =====
export default [
  // ---------- 智能体管理 ----------
  {
    url: '/api/agents',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, size = 10, category, name } = query
      let filtered = agents
      if (category) filtered = filtered.filter(a => a.category === category)
      if (name) filtered = filtered.filter(a => a.name.includes(name))
      filtered.sort((a, b) => a.sortOrder - b.sortOrder)
      return success(paginate(filtered, page, size))
    }
  },
  {
    url: '/api/agents',
    method: 'post',
    response: ({ body }) => {
      const newAgent = { id: Date.now(), status: 'active', sortOrder: agents.length, ...body }
      agents.push(newAgent)
      return success(newAgent)
    }
  },
  {
    url: '/api/agents/:id',
    method: 'put',
    response: ({ body, url }) => {
      const id = Number(url.split('/').pop())
      const agent = agents.find(a => a.id === id)
      if (agent) Object.assign(agent, body)
      return success(agent)
    }
  },
  {
    url: '/api/agents/:id',
    method: 'delete',
    response: ({ url }) => {
      const id = Number(url.split('/').pop())
      agents = agents.filter(a => a.id !== id)
      return success(null)
    }
  },

  // ---------- 分类管理 ----------
  {
    url: '/api/categories',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, size = 10, name } = query
      let filtered = categories
      if (name) filtered = filtered.filter(c => c.name.includes(name))
      filtered.sort((a, b) => a.sortOrder - b.sortOrder)
      return success(paginate(filtered, page, size))
    }
  },
  {
    url: '/api/categories',
    method: 'post',
    response: ({ body }) => {
      const newCategory = { id: Date.now(), sortOrder: categories.length, ...body }
      categories.push(newCategory)
      return success(newCategory)
    }
  },
  {
    url: '/api/categories/:id',
    method: 'put',
    response: ({ body, url }) => {
      const id = Number(url.split('/').pop())
      const category = categories.find(c => c.id === id)
      if (category) Object.assign(category, body)
      return success(category)
    }
  },
  {
    url: '/api/categories/:id',
    method: 'delete',
    response: ({ url }) => {
      const id = Number(url.split('/').pop())
      categories = categories.filter(c => c.id !== id)
      return success(null)
    }
  },

  // ---------- 快捷问题配置 ----------
  {
    url: '/api/quick-questions',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, size = 10, title } = query
      let filtered = quickQuestions
      if (title) filtered = filtered.filter(q => q.title.includes(title))
      return success(paginate(filtered, page, size))
    }
  },
  {
    url: '/api/quick-questions',
    method: 'post',
    response: ({ body }) => {
      const agent = agents.find(a => a.id === body.agentId)
      const newQuestion = {
        id: Date.now(),
        agentName: agent?.name || '',
        useCount: 0,
        createTime: new Date().toLocaleString(),
        ...body
      }
      quickQuestions.push(newQuestion)
      return success(newQuestion)
    }
  },
  {
    url: '/api/quick-questions/:id',
    method: 'put',
    response: ({ body, url }) => {
      const id = Number(url.split('/').pop())
      const question = quickQuestions.find(q => q.id === id)
      if (question) {
        Object.assign(question, body)
        if (body.agentId) {
          const agent = agents.find(a => a.id === body.agentId)
          question.agentName = agent?.name || ''
        }
      }
      return success(question)
    }
  },
  {
    url: '/api/quick-questions/:id',
    method: 'delete',
    response: ({ url }) => {
      const id = Number(url.split('/').pop())
      quickQuestions = quickQuestions.filter(q => q.id !== id)
      return success(null)
    }
  },

  // ---------- 反馈记录 ----------
  {
    url: '/api/feedback-records/stats',
    method: 'get',
    response: () => {
      const total = feedbackRecords.length
      const typeCounts = feedbackRecords.reduce((acc, f) => {
        acc[f.type] = (acc[f.type] || 0) + 1
        return acc
      }, {})
      const pendingCount = feedbackRecords.filter(f => f.status === 'pending').length
      const processedCount = total - pendingCount
      // 各类型占比（百分比，保留 1 位小数）
      const typeStats = Object.keys(typeCounts).map(type => ({
        type,
        count: typeCounts[type],
        percent: total ? Number(((typeCounts[type] / total) * 100).toFixed(1)) : 0
      }))
      return success({ total, pendingCount, processedCount, typeStats })
    }
  },
  {
    url: '/api/feedback-records',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, size = 10, userSearch, type, status } = query
      let filtered = feedbackRecords
      if (userSearch) {
        const keyword = userSearch.toLowerCase()
        filtered = filtered.filter(f => f.userName.includes(userSearch) || f.userId.toLowerCase().includes(keyword))
      }
      if (type) filtered = filtered.filter(f => f.type === type)
      if (status) filtered = filtered.filter(f => f.status === status)
      return success(paginate(filtered, page, size))
    }
  },
  {
    url: '/api/feedback-records/:id/status',
    method: 'put',
    response: ({ body, url }) => {
      const id = Number(url.split('/')[3])
      const feedback = feedbackRecords.find(f => f.id === id)
      if (feedback) {
        feedback.status = body.status
        if (body.status === 'processed') {
          feedback.handledBy = body.handledBy || ''
          feedback.handledRemark = body.handledRemark || ''
          feedback.handledTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
        }
      }
      return success(feedback)
    }
  },

  // ---------- 风险拦截记录 ----------
  ...riskInterception
]
