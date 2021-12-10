const deepMergeFile = require('../lib/deep-merge-file')
const path = require('path')
const fs = require('fs')
const os = require('os')
const StackUpgrade = require('../index')

const fileExists = async function (filepath) {
  return new Promise((resolve, reject) => {
    fs.stat(filepath, (err, stats) => {
      if (err) return reject(err)
      resolve(true)
    })
  })
}

test('deepMergeFile', async () => {
  const DEST_DIR = path.join(os.tmpdir(), 'test-exec' + Math.random())
  const stack = new StackUpgrade({
    destDir: DEST_DIR
  })
  await stack.ensureDestDir()
  return new Promise((resolve, reject) => {
    deepMergeFile({
      templatesRoot: path.join(__dirname, 'seed'),
      file: {
        path: path.join(__dirname, 'seed', 'gitignore')
      },
      destRoot: DEST_DIR
    }, async function (err) {
      if (err) return reject(err)
      expect(await fileExists(path.join(DEST_DIR, '.gitignore'))).toBe(true)
      resolve()
    })
  })
})
