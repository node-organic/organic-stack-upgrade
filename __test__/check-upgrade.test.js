const StackUpgrade = require('../index')
const path = require('path')
const os = require('os')

test('StackUpgrade.checkUpgrade', async () => {
  const DEST_DIR = path.join(os.tmpdir(), 'test-exec' + Math.random())
  const stack = new StackUpgrade({
    name: 'test',
    version: '1.0.0',
    destDir: DEST_DIR
  })
  await stack.ensureDestDir()
  await stack.updateJSON()
  expect(await stack.checkUpgrade('test', '^1.0.0')).toBe(true)
  expect(await stack.checkUpgrade('test', '^2.0.0')).toBe(false)
})
