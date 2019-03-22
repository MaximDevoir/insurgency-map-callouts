const fs = require('fs')
const path = require('path')

const chalk = require('chalk')

const scriptsDir = path.join(__dirname, '..')
const sourceDir = path.join(scriptsDir, '..')
const rootDir = path.join(sourceDir, '..')
const buildDir = path.join(rootDir, 'build')
const defaultEnvFile = path.join(rootDir, '.env')
require('dotenv').config(defaultEnvFile)


function verifyVPKGenerated(next) {
  const modName = process.env.MOD_NAME
  const generatedVPKPath = path.join(buildDir, modName + '.vpk')

  process.stdout.write('\n\nVerifying VPK\n')

  try {
    process.stdout.write('[' + chalk.keyword('yellow')('info') + `] Looking at ${generatedVPKPath}\n`)

    if (!fs.existsSync(generatedVPKPath)) {
      process.stdout.write('[' + chalk.keyword('red')('info') + '] Did not discover a generated VPK file\n')
      process.stdout.write(chalk.red('\nExiting now\n'))

      process.exit(1)
    }

    process.stdout.write('[' + chalk.keyword('green')('success') + '] Discovered the generated VPK file\n')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }

  const callNext = typeof next === 'function'
  return (callNext && next(), undefined)
}

module.exports = verifyVPKGenerated
