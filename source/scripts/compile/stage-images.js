const fs = require('fs-extra')
const path = require('path')

const chalk = require('chalk')

const maps = require('../packages/maps')

const scriptsDir = path.dirname(__dirname, '..')
const rootDir = path.join(scriptsDir, '..', '..')
const stagedMapsPath = path.join(rootDir, 'build', 'staged', 'maps')

/**
 * Moves svg files from maps directory to staged directory
 */
function stageMaps(next) {
  process.stdout.write('\n\nStaging maps\n')

  const mapList = maps.getSync()


  mapList.forEach(mapPath => {
    const mapName = path.basename(mapPath)

    try {
      const post = ` Staged ${mapName}\n`

      fs.copyFileSync(mapPath, path.join(stagedMapsPath, mapName))

      process.stdout.write('[' + chalk.green('success') + ']' + post)
    } catch (err) {
      console.log(err)

      process.stdout.write('\n[' + chalk.red('failed') + '] unable to stage image')
      process.stdout.write(chalk.red('\nExiting now\n'))

      process.exit(1)
    }
  })

  return (typeof next === 'function' && next(), undefined)
}

module.exports = stageMaps
