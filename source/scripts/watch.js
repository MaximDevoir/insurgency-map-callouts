const chalk = require('chalk')

const ensureWatchDirs = require('./watch/ensure-watch-directories')
const watchAndBuild = require('./watch/watch-and-build')
const extractMapsFromGame = require('./watch/extract-maps-from-game')

function finishedWatchingMessage() {
  process.stdout.write('\n\n' + chalk.green('Finished watching!\n'))
  process.exit()
}

const watchSteps = [
  ensureWatchDirs,
  extractMapsFromGame,
  watchAndBuild,
  finishedWatchingMessage
]

const seriesBuild = watchSteps.reduceRight((prevWatchStep, curWatchStep) => {
  return [curWatchStep.bind(undefined, prevWatchStep[0]), ...prevWatchStep]
}, [])

if (typeof seriesBuild[0] === 'function') {
  process.stdout.write('\n')
  seriesBuild[0].call()
}
