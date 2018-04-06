const StackUpgrade = require('../index')
const path = require('path')
const os = require('os')

test('StackUpgrade.exec', async () => {
  let DEST_DIR = path.join(os.tmpdir(), 'test-exec' + Math.random())
  let stack = new StackUpgrade({
    name: 'test',
    version: '1.0.0',
    destDir: DEST_DIR
  })
  await stack.exec('echo test')
  await stack.exec('echo test 2')
})
