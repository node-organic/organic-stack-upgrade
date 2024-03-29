const StackUpgrade = require('../index')
const path = require('path')
const os = require('os')

test('StackUpgrade.exec', async () => {
  const DEST_DIR = path.join(os.tmpdir(), 'test-exec' + Math.random())
  const stack = new StackUpgrade({
    name: 'test',
    version: '1.0.0',
    destDir: DEST_DIR
  })
  await stack.exec('echo test')
  await stack.exec('echo test 2')
})
