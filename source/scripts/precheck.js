'use strict'

const os = require('os')
const path = require('path')

const arch = require('arch')
const chalk = require('chalk')
const find = require('find')
const inquirer = require('inquirer')
const isDirectory = require('is-directory')
const isFile = require('is-file')
const download = require('download')

const envWriteSync = require('./env-write')

const scriptsDir = path.dirname(require.main.filename)
const sourceDir = path.join(scriptsDir, '..')
const rootDir = path.join(sourceDir, '..')
const defaultEnvFile = path.join(rootDir, '.env')
const defaultVTFDir = path.join(sourceDir, 'external', 'vtflib')

console.log('Running Preinstall checklists')

const checks = [
  checkOS,
  checkArch,
  checkVTFLib
]

const seriesChecks = checks.reduceRight((prevChecks, curCheck) => {
  return [curCheck.bind(undefined, prevChecks[0]), ...prevChecks]
}, [])

if (typeof seriesChecks[0] === 'function') {
  process.stdout.write('\n')
  seriesChecks[0].call()
}

function checkOS(nextCheck) {
  process.stdout.write('Checking OS compatibility')

  const platform = os.platform()

  if (platform !== 'win32') {
    process.stdout.write('. ' + chalk.red(`Platform (${platform}) not compatible.\n`))

    inquirer.prompt([{
      type: 'confirm',
      name: 'continueWithoutOSCompat',
      message: 'Do you want to continue with the installation anyways?',
      default: false
    }]).then(answer => {
      if (!answer.continueWithoutOSCompat) {
        process.exit(1)
      }
    }).finally(() => {
      return (typeof nextCheck === 'function' && nextCheck(), undefined)
    })
  } else {
    process.stdout.write('. ' + chalk.green(`Platform ${platform} is compatible.\n`))

    return (typeof nextCheck === 'function' && nextCheck(), undefined)
  }
}

function checkArch(nextCheck) {
  process.stdout.write('Checking architecture compatibility')

  if (!(arch() === 'x32' || arch() === 'x64')) {
    process.stdout.write('. ' + chalk.red(`Architecture (${arch()}) not compatible.\n`))

    inquirer.prompt([{
      type: 'confirm',
      name: 'continueWithoutArchCompat',
      message: 'Do you want to continue with the installation anyways?',
      default: false
    }]).then(answer => {
      if (!answer.continueWithoutArchCompat) {
        process.exit(1)
      }
    }).finally(() => {
      return (typeof nextCheck === 'function' && nextCheck(), undefined)
    })
  } else {
    process.stdout.write('. ' + chalk.green(`Architecture ${arch()} is compatible.\n`))

    return (typeof nextCheck === 'function' && nextCheck(), undefined)
  }
}

/**
 * Updates the `VTF_CMD` in `.env` to the discovered version.
 *
 * Returns a boolean on whether it discovered a VTFLib binary.
 *
 * Returns number 2 if no updates were required.
 */
function updateVTF_CMD() {
  const vtfLibPath = discoverVTFLibExecPath()

  if (!vtfLibPath) {
    return false
  }

  const currentEnv = require('dotenv').config({ path: defaultEnvFile }).parsed

  if (currentEnv.VTF_CMD === vtfLibPath) {
    return 2
  }

  const newEnv = Object.assign({}, currentEnv, {
    VTF_CMD: vtfLibPath
  })

  envWriteSync(defaultEnvFile, newEnv)

  return true
}

function checkVTFLib(nextCheck) {
  process.stdout.write('Searching for VTFLib')

  if (isVTFLibInstalled()) {
    process.stdout.write('. ' + chalk.green(`Detected at ${discoverVTFLibExecPath()}.\n`))

    const updateResult = updateVTF_CMD()

    if (!updateResult) {
      process.stdout.write(chalk.red('Unable to automatically update VTF_CMD.\n'))
      process.stdout.write(chalk.red('You must manually link to your VTF_CMD in your `.env` file.\n'))
    } else if (updateResult === true) {
      process.stdout.write('Detected old reference of VTF_CMD in your .env file. ' + chalk.green('Updated VTF_CMD in your .env file.\n'))
    }

    return (typeof nextCheck === 'function' && nextCheck(), undefined)
  } else {
    process.stdout.write('. ' + chalk.red(`Could not discover VTFLib binaries.\n`))

    inquirer.prompt([{
      type: 'confirm',
      name: 'downloadVTFLib',
    message: 'Would you like to download the required VTFLib binaries now?',
      default: true
    }]).then(answer => {
      if (!answer.downloadVTFLib) {
        process.stdout.write(chalk.magenta('You must manually set VTF_CMD in your `.env` file.\n'))

        process.exit(1)
        return (typeof nextCheck === 'function' && nextCheck(), undefined)
      }

      const libBinariesURL = 'http://nemesis.thewavelength.net/files/files/vtflib132-bin.zip'

      process.stdout.write('Downloading binaries')
      download(libBinariesURL, defaultVTFDir, {
        extract: true,
      strip: 1
    }).then(() => {
          process.stdout.write('... ' + chalk.green('Download complete, \n'))

          const updateResult = updateVTF_CMD()
          if (updateResult === false) {
            process.stdout.write(chalk.red('Unable to automatically update VTF_CMD.\n'))
            process.stdout.write(chalk.red('You must manually link to your VTF_CMD in your `.env` file.\n'))

            return
          } else if (updateResult === 2) {
            process.stdout.write('[f2] Detected old reference of VTF_CMD in your .env file. '
              + chalk.green('Updated VTF_CMD in your .env file.\n'))
          }
        }).catch(err => {
          console.error(`\n${err}: Unable to download VTF Libraries.`)
          console.log('You must manually link to your VTF_CMD in your `.env` file.')
        }).finally(() => {
          return (typeof nextCheck === 'function' && nextCheck(), undefined)
        })
    })
  }
}

function isVTFLibInstalled() {
  const search = discoverVTFLibExecPath()

  return !!search
}

/**
 * Attempts to discover the `vtfcmd.exe` file by:
 *   1. Checking if `VTF_CMD` from `.env` points to the executable; or
 *   2. Checking `vtflibFolder`.
 *
 * @param {string} vtflibFolder The directory of the vtflib folder. Directory
 * structure goes `vtflibFolder` -> [x64, x86], -> [vtfcmd.exe, vtfedit.exe,
 * ...]
 * @returns {string|null} Returns the absolute path of vtfcmd.exe, if found.
 * Otherwise, returns `null`.
 */
function discoverVTFLibExecPath(vtflibFolder) {
  if (vtflibFolder === undefined) {
    vtflibFolder = defaultVTFDir
  }

  // Discover through `.env` file
  const envConfig = require('dotenv').config().parsed

  if (typeof envConfig === 'object') {
    if (isFile.sync(envConfig['VTF_CMD']) && path.extname(envConfig['VTF_CMD']) === '.exe') {
      return envConfig['VTF_CMD']
    }
  }

  // Discover through `vtflibFolder`
  if (!isDirectory.sync(vtflibFolder)) {
    return null
  }

  const archDir = path.join(vtflibFolder, arch())

  if (!isDirectory.sync(archDir)) {
    return null
  }

  const search = find.fileSync(/vtfcmd.exe/i, archDir)

  if (search.length) {
    return search[0]
  }

  return null
}
