const deepMergeFile = require('./deep-merge-file')
const glob = require('glob-stream')
const fs = require('fs')

module.exports = async function ({sourceDir, destDir, answers}) {
  return new Promise((resolve, reject) => {
    let filesToProcess = 0
    let onFileDone = function () {
      filesToProcess -= 1
      if (filesToProcess === 0) {
        resolve()
      }
    }
    console.log('apply stack upgrade', sourceDir, '->', destDir)
    glob(sourceDir + '/**/*', {dot: true, ignore: ['/.git']})
      .on('data', function (file) {
        filesToProcess += 1
        fs.stat(file.path, function (err, stats) {
          if (err) {
            filesToProcess -= 1
            return console.error('ERROR: failed to stat', file.path, err)
          }
          if (stats.isDirectory()) {
            filesToProcess -= 1
            return
          }
          deepMergeFile({
            templatesRoot: sourceDir,
            destRoot: destDir,
            file,
            answers
          }, onFileDone)
        })
      })
      .on('error', console.error)
      .on('end', function () {
        if (filesToProcess === 0) {
          console.info('no files to process in', sourceDir + '/**/*')
          reject(new Error('upgrade merge failed, no files were found'))
        }
      })
  })
}
