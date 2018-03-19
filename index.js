const path = require('path')
const mergeDirectory = require('./lib/merge-directory')
const {
  collectPlaceholders,
  collectAnswers,
} = require('./lib/placeholders')
const {
  readjson,
  writejson
} = require('./lib/json')

module.exports = class StackUpgrade {
  constructor ({destDir = process.cwd(), name, version}) {
    this.destDir = destDir
    this.name = name
    this.version = version
  }
  async configure ({sourceDir}) {
    let placeholders = await collectPlaceholders({sourceDir})
    return collectAnswers({placeholders})
  }
  async merge ({sourceDir, answers = {}}) {
    let destDir = this.destDir
    await mergeDirectory({sourceDir, destDir, answers})
  }
  async configureAndMerge ({sourceDir}) {
    let answers = await this.configure({sourceDir})
    return this.merge({sourceDir, answers})
  }
  async updateJSON () {
    let jsonfilepath = path.join(this.destDir, 'package.json')
    let json = await readjson(jsonfilepath)
    json['stackUpgrades'] = json['stackUpgrades'] || {}
    json['stackUpgrades'][this.name] = this.version
    return writejson(jsonfilepath, json)
  }
  async configureMergeAndUpdateJSON ({sourceDir}) {
    await this.configureAndMerge({sourceDir})
    await this.updateJSON()
  }
}
