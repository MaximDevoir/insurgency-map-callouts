'use strict'

/* eslint-disable func-names */
const fs = require('fs-extra')
const path = require('path')
const maps = require('./maps')

/**
 * Read, interpret, and manipulate the JSON map file.
 *
 * @param {string} mapPath The absolute path of the map to read.
 */
function MapReader(mapPath) {
  this.mapPath = mapPath

  if (!path.isAbsolute(mapPath)) {
    throw new Error(`The map path ${mapPath}, must be absolute.`)
  }

  this.mapData = fs.readJSONSync(this.mapPath) || {}
}

MapReader.prototype.hasNightVariant = function () {
  return this.mapData.map.generateNightVariant || false
}

MapReader.prototype.getMapName = function () {
  return this.mapData.map.name
}

module.exports = MapReader
