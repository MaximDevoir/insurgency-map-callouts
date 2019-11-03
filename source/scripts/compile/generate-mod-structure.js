const fs = require('fs-extra')
const path = require('path')

const chalk = require('chalk')
const maps = require('./../packages/maps')

const scriptsDir = path.join(__dirname, '..')
const sourceDir = path.join(scriptsDir, '..')
const rootDir = path.join(sourceDir, '..')
const buildDir = path.join(rootDir, 'build')

const defaultEnvFile = path.join(rootDir, '.env')

require('dotenv').config(defaultEnvFile)

/**
 * Generates a mod structure from staged VTFs and translation files.
 */
function generateModStructure(next) {
  const modName = process.env.MOD_NAME
  const modDir = path.join(buildDir, modName)
  const overviewsDir = path.join(modDir, 'materials', 'overviews')

  process.stdout.write('\n\nGenerating mod structure\n')

  try {
    fs.ensureDirSync(modDir)
    fs.ensureDirSync(overviewsDir)

    const vtfList = maps.getStagedVTFSync()
    // eslint-disable-next-line no-restricted-syntax
    for (const vtfFile of vtfList) {
      const vtfName = path.basename(vtfFile)
      const postMessage = ` Copied ${vtfName}\n`
      const dest = path.join(overviewsDir, vtfName)

      fs.copyFileSync(vtfFile, dest)

      process.stdout.write('[' + chalk.green('success') + ']' + postMessage)
    }

    fs.copySync(
      maps.translationsDirExternal,
      modDir
    )
  } catch (err) {
    console.log('Failed in generateModStructure')
    throw err
  }
  const callNext = typeof next === 'function'
  return (callNext && next(), undefined)
}

module.exports = generateModStructure
