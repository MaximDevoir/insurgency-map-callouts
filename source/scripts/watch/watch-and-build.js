const fs = require('fs-extra')
const path = require('path')
const chokidar = require('chokidar')
const chalk = require('chalk')
const stdin = process.stdin
const buildMap = require('./../packages/build-map')

stdin.setRawMode(true)
stdin.resume()
stdin.setEncoding('utf8')

const scriptsDir = path.dirname(require.main.filename)
const sourceDir = path.join(scriptsDir, '..')
const mapsDir = path.join(sourceDir, 'maps')

function watchLog(type, mapPath) {
  const basename = path.basename(mapPath, '.json')

  process.stdout.write('[' + chalk.keyword('yellow')('info') + `] ${basename} has been ${type}\n`)

  try {
    buildMap(mapPath, build => {
      const mapName = build.getMapName()
      process.stdout.write('[' + chalk.keyword('green')('success') + `] ${mapName} has been built\n`)
    })
  } catch (err) {
    process.stderr.write('[' + chalk.keyword('red')('error') + `] ${basename}.json could not be built\n`)
    // eslint-disable-next-line no-console
    console.error(err)
  }
}

function watchAndBuild(nextStep) {
  process.stdout.write('\n\nWatching for changes\n')

  const watcher = chokidar.watch(mapsDir, {
    persistent: true,
    ignored: /skeleton.json/,
    ignoreInitial: false,
    usePolling: true,
    interval: 300
  })

  watcher
    .on('add', mPath => watchLog('added', mPath))
    .on('change', mPath => watchLog('changed', mPath))

  stdin.on('data', key => {
    // ctrl-x or ctrl-c
    if (key === '\u0018' || key === '\u0003') {
      if (typeof nextStep === 'function') {
        watcher.close()
        nextStep()
      } else {
        process.exit()
      }
    }
  })
}

module.exports = watchAndBuild
