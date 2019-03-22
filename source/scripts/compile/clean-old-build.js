'use strict'

const fs = require('fs-extra')
const path = require('path')

const chalk = require('chalk')

const scriptsDir = path.dirname(require.main.filename)
const sourceDir = path.join(scriptsDir, '..')
const rootDir = path.join(sourceDir, '..')
const defaultEnvFile = path.join(rootDir, '.env')

require('dotenv').config(defaultEnvFile)

// https://stackoverflow.com/a/32197381
function deleteFolderRecursive(rmPath) {
  try {
    if (fs.existsSync(rmPath)) {
      fs.readdirSync(rmPath).forEach((file) => {
        const postFile = ` Removed file ${path.basename(file)}\n`

        var curPath = rmPath + '/' + file
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath)
        } else {
          fs.unlinkSync(curPath)
          process.stdout.write('[' + chalk.green('success') + ']' + postFile)
        }
      })

      fs.rmdirSync(rmPath)
      const postDir = ` Removed directory ${rmPath}\n`
      process.stdout.write('[' + chalk.green('success') + ']' + postDir)
    }
  } catch (err) {
    console.log(err)

    process.stdout.write(chalk.red(`\n\nAn error occurred when trying to remove ${rmPath}.`))
    process.stdout.write(chalk.red('\nExiting now.\n'))

    process.exit(1)
  }
}

/**
 * Cleans any remnants of previous builds.
 *
 * @param {function|undefined} nextStep The function to call once
 * directoriesToRemove has finished executing.
 */
function cleanBuild(nextStep) {
  process.stdout.write('\nCleaning old files\n')
  // All directories are relative to the project root folder.
  const directoriesToRemove = [
    ['build', process.env.MOD_NAME],
    ['build']
  ]

  // eslint-disable-next-line no-restricted-syntax
  for (const dirArr of directoriesToRemove) {
    const fullPath = path.join(rootDir, ...dirArr)

    deleteFolderRecursive(fullPath)
  }

  return (typeof nextStep === 'function' && nextStep(), undefined)
}

module.exports = cleanBuild
