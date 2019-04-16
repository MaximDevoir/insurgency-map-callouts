const fs = require('fs-extra')
const path = require('path')

const chalk = require('chalk')

const createConverter = require('convert-svg-to-png').createConverter

const maps = require('../packages/maps')

// TODO: Parallelize the rastering of images.
async function rasterizeMaps(next) {
  process.stdout.write('\n\nConverting staged maps to PNG\n')

  const converter = createConverter()

  try {
    const mapList = maps.getStagedSync()
    const results = []

    // eslint-disable-next-line no-restricted-syntax
    for (const map of mapList) {
      const mapName = path.basename(map, '.svg')

      if (mapName === 'new_map_boilerplate') {
        // eslint-disable-next-line no-continue
        continue
      }

      // eslint-disable-next-line no-await-in-loop
      const res = await converter.convertFile(map)
      const post = ` Rasterized map ${mapName}\n`
      process.stdout.write('[' + chalk.green('success') + ']' + post)

      results.push(res)
    }

    await Promise.all(results)

    console.log('[' + chalk.keyword('yellow')('info') + `] Rasterized ${results.length} maps`)
  } catch (err) {
    console.log(err)

    process.stdout.write('\n[' + chalk.red('failed') + '] unable to rasterize image')
    process.stdout.write(chalk.red('\nExiting now\n'))

    process.exit(1)
  } finally {
    console.log('[' + chalk.keyword('yellow')('info') + '] Destroyed converter instance')
    await converter.destroy()
  }

  const callNext = typeof next === 'function'

  if (callNext) {
    console.log('[' + chalk.keyword('yellow')('info') + '] Executing next step')
    return (callNext && next(), undefined)
  }

  return undefined
}

module.exports = rasterizeMaps
