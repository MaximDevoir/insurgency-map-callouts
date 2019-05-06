'use strict'

const fs = require('fs-extra')
const path = require('path')

const chalk = require('chalk')

const scriptsDir = path.dirname(require.main.filename)
const sourceDir = path.join(scriptsDir, '..')
const rootDir = path.join(sourceDir, '..')

/**
 * Ensures that all the directories that may be required by subsequent build
 * steps exist.
 *
 * @param {function|undefined} nextStep The function to call once
 * ensureBuildDirectories has finished executing.
 */
function ensureBuildDirectories(nextStep) {
  process.stdout.write('\n\nEnsuring directories\n')

  // All directories are relative to the project root folder.
  const directoriesToEnsure = [
    ['build'],
    ['build', 'staged'],
    ['build', 'staged', 'maps']
  ]

  const directoryPromises = directoriesToEnsure.map(directory => {
    const fullPath = path.join(rootDir, ...directory)

    const post = ` Ensured directory ${directory.join('/')}\n`

    return fs.ensureDir(fullPath).then(() => {
      process.stdout.write('[' + chalk.green('success') + ']' + post)

      return fullPath
    }).catch(err => {
      process.stdout.write('[' + chalk.red('failed') + ']' + post)

      return [fullPath, err]
    })
  })


  Promise.all(directoryPromises).then(res => {
    const failures = res.filter(result => typeof result === 'object')

    if (failures.length) {
      console.log('\n\n', failures)

      process.stdout.write('\n' + chalk.red('Failed to create required directories.\n'))
      process.stdout.write(chalk.red('Exiting now\n'))

      process.exit(1)
    }
  }).finally(() => {
    return (typeof nextStep === 'function' && nextStep(), undefined)
  })
}

module.exports = ensureBuildDirectories
