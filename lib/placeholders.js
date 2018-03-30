const fs = require('fs')
const path = require('path')

const async = require('async')
const glob = require('glob-stream')
const arrayUniq = require('array-uniq')
const inquirer = require('inquirer')

module.exports.collectPlaceholders = async function ({sourceDir}) {
  return new Promise((resolve, reject) => {
    let files = []
    glob([path.join(sourceDir, '**/*.*'), '!node_modules/**', '!build/**', '!.git/**'])
      .on('data', function (file) {
        files.push(file.path)
      })
      .on('end', function () {
        scanPlaceholders(files, function (err, placeholders, filesWithPlaceholders) {
          if (err) return reject(err)
          resolve(placeholders)
        })
      })
  }).then((placeholders) => {
    return new Promise((resolve, reject) => {
      let entrypaths = []
      glob([path.join(sourceDir, '**'), '!node_modules/**', '!build/**', '!.git/**'])
        .on('data', function (entry) {
          if (/\{\{\{([\w\s-]+)\}\}\}/.test(entry.path)) {
            let results = getPlaceholders(entry.path)
            entrypaths = entrypaths.concat(results)
          }
        })
        .on('end', function () {
          resolve(arrayUniq(placeholders.concat(entrypaths)))
        })
    })
  })
}

module.exports.collectAnswers = async function ({placeholders}) {
  return inquirer.prompt(createAnswers(placeholders))
}

// borrowed from http://stackoverflow.com/questions/11222406/how-to-get-placeholder-from-string-in-javascript
const getPlaceholders = function (str) {
  let regexp = /\{\{\{([\w\s-]+)\}\}\}/g
  let result = []
  let match = regexp.exec(str)
  while (match) {
    result.push(match[1])
    match = regexp.exec(str)
  }
  return result
}

const scanPlaceholders = function (files, done) {
  let results = []
  let filesWithPlaceholders = []
  async.eachSeries(files, function (file, nextFile) {
    fs.readFile(file, function (err, content) {
      if (err) return nextFile(err)
      content = content.toString()
      if (/\{\{\{([\w\s-]+)\}\}\}/.test(content)) {
        filesWithPlaceholders.push(file)
        results = results.concat(getPlaceholders(content))
      }
      nextFile()
    })
  }, function (err) {
    if (err) return done(err)
    done(null, arrayUniq(results), filesWithPlaceholders)
  })
}

const createAnswers = function (placeholders) {
  return placeholders.map(function (p) {
    return {
      type: 'input',
      name: p,
      message: p
    }
  })
}
