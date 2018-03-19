const readFile = require('util').promisify(require('fs').readFile)
const writeFile = require('util').promisify(require('fs').writeFile)

module.exports.readjson = async function (filepath) {
  let json = await readFile(filepath)
  return JSON.parse(json.toString())
}

module.exports.writejson = async function (filepath, json) {
  return writeFile(filepath, JSON.stringify(json, null, 2))
}
