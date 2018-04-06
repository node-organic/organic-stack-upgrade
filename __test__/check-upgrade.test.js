const StackUpgrade = require('../index')
const path = require('path')
const os = require('os')

test('StackUpgrade.checkUpgrade', async () => {
  let DEST_DIR = path.join(os.tmpdir(), 'test-exec' + Math.random())
  let stack = new StackUpgrade({
    name: 'test',
    version: '1.0.0',
    destDir: DEST_DIR
  })
  await stack.configureMergeAndUpdateJSON({
    sourceDir: path.join(__dirname, 'seed'),
    answers: {
      'content-placeholder': 'test',
      'file-placeholder': 'test',
      'folder-placeholder': 'test'
    }
  })
  expect(await stack.checkUpgrade('test', '^1.0.0')).toBe(true)
  expect(await stack.checkUpgrade('test', '^2.0.0')).toBe(false)
})
