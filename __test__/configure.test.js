const StackUpgrade = require('../index')
const path = require('path')
const os = require('os')

test('configure', async () => {
  let DEST_DIR = path.join(os.tmpdir(), 'test-exec' + Math.random())
  let stack = new StackUpgrade({
    name: 'test',
    version: '1.0.0',
    destDir: DEST_DIR
  })
  let resulted_answers = await stack.configure({
    sourceDirs: [path.join(__dirname, 'seed')],
    answers: {
      'content-placeholder': 'test',
      'file-placeholder': 'test',
      'folder-placeholder': 'test'
    }
  })
  expect(resulted_answers['content-placeholder']).toBe('test')
  expect(resulted_answers['file-placeholder']).toBe('test')
  expect(resulted_answers['folder-placeholder']).toBe('test')
})

xtest('ask', () => {
  // TODO execute a stackUpgrade with `ask` implementation and simulate input
})
