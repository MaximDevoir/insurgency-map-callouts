const chalk = require('chalk')

const rasterizeMaps = require('./build/rasterize-maps')
const ensureBuildDirectories = require('./build/ensure-directories')
const convertMapsToVTF = require('./build/convert-to-vtf')
const cleanBuildDirectories = require('./build/clean-old-build')
const generateModStructure = require('./build/generate-mod-structure')
const generateVPK = require('./build/generate-vpk')
const verifyVPK = require('./build/verify-vpk')
const stageImages = require('./build/stage-images')
const updateStagedHrefs = require('./build/update-staged-hrefs')

function finishedMessage() {
  process.stdout.write('\n\n' + chalk.green('Mod successfully created!\n'))
}

const buildSteps = [
  cleanBuildDirectories,
  ensureBuildDirectories,
  stageImages,
  updateStagedHrefs,
  rasterizeMaps,
  convertMapsToVTF,
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
