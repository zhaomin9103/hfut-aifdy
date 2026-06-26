import Mock from 'mockjs'

// 辅助函数：生成分类趋势数据
function generateCategoryTrend(days) {
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    result.push({
      date: date.toISOString().split('T')[0],
      violence: Mock.Random.integer(10, 25),
      politics: Mock.Random.integer(8, 20),
      pornography: Mock.Random.integer(5, 15),
      privacy: Mock.Random.integer(3, 12),
      illegal: Mock.Random.integer(2, 10),
      rumor: Mock.Random.integer(1, 8)
    })
  }
  return result
}

// 辅助函数：生成 Controversial 趋势数据
function generateControversialTrend(days) {
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    result.push({
      date: date.toISOString().split('T')[0],
      count: Mock.Random.integer(15, 40)
    })
  }
  return result
}

export default [
  {
    url: '/api/risk-interception/stats',
    method: 'get',
    response: ({ query }) => {
      const { period = '7' } = query

      // 根据 period 生成不同数量的趋势数据点
      const daysCount = period === '7' ? 7 : period === '30' ? 30 : period === '180' ? 180 : 365

      return {
        code: 0,
        message: '成功',
        data: {
          overview: {
            totalRequests: Mock.Random.integer(8000, 12000),
            blockedCount: Mock.Random.integer(1000, 1500),
            blockRate: '12.5%',
            inputBlockCount: Mock.Random.integer(400, 600),
            outputBlockCount: Mock.Random.integer(600, 900),
            safeCount: Mock.Random.integer(4000, 5000),
            unsafeCount: Mock.Random.integer(3000, 4000),
            controversialCount: Mock.Random.integer(800, 1200)
          },

          categoryDistribution: [
            { category: 'violence', name: '暴力', count: 120 },
            { category: 'politics', name: '政治敏感', count: 85 },
            { category: 'pornography', name: '色情', count: 60 },
            { category: 'privacy', name: '隐私泄露', count: 45 },
            { category: 'illegal', name: '违法犯罪', count: 38 },
            { category: 'rumor', name: '虚假信息', count: 25 }
          ],

          categoryTrend: generateCategoryTrend(daysCount),

          topUsers: Mock.mock({
            'list|10': [{
              'userId': '@id',
              'username': '@cname',
              'blockCount|10-50': 1,
              'lastBlockTime': '@datetime("yyyy-MM-dd HH:mm:ss")'
            }]
          }).list.sort((a, b) => b.blockCount - a.blockCount),

          controversialData: {
            distribution: [
              { category: 'violence', name: '暴力', count: 30 },
              { category: 'politics', name: '政治敏感', count: 25 },
              { category: 'pornography', name: '色情', count: 18 },
              { category: 'privacy', name: '隐私泄露', count: 12 }
            ],
            trend: generateControversialTrend(daysCount)
          }
        }
      }
    }
  }
]
