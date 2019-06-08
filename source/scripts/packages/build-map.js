const path = require('path')
const isFile = require('is-file')

const MapReader = require('./map-reader')
const MapWriter = require('./map-writer')

/**
 * Build the svg map from mapPath. Will build both day and night, if map has
 * night variant.
 * @param {string} mapPath The path to the JSON file.
 */
function buildMap(mapPath, onBuildSuccess, writeDir) {
  if (!isFile(mapPath)) {
    throw Error(`The path - ${mapPath} - is not a file.`)
  }

  if (path.extname(mapPath) !== '.json') {
    throw Error(`The file - ${mapPath} - is not a valid json file.`)
  }

  const hasNightVariant = new MapReader(mapPath).hasNightVariant()

  const mapOptions = {
    writeNightVariant: false
  }

  if (writeDir) {
    mapOptions.writeDir = writeDir
  }

  const map = new MapWriter(mapPath, mapOptions)

  map.write(onBuildSuccess)

  if (hasNightVariant) {
    map.options.writeNightVariant = true
    map.write(onBuildSuccess)
  }

  return true
}

module.exports = buildMap
