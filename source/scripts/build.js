const chalk = require('chalk')

const rasterizeMaps = require('./compile/rasterize-maps')
const ensureBuildDirectories = require('./compile/ensure-directories')
const convertMapsToVTF = require('./compile/convert-to-vtf')
const cleanBuildDirectories = require('./compile/clean-old-build')
const generateModStructure = require('./compile/generate-mod-structure')
const buildTranslations = require('./packages/build-translations')
const generateVPK = require('./compile/generate-vpk')
const verifyVPK = require('./compile/verify-vpk')
const stageImages = require('./compile/stage-images')

function finishedMessage() {
  process.stdout.write('\n\n' + chalk.green('Mod successfully created!\n'))
}

const buildSteps = [
  cleanBuildDirectories,
  ensureBuildDirectories,
  stageImages,
  rasterizeMaps,
  convertMapsToVTF,
  buildTranslations,
  generateModStructure,
  generateVPK,
  verifyVPK,
  finishedMessage
]

const seriesBuild = buildSteps.reduceRight((prevBuildStep, curBuildStep) => {
  return [curBuildStep.bind(undefined, prevBuildStep[0]), ...prevBuildStep]
}, [])

if (typeof seriesBuild[0] === 'function') {
  process.stdout.write('\n')
  seriesBuild[0].call()
}
