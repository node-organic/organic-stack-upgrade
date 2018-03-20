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
  async configure ({sourceDir, answers}) {
    let placeholders = await collectPlaceholders({sourceDir})
    // figure out placeholders which has already answers provided
    let result = Object.assign({}, answers)
    for (let i = 0; i < placeholders.length; i++) {
      if (result[placeholders[i]]) {
        placeholders.splice(i, 1)
        i -= 1
      }
    }
    // ask only for answers about missing placeholders if any
    if (placeholders.length) {
      Object.assign(result, collectAnswers({placeholders}))
    }
    return result
  }
  async merge ({sourceDir, answers = {}}) {
    let destDir = this.destDir
    await mergeDirectory({sourceDir, destDir, answers})
  }
  async configureAndMerge ({sourceDir, providedAnswers}) {
    let answers = await this.configure({sourceDir, answers: providedAnswers})
    return this.merge({sourceDir, answers})
  }
  async updateJSON () {
    let jsonfilepath = path.join(this.destDir, 'package.json')
    let json = await readjson(jsonfilepath)
    json['stackUpgrades'] = json['stackUpgrades'] || {}
    json['stackUpgrades'][this.name] = this.version
    return writejson(jsonfilepath, json)
  }
  async configureMergeAndUpdateJSON ({sourceDir, answers}) {
    await this.configureAndMerge({sourceDir, answers})
    await this.updateJSON()
  }
}
