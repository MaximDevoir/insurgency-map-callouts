'use strict'

/* eslint-disable no-underscore-dangle, func-names */
const fs = require('fs-extra')
const path = require('path')
const maps = require('./maps')

const isFile = require('is-file')
const classNames = require('classnames')
const scriptsDir = path.join(__dirname, '..')
const sourceDir = path.join(scriptsDir, '..')
const rootDir = path.join(sourceDir, '..')
const externalDir = path.join(rootDir, 'source', 'external')
const externalMapsDir = path.join(rootDir, 'source', 'external', 'maps')
const stylesheetPath = path.join(sourceDir, 'styles', 'style.css')

const defaultEnvFile = path.join(rootDir, '.env')

require('dotenv').config(defaultEnvFile)

const BUILD_FOR_PRODUCTION = process.env.BUILD_FOR_PRODUCTION.toLowerCase() === 'true' || false

function writeLines(lines) {
  let markup = ''

  lines.forEach((line, index) => {
    const isFirstLine = index === 0
    markup = `${markup}
      <tspan x="0" dy="${isFirstLine ? '0' : '1.1em'}">${line}</tspan>`
  })

  return markup
}

/**
 * Write an SVG map file from a json-sourced `mapPath`.
 *
 * @param {string} mapPath The absolute path of the JSON map to read.
 */
function MapWriter(mapPath, options) {

  this.mapPath = mapPath

  if (!path.isAbsolute(mapPath)) {
    throw new Error(`The map path ${mapPath}, must be absolute.`)
  }

  if (!isFile(mapPath)) {
    throw new Error(`No file found at ${mapPath}.`)
  }

  this.options = Object.assign({
    writeNightVariant: false,
    calloutLanguage: 'en',
    writeForProduction: BUILD_FOR_PRODUCTION,
    writeDir: externalMapsDir,
    encodeTextureBase64: false
  }, options)

  this.mapData = fs.readJSONSync(this.mapPath) || {}
  this.basemapName = this.mapData.map.name
}

MapWriter.prototype.getMapName = function () {
  return this.options.writeNightVariant ? `${this.basemapName}_night` : this.basemapName
}

MapWriter.prototype.buildXMLMeta = function () {
  const stylesRelativePath = path.relative(this.options.writeDir, stylesheetPath)
  const stylesheetString = this.options.writeForProduction
    ? ''
    : `<?xml-stylesheet href="${stylesRelativePath}" type="text/css"?>`

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${stylesheetString}\n`
}

MapWriter.prototype.buildSVGRoot = function () {
  const rootClassnames = classNames({
    SVGRoot: true,
    production: this.options.writeForProduction,
    night: this.options.writeNightVariant
  })

  return '<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg"'
    + ' xmlns:xlink="http://www.w3.org/1999/xlink" width="1024px" height="1024px"'
    + ` viewBox="0 0 1024 1024" version="1.1" id="SVGRoot" class="${rootClassnames}">\n`
}

MapWriter.prototype.injectStyleNode = function () {
  if (!this.options.writeForProduction && this.options.writeDir === externalMapsDir) {
    return ''
  }

  let styleString = '<style type="text/css">'
  styleString += '<![CDATA[\n' + fs.readFileSync(stylesheetPath, 'utf8') + '\n]]>\n'
  styleString += '</style>'
  return styleString
}

MapWriter.prototype.buildTitle = function () {
  return `\n<title>${this.getMapName()} callouts</title>\n`
}

MapWriter.prototype.getOverviewImagePath = function () {
  return path.relative(
    this.options.writeDir,
    path.join(externalDir, 'root', 'materials', 'overviews', `${this.getMapName()}.jpg`)
  )
}

MapWriter.prototype.buildMapGroup = function () {
  return `<g id="map">
    <image y="0" x="0" preserveAspectRatio="none"
      height="1024" width="1024"
      href="${this.getOverviewImagePath()}" />
  </g>`
}

MapWriter.prototype.buildDevelopmentNotice = function () {
  if (this.options.writeForProduction) {
    return ''
  }

  return '<g><text class="callout development_notice" x="20" y="50">DEVELOPMENT MODE </text></g>'
}

// eslint-disable-next-line no-underscore-dangle
MapWriter.prototype._calcFinalTranslate = function (translate) {
  if (this.options.writeNightVariant === false) {
    return translate
  }

  const globalNightTransform = (this.mapData.map.night
    && typeof this.mapData.map.night.translate === 'string'
    && this.mapData.map.night.translate.split(' ').map(Number))
    || ['0', '0'].map(Number)

  const curTranslate = translate.split(' ').map(Number)

  return [curTranslate[0] + globalNightTransform[0], curTranslate[1] + globalNightTransform[1]].join(' ')
}

MapWriter.prototype.buildCallout = function (callout) {
  const transformString = `translate(${this._calcFinalTranslate(callout.translate)})`
    + ` rotate(${callout.rotate.length ? callout.rotate : '0'})`
  const classString = classNames(callout.classNames)

  const calloutString = `<g transform="${transformString}" class="${classString}">
    <text>${writeLines(callout.callout[this.options.calloutLanguage])}</text>\n</g>`

  return calloutString
}

MapWriter.prototype.buildCalloutsGroup = function () {
  const start = '<g id="callouts">'
  let middle = ''
  const end = '</g>'

  this.mapData.callouts.forEach(callout => {
    middle = `${middle}\n${this.buildCallout(callout)}`
  })

  return `\n${start}\n${middle}\n${end}\n`
}

MapWriter.prototype.buildContents = function () {
  return this.buildXMLMeta()
    + this.buildSVGRoot()
    + this.injectStyleNode()
    + this.buildTitle()
    + this.buildMapGroup()
    + this.buildCalloutsGroup()
    + this.buildDevelopmentNotice()
    + '\n</svg>'
}

MapWriter.prototype.write = function (onSuccess) {
  const writeFile = path.join(this.options.writeDir, `${this.getMapName()}.svg`)

  try {
    fs.writeFileSync(writeFile, this.buildContents())

    if (typeof onSuccess === 'function') {
      onSuccess.call(undefined, this)
    }
  } catch (err) {
    throw err
  }
}

module.exports = MapWriter
