const StackUpgrade = require('../index')
const path = require('path')
const os = require('os')
const { readjson } = require('../lib/json')

test('StackUpgrade.updateJSON', async () => {
  const DEST_DIR = path.join(os.tmpdir(), 'test-exec' + Math.random())
  const stack = new StackUpgrade({
    packagejson: path.join(__dirname, 'packagejson'),
    destDir: DEST_DIR
  })
  await stack.ensureDestDir()
  await stack.updateJSON()
  const result = await readjson(path.join(DEST_DIR, 'package.json'))
  expect(result.stackUpgrades.test).toBe('1.0.0')
})
