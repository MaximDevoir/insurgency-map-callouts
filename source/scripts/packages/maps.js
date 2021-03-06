const path = require('path')

const glob = require('glob')

const scriptsDir = path.dirname(__dirname, '..')
const rootDir = path.join(scriptsDir, '..', '..')
const externalDir = path.join(rootDir, 'source', 'external')
const mapsDirectory = path.join(rootDir, 'source', 'maps')
const mapsDirectoryStaged = path.join(rootDir, 'build', 'staged', 'maps')
const translationsDir = path.join(rootDir, 'source', 'translations')
const translationsDirExternal = path.join(externalDir, 'translations')

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
 * Returns a list of JSON translation files.
 */
function getTranslationsSync() {
  return glob.sync(path.join(translationsDir, '*.json'))
}

/**
 * Returns a list of translation files (.txt files in VDF format).
 *
 * **How is a staged translation file different?**: A staged translation file is
 * built in VDF format and is ready to be merged into the mod.
 */
function getTranslationsExternalSync() {
  return glob.sync(path.join(translationsDirExternal, '**', '*.txt'))
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
  getStaged,
  getTranslationsSync,
  getTranslationsExternalSync,
  translationsDirExternal
}
