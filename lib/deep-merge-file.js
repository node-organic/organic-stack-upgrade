const merge = require('merge-util')
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')

const format = function (str, data) {
  let result = str
  for (let key in data) {
    result = result.replace(new RegExp('{{{' + key + '}}}', 'g'), data[key])
  }
  return result
}

module.exports = function ({templatesRoot, file, destRoot, answers = {}}, doneHook) {
  var sourcePath = file.path
  var destPath = path.join(destRoot, sourcePath.replace(templatesRoot, ''))
  // reformat destination destPath
  // from `{{{variable}}}.json` => `variableValue.json`
  destPath = format(destPath, answers)
  if (path.extname(sourcePath) === '.json') {
    fs.readFile(sourcePath, function (err, sourceData) {
      if (err) {
        console.error('failed to read source', sourcePath, err)
        return doneHook(err)
      }
      sourceData = format(sourceData.toString(), answers)
      // reformat sourceData **before** parsing it as JSON
      // resolves issues when having json as `{ "key": {{{numberVariable}}} }`
      sourceData = JSON.parse(sourceData)
      fs.readFile(destPath, function (err, destData) {
        if (err) {
          // we do not care about missing destination, it will be created
        }
        if (destData) {
          try {
            destData = JSON.parse(destData.toString())
          } catch (e) {
            throw new Error('failed to parse json ' + destPath)
          }
        } else {
          destData = {}
        }
        if (typeof sourceData !== 'object') {
          destData = sourceData
        } else {
          merge(destData, sourceData)
        }
        fse.ensureFile(destPath, function (err) {
          if (err) {
            console.error('failed to ensure file', destPath, err)
            return doneHook(err)
          }
          fs.writeFile(destPath, JSON.stringify(destData, null, 2), function (err) {
            if (err) {
              console.error('failed to write: ', destPath, err)
            } else {
              console.log('wrote: ', destPath.replace(destRoot, ''))
            }
            doneHook(err)
          })
        })
      })
    })
  } else
  // files ['.gitignore', 'gitignore'] are processed exclusively
  if (sourcePath.indexOf('.gitignore') > -1 || sourcePath.indexOf('gitignore') > -1) {
    // writing output file name always as '.gitignore'
    if (destPath.indexOf('.gitignore') === -1) {
      destPath = destPath.replace('gitignore', '.gitignore')
    }
    fs.readFile(sourcePath, function (err, sourceData) {
      if (err) {
        console.error('failed to read source', sourcePath, err)
        return doneHook(err)
      }
      // reformat sourceData
      sourceData = format(sourceData.toString(), answers)
      fse.ensureFile(destPath, function (err) {
        if (err) {
          console.error('failed to ensure file', destPath, err)
          return doneHook(err)
        }
        fs.readFile(destPath, function (err, destData) {
          if (err) {
            // we do not care about missing destination, it will be created
          }
          var sourceLines = sourceData.toString().split('\n')
          var destLines = destData.toString().split('\n')
          sourceLines.forEach(function (line) {
            if (destLines.indexOf(line) === -1) {
              destLines.push(line)
            }
          })
          fs.writeFile(destPath, destLines.join('\n'), function (err) {
            if (err) {
              console.error('failed to append: ', sourcePath, '->', destPath, err)
            } else {
              console.log('wrote: ', destPath.replace(destRoot, ''))
            }
            doneHook()
          })
        })
      })
    })
  } else {
    fs.readFile(sourcePath, function (err, data) {
      if (err) {
        console.error('failed to read: ', sourcePath)
        return doneHook(err)
      }
      // reformat data only when it is text
      if (require('istextorbinary').isTextSync(sourcePath, data)) {
        data = format(data.toString(), answers)
      }
      fse.ensureFile(destPath, function (err) {
        if (err) {
          console.error('failed to ensure file', destPath, err)
          return doneHook(err)
        }
        fs.writeFile(destPath, data, function (err) {
          if (err) {
            console.error('failed to copy over: ', sourcePath, '->', destPath, err)
          } else {
            console.log('wrote: ', destPath.replace(destRoot, ''))
          }
          doneHook(file)
        })
      })
    })
  }
}
