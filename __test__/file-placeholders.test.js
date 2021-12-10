const { collectPlaceholders } = require('../lib/placeholders')
const path = require('path')

test('resolves placeholders from file tree', async () => {
  const placeholders = await collectPlaceholders({
    sourceDir: path.join(__dirname, 'seed')
  })
  expect(placeholders.length).toBe(3)
})
