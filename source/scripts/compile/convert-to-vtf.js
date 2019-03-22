const path = require('path')

const cpp = require('child-process-promise')
require('dotenv').config()
const chalk = require('chalk')

const maps = require('../packages/maps')

const VTF_CMD = process.env.VTF_CMD

const mapFlags = [
  'NOMIP',
  'NOLOD',
  'CLAMPS',
  'CLAMPT',
  'TRILINEAR'
]

function flagsToString(flags) {
  let flagString = ''

  flags.forEach(flag => {
    flagString = `${flagString} -flag "${flag}"`
  })

  return flagString
}

async function convertMapsToVTF(next) {
  process.stdout.write('\n\nConverting maps to VTF\n')
  let failedAtSome = false

  const rasterList = maps.getStagedRasterSync()

  const promiseRasterList = rasterList.reduce((prevValue, rasterFile) => {
    const rasterName = path.basename(rasterFile, '.png')
    const setTo = new Promise(resolve => {
      const execString = `${VTF_CMD} -file "${rasterFile}" ${flagsToString(mapFlags)}`

      cpp.exec(execString, {
        cwd: maps.mapsDirectoryStaged
      }).then(result => {
        if (result.stdout.indexOf('1/1 files completed') === -1) {
          process.stdout.write('[' + chalk.red('failed') + `] Unable to generate VTF for ${rasterName}\n`)

          resolve([rasterName, true, result.stdout])

          return
        }

        const post = ` Built VTF for map ${rasterName}\n`
        process.stdout.write('[' + chalk.green('success') + ']' + post)

        resolve([rasterName, false, result.stdout])
      }).catch(err => {
        process.stdout.write('[' + chalk.red('failed code 17') + `] Unable to generate VTF for ${rasterName}\n`)
        resolve([rasterName, 'code 17', err])
      })
    })

    return [...prevValue, setTo]
  }, [])

  await Promise.all(promiseRasterList).then(results => {
    // eslint-disable-next-line no-restricted-syntax
    for (const [mapName, didFail, stdout] of results) {
      if (didFail) {
        failedAtSome = true
        console.log(stdout)
        process.stdout.write('[' + chalk.red(mapName) + `] ${JSON.stringify(stdout)}\n`)
      }
    }
  })

  if (failedAtSome) {
    process.stdout.write('[' + chalk.red('failed') + '] Unable to generate VTFs from some images')
    process.stdout.write(chalk.red('\nExiting now\n'))
    process.exit(1)
  }

  console.log('[' + chalk.keyword('yellow')('info') + '] Generated VTFs for images')

  const callNext = typeof next === 'function'
  return (callNext && next(), undefined)
}

module.exports = convertMapsToVTF
