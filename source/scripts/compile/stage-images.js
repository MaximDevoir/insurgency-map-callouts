const path = require('path')
const chalk = require('chalk')
const maps = require('../packages/maps')
const buildMap = require('./../packages/build-map')

const scriptsDir = path.dirname(__dirname, '..')
const rootDir = path.join(scriptsDir, '..', '..')
const stagedMapsPath = path.join(rootDir, 'build', 'staged', 'maps')

/**
 * Build maps for all json files and moves them into the staged maps directory
 */
function stageMaps() {
  process.stdout.write('\n\nStaging maps\n')

  const mapList = maps.getSync()

  mapList.forEach(mapPath => {
    try {
      buildMap(mapPath, (mapObj) => {
        process.stdout.write('[' + chalk.green('success') + `] Built and staged ${mapObj.getMapName()}\n`)
      }, stagedMapsPath)
    } catch (err) {
      console.error(err)

      process.stdout.write('\n[' + chalk.red('failed') + '] unable to stage image')
      process.stdout.write(chalk.red('\nExiting now\n'))

      process.exit(1)
    }
  })
}

function stageEmblem() {

}

function stageImages(next) {
  stageMaps()
  stageEmblem()

  return (typeof next === 'function' && next(), undefined)
}

module.exports = stageImages
