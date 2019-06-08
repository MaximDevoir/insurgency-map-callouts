const path = require('path')

const glob = require('glob')

const scriptsDir = path.dirname(__dirname, '..')
const rootDir = path.join(scriptsDir, '..', '..')
const externalDir = path.join(rootDir, 'source', 'external')
const mapsDirectory = path.join(rootDir, 'source', 'maps')
const mapsDirectoryStaged = path.join(rootDir, 'build', 'staged', 'maps')

/**
 * @returns {string[]} List of all the JSON maps in source/maps
 */
function getSync() {
  return glob.sync(path.join(mapsDirectory, '*.json'), {
    ignore: '**/skeleton.json'
  })
}

function get(callback) {
  return glob(path.join(mapsDirectory, '*.json'), callback)
}

/**
 * @returns {string[]} List of all SVG maps in source/external/maps
 */
function getExternalSync() {
  return glob.sync(path.join(externalDir, 'maps', '*.svg'))
}

async function getStaged(callback) {
  glob(path.join(mapsDirectoryStaged, '*.svg'), {
    mark: true
  }, async (err, files) => {
    await callback.call(err, files)
  })
}

function getStagedSync() {
  return glob.sync(path.join(mapsDirectoryStaged, '*.svg'))
}

function getStagedVTFSync() {
  return glob.sync(path.join(mapsDirectoryStaged, '*.vtf'))
}

function getStagedRasterSync() {
  return glob.sync(path.join(mapsDirectoryStaged, '*.png'))
}

module.exports = {
  mapsDirectoryStaged,
  mapsDirectory,
  getSync,
  getStagedSync,
  getExternalSync,
  getStagedVTFSync,
  getStagedRasterSync,
  get,
  getStaged
}
