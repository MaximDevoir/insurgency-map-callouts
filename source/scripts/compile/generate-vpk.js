const fs = require('fs-extra')
const exec = require('child_process').execSync
const path = require('path')

const chalk = require('chalk')
const detectNewline = require('detect-newline')

const scriptsDir = path.join(__dirname, '..')
const sourceDir = path.join(scriptsDir, '..')
const rootDir = path.join(sourceDir, '..')
const buildDir = path.join(rootDir, 'build')
const defaultEnvFile = path.join(rootDir, '.env')

require('dotenv').config(defaultEnvFile)

const modName = process.env.MOD_NAME
const GAME_LOCATION = process.env.GAME_LOCATION

let VPK
if (process.platform === 'linux') {
  VPK = 'vpk'
} else {
  VPK = path.join(GAME_LOCATION, 'bin', 'vpk.exe')
}

const BUILD_FOR_PRODUCTION = process.env.BUILD_FOR_PRODUCTION.toLowerCase() === 'true' || false

function generateVPK(next) {
  const modDir = path.join(buildDir, modName)
  const generatedVPKPath = path.join(buildDir, `${modName}.vpk`)

  let execString

  if (process.platform === 'linux') {
    execString = `vpk --create "${modDir}" "${generatedVPKPath}"`
  } else {
    execString = `"${VPK}" "${modDir}"`
  }

  process.stdout.write('\n\nGenerating VPK\n')

  process.stdout.write('[' + chalk.keyword('yellow')('info') + `] Mod directory ${modDir}\n`)
  process.stdout.write('[' + chalk.keyword('yellow')('info') + `] VPK ${VPK}\n`)
  process.stdout.write('[' + chalk.keyword('yellow')('info') + `] executing ${execString}\n`)


  try {
    const ret = exec(execString, {
      cwd: buildDir
    }).toString()

    const EOLSymbol = detectNewline(ret)

    const retLines = ret.split(EOLSymbol)

    if (process.platform === 'linux') {
      process.stdout.write('[' + chalk.blue('exec') + `] Linux VPK variant does not output information. \n`)
      const vpkContents = exec(`vpk -la "${generatedVPKPath}"`, {
        cwd: modDir
      }).toString()
      const EOLSymbol2 = detectNewline(vpkContents)

      const retLines2 = vpkContents.split(EOLSymbol2)
      // eslint-disable-next-line no-restricted-syntax
      for (const line of retLines2) {
        process.stdout.write('[' + chalk.blue('exec') + `] ${line}\n`)
      }
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const line of retLines) {
      process.stdout.write('[' + chalk.blue('exec') + `] ${line}\n`)
    }
  } catch (err) {
    console.log(err.stdout && err.stdout.toString())
    console.log(err.stderr && err.stderr.toString())
    console.log(err)

    process.stdout.write('[' + chalk.red('failed') + '] Unable to generate VPK file')
    process.stdout.write(chalk.red('\nExiting now\n'))

    process.exit(1)
  }

  if (BUILD_FOR_PRODUCTION === false) {
    process.stdout.write('\n[' + chalk.keyword('yellow')('info') + '] BUILD_FOR_PRODUCTION is FALSE\n')
    process.stdout.write('[' + chalk.keyword('yellow')('info') + '] Amending development tag to filename.\n')
    const developmentVPKPath = path.join(buildDir, `development-${modName}.vpk`)

    fs.renameSync(generatedVPKPath, developmentVPKPath)
  }

  const callNext = typeof next === 'function'
  return (callNext && next(), undefined)
}

module.exports = generateVPK
