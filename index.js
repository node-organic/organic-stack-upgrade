const path = require('path')
const shellExec = require('child_process').exec
const intersects = require('semver').intersects
const mergeDirectory = require('./lib/merge-directory')
const {
  collectPlaceholders,
  collectAnswers,
  collectAnswer
} = require('./lib/placeholders')
const {
  readjson,
  writejson
} = require('./lib/json')
const mkdirp = require('mkdirp')
const { forEach } = require('p-iteration')

module.exports = class StackUpgrade {
  constructor ({ destDir = process.cwd(), name, version, packagejson }) {
    this.destDir = destDir
    this.name = name
    this.version = version
    this.packagejson = packagejson
  }

  async ensureDestDir () {
    return mkdirp(this.destDir)
  }

  async ask (question, defaultValue) {
    return collectAnswer({ question, variableName: 'ask', defaultValue })
  }

  async configure ({ sourceDirs, answers }) {
    let placeholders = []
    await forEach(sourceDirs, async (value) => {
      const p = await collectPlaceholders({ sourceDir: value })
      placeholders = placeholders.concat(p)
    })
    // figure out placeholders which has already answers provided
    const result_answers = Object.assign({}, answers)
    for (let i = 0; i < placeholders.length; i++) {
      if (result_answers[placeholders[i]]) {
        placeholders.splice(i, 1)
        i -= 1
      }
    }
    // ask only for answers about missing placeholders if any
    if (placeholders.length) {
      Object.assign(result_answers, await collectAnswers({ placeholders }))
    }
    return result_answers
  }

  async merge ({ sourceDir, answers, forceOverride, destSubDir }) {
    let destDir = this.destDir
    if (destSubDir) {
      destDir = path.join(destDir, destSubDir)
    }
    await mergeDirectory({ sourceDir, destDir, answers, forceOverride })
  }

  async updateJSON () {
    const jsonfilepath = path.join(this.destDir, 'package.json')
    let json
    try {
      json = await readjson(jsonfilepath)
    } catch (e) {
      json = {} // ignore any errors
    }
    let name = this.name
    let version = this.version
    if (this.packagejson) {
      const packagejson = await readjson(this.packagejson)
      name = packagejson.name
      version = packagejson.version
    }
    json.stackUpgrades = json.stackUpgrades || {}
    json.stackUpgrades[name] = version
    return writejson(jsonfilepath, json)
  }

  async checkUpgrade (name, version) {
    const jsonfilepath = path.join(this.destDir, 'package.json')
    const destJson = await readjson(jsonfilepath)
    const destVersion = destJson.stackUpgrades[name]
    if (!destVersion) return false
    return intersects(version, destVersion)
  }

  async exec (cmd) {
    await this.ensureDestDir()
    return new Promise((resolve, reject) => {
      console.log('exec', this.destDir, cmd)
      const child = shellExec(cmd, {
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
