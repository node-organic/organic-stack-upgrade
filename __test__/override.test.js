const StackUpgrade = require('../index')
const path = require('path')
const os = require('os')
const writeFile = require('util').promisify(require('fs').writeFile)

test('override + forceOverride', async () => {
  let DEST_DIR = path.join(os.tmpdir(), 'test-override' + Math.random())
  let stack = new StackUpgrade({
    name: 'test',
    version: '1.0.0',
    destDir: DEST_DIR
  })
  await stack.ensureDestDir()
  await writeFile(path.join(DEST_DIR, 'afile'), '')
  try {
    await stack.merge({
      sourceDir: path.join(__dirname, 'seed'),
      answers: {
        'content-placeholder': 'test',
        'file-placeholder': 'test',
        'folder-placeholder': 'test'
      }
    })
  } catch (e) {
    expect(e.message).toBe('destination file exists')
  }
  await stack.merge({
    sourceDir: path.join(__dirname, 'seed'),
    answers: {
      'content-placeholder': 'test',
      'file-placeholder': 'test',
      'folder-placeholder': 'test'
    },
    forceOverride: true
  })
})
