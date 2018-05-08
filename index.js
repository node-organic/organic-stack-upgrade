const path = require('path')
const shellExec = require('child_process').exec
const intersects = require('semver').intersects
const mergeDirectory = require('./lib/merge-directory')
const {
  collectPlaceholders,
  collectAnswers,
} = require('./lib/placeholders')
const {
  readjson,
  writejson
} = require('./lib/json')
const mkdirp = require('mkdirp')

module.exports = class StackUpgrade {
  constructor ({destDir = process.cwd(), name, version}) {
    this.destDir = destDir
    this.name = name
    this.version = version
  }
  async ensureDestDir () {
    return new Promise((resolve, reject) => {
      mkdirp(this.destDir, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
  async configure ({sourceDir, answers}) {
    let placeholders = await collectPlaceholders({sourceDir})
    // figure out placeholders which has already answers provided
    let result_answers = Object.assign({}, answers)
    for (let i = 0; i < placeholders.length; i++) {
      if (result_answers[placeholders[i]]) {
        placeholders.splice(i, 1)
        i -= 1
      }
    }
    // ask only for answers about missing placeholders if any
    if (placeholders.length) {
      Object.assign(result_answers, await collectAnswers({placeholders}))
    }
    return result_answers
  }
  async merge ({sourceDir, answers, forceOverride}) {
    let destDir = this.destDir
    await mergeDirectory({sourceDir, destDir, answers, forceOverride})
  }
  async configureAndMerge ({sourceDir, answers, forceOverride}) {
    let resulted_answers = await this.configure({sourceDir, answers})
    await this.merge({sourceDir, answers: resulted_answers, forceOverride})
    return resulted_answers
  }
  async updateJSON () {
    let jsonfilepath = path.join(this.destDir, 'package.json')
    let json
    try {
      json = await readjson(jsonfilepath)
    } catch (e) {
      json = {} // ignore any errors
    }
    json['stackUpgrades'] = json['stackUpgrades'] || {}
    json['stackUpgrades'][this.name] = this.version
    return writejson(jsonfilepath, json)
  }
  async configureMergeAndUpdateJSON ({sourceDir, answers, forceOverride}) {
    let resulted_answers = await this.configureAndMerge({sourceDir, answers, forceOverride})
    await this.updateJSON()
    return resulted_answers
  }
  async checkUpgrade (name, version) {
    let jsonfilepath = path.join(this.destDir, 'package.json')
    let destJson = await readjson(jsonfilepath)
    let destVersion = destJson['stackUpgrades'][name]
    if (!destVersion) return false
    return intersects(version, destVersion)
  }
  async exec (cmd) {
    await this.ensureDestDir()
    return new Promise((resolve, reject) => {
      console.log('exec', this.destDir, cmd)
      let child = shellExec(cmd, {
        cwd: this.destDir,
        env: process.env
      })
      child.stdout.on('data', chunk => console.log(chunk.toString()))
      child.stderr.on('data', chunk => console.log(chunk.toString()))
      child.on('close', (status) => {
        if (status === 0) return resolve()
        reject(status)
      })
    })
  }
}
