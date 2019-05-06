const childProcess = require('child_process')
const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const exec = require('child_process').execFile
const execSync = require('child_process').execFileSync
const chalk = require('chalk')
const glob = require('glob')
const which = require('which')

require('dotenv').config()

const scriptsDir = path.dirname(__dirname)
const sourceDir = path.join(scriptsDir, '..')
const externalDir = path.join(sourceDir, 'external')

const GAME_DIRECTORY = process.env.GAME_LOCATION
const GITHUB_REPO = process.env.GITHUB_REPO
const VTF_CMD = process.env.VTF_CMD

const gameLocation = path.join(GAME_DIRECTORY)

function seeMoreLog() {
  console.log(chalk.yellow(`To learn more about this software or how to use it, visit ${GITHUB_REPO}`))
  console.log(chalk.yellow(`If you are experiencing an issue with the software, feel free to report it to ${GITHUB_REPO}/issues`))
}

function extractMaps() {
  const vpk = which.sync('vpk', {
    nothrow: true
  })

  if (vpk === null) {
    console.log(chalk.red('Unable to locate \'vpk\' package.'))
    console.log(chalk.red('Did you run \'pip install vpk\'?'))
    seeMoreLog()
    process.exit(1)
  }

  console.log(`Discovered VPK excecutable at ${vpk}`)

  childProcess.exec('vpk --version', (err, stdout, stderr) => {
    // VPK Version listed in stderr
    console.log(stderr)
  })

  const materialsFile = path.join(gameLocation, 'insurgency', 'insurgency_materials_dir.vpk')

  // Check that insurgency_materials_dir.vpk exists
  if (fs.existsSync(materialsFile) !== true) {
    console.log(chalk.red(`Unable to locate 'insurgency_materials_dir.vpk' at ${materialsFile}`))
    seeMoreLog()
    process.exit(1)
  }

  process.stdout.write('Extracting maps from materials file\n')

  const execString = `${vpk} "${materialsFile}" -f materials/overviews/**.vtf -x root`
  console.log('executing with: ', execString)

  try {
    const execVPK = childProcess.execSync(execString, {
      cwd: externalDir
    })

    console.log(chalk.green(execVPK.toString()))

    fs.writeFileSync(path.join(externalDir, 'vpk_exec.log'), `${execVPK.toString()}\n\n` + `execString is ${execString}\n\n` + 'successfully extracted maps from vpk')
    // Onto the next step
    extractImageFromVTFS(path.join(externalDir, 'root', 'materials', 'overviews'))
  } catch (err) {
    console.log(err)
    console.log(chalk.red('Unable to extract maps.'))
    console.log(chalk.red('Please view source/external/vpk_exec.log for more information.'))
    console.log(chalk.red('If you are unable to resolve the issue, report it the developer.'))
    seeMoreLog()
    process.exit(1)
  }
}

/**
 * Extracts an image from each map overview in `overviewsDir`.
 *
 * @param {string} overviewsDir The directory containing map overviews.
 */
function extractImageFromVTFS(overviewsDir) {
  verifyVTFCmdInstalled()
  verifyOverviewsDir(overviewsDir)

  console.log('Discovering VTF files.')

  const vtfs = glob.sync(path.join(overviewsDir, '*.vtf'))

  vtfs.forEach(vtfFile => {
    process.stdout.write('Creating image for map ' + path.basename(vtfFile, '.vtf'))
    try {
      childProcess.execSync(`${VTF_CMD} -file "${vtfFile}" -output "" -exportformat "jpg"`, {
        cwd: overviewsDir
      })
    } catch (error) {
      throw error
    }

    process.stdout.write('... done\n')
  })
}

function verifyVTFCmdInstalled() {
  console.log('Verifying uf VTF Cmd is installed')

  if (fs.existsSync(VTF_CMD) !== true || path.basename(VTF_CMD).toLowerCase() !== 'vtfcmd.exe') {
    console.log(chalk.red('The environment variable "VTF_CMD" does not point to a file named "vtfcmd.exe"'))
    console.log(chalk.red(`You currently has 'VTF_CMD' set to ${VTF_CMD}`))
    console.log(chalk.red('Have you downloaded the VTFLib binaries yet?'))
    seeMoreLog()
    process.exit(1)
  }
}

function verifyOverviewsDir(overviewsPath) {
  console.log('Verifying the overviews path')
  if (!(fs.existsSync(overviewsPath) && fs.lstatSync(overviewsPath).isDirectory())) {
    console.log(chalk.red(`function verifyOverviewsDir -> the overviews directory set to ${overviewsPath}, is not a valid overviews directory.`))
    console.log(chalk.red('This is a error with the software and should be reported to the developer.'))
    console.log(chalk.red('Exiting now.'))
    seeMoreLog()
    process.exit(1)
  }
}

module.exports = extractMaps()
