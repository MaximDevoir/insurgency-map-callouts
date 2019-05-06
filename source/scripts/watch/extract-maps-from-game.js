const chalk = require('chalk')
const path = require('path')
const execSync = require('child_process').execSync
const detectNewline = require('detect-newline')

const scriptsDir = path.dirname(require.main.filename)
const sourceDir = path.join(scriptsDir, '..')

function extractMapsFromGame(nextStep) {
  const extractMapsFile = path.join(scriptsDir, 'packages', 'extract-maps.js')
  const execString = `node ${extractMapsFile}`

  process.stdout.write('\n\nExtracting maps from VTF\n')
  process.stdout.write('[' + chalk.keyword('yellow')('info') + `] executing ${execString}\n`)

  const ret = execSync(execString, {
    cwd: sourceDir
  }).toString()

  const EOLSymbol = detectNewline(ret)

  const retLines = ret.split(EOLSymbol)

  // eslint-disable-next-line no-restricted-syntax
  for (const line of retLines) {
    process.stdout.write('[' + chalk.blue('exec') + `] ${line}\n`)
  }

  if (typeof nextStep === 'function') {
    nextStep()
  }
}

module.exports = extractMapsFromGame
