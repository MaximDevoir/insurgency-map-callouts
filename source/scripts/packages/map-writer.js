/* eslint-disable no-case-declarations */
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
const outlinesDir = path.join(rootDir, 'source', 'maps', 'outlines')
const defaultEnvFile = path.join(rootDir, '.env')

require('dotenv').config(defaultEnvFile)

const BUILD_FOR_PRODUCTION = process.env.BUILD_FOR_PRODUCTION.toLowerCase() === 'true' || false
const fontSizeClasses = [
  'extra-small',
  'small',
  'regular',
  'medium-regular',
  'medium',
  'large'
]

/**
 * Appends night font size to a class and removes the daytime font size, if any
 * exist.
 * @param {string} classAsString A string of classes
 * @param {Object} callout The callout object
 */
function appendNightFontSize(classAsString, callout) {
  const nightFontClassName = (callout.night
    && typeof callout.night.fontSizeClass === 'string'
    && callout.night.fontSizeClass)
    || false

  // If there is no fontSizeClass for the night map, then nothing needs to be
  // appended/replaced/modified. Or, if nightFontSize is not a valid font class
  // name. Return `classAsString`.
  if (nightFontClassName === false || fontSizeClasses.includes(nightFontClassName) === false) {
    return classAsString
  }

  // An object containing all the classes from `classAsString`, minus any fonts
  // classes.
  const classAsStringNoFonts = {}

  // Filters out non-fonts from `classAsString`
  const dayFonts = classAsString.split(' ').map(className => {
    if (fontSizeClasses.includes(className)) {
      return className
    }

    classAsStringNoFonts[className] = true

    return undefined
  }).filter(Boolean)

  const newClassString = classNames(classAsStringNoFonts, nightFontClassName)

  return newClassString
}

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
  },
  // The map name as a class
  this.getMapName(),
  // The base map name as a class
  this.basemapName)

  return '<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg"'
    + ' xmlns:xlink="http://www.w3.org/1999/xlink" width="1024px" height="1024px"'
    + ` viewBox="0 0 1024 1024" version="1.1" id="SVGRoot" class="${rootClassnames}">\n`
}

MapWriter.prototype.injectStyleNode = function () {
  if (!this.options.writeForProduction && this.options.writeDir === externalMapsDir) {
    return ''
  }

  let styleNode = '<style type="text/css">'
  styleNode += '<![CDATA[\n' + fs.readFileSync(stylesheetPath, 'utf8') + '\n]]>\n'
  styleNode += '</style>'
  return styleNode
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

MapWriter.prototype.getEmblemImagePath = function () {
  return path.relative(
    this.options.writeDir,
    path.join(sourceDir, 'maps', 'emblem', 'emblem.png')
  )
}

MapWriter.prototype.buildMapGroup = function () {
  return `<g id="map">
    <image y="0" x="0" preserveAspectRatio="none"
      height="1024" width="1024"
      href="${this.getOverviewImagePath()}" />
  </g>`
}

MapWriter.prototype.buildEmblem = function () {
  return `<g id="emblem" class="emblem">
    <image y="10" x="10" preserveAspectRatio="none"
      height="93" width="93"
      href="${this.getEmblemImagePath()}" />
  </g>`
}

MapWriter.prototype.buildDevelopmentNotice = function () {
  if (this.options.writeForProduction) {
    return ''
  }

  return '<g><text class="callout anchor-right development_notice" x="1004" y="24">DEVELOPMENT MODE </text></g>'
}

// eslint-disable-next-line no-underscore-dangle
/**
 * Calculates the translation for a callout. If the translate coords are for a
 * daytime map, then the coords are returned un-modified. coords are only
 * recalculated based on a global and local translation properties specific for
 * night maps.
 */
MapWriter.prototype._calcFinalTranslate = function (callout) {
  if (this.options.writeNightVariant === false) {
    return callout.translate
  }

  const normalTranslate = (callout.translate
    && typeof callout.translate === 'string'
    && callout.translate.split(' ').map(Number))
    || console.warn('No callout translate coords given for unknown callout')
  const globalNightTranslate = (this.mapData.map.night
    && typeof this.mapData.map.night.translate === 'string'
    && this.mapData.map.night.translate.split(' ').map(Number))
    || ['0', '0'].map(Number)
  const localNightTranslate = (callout.night
    && callout.night.translate
    && typeof callout.night.translate === 'string'
    && callout.night.translate.split(' '))
    || ['r0', 'r0']

  let translate = localNightTranslate

  /**
   * If the value of the night-time translate begins with `r`, indicating the
   * value is 'relative' to the normal translate value, the `value` will be
   * added to normal translate value. Otherwise, returns `value`, which is
   * assumed to be absolute.
   */
  translate = translate.map((value, index) => {
    if (value[0].toLowerCase() === 'r') {
      return normalTranslate[index] + Number(value.substr(1))
    }

    return value
  })

  return [translate[0] + globalNightTranslate[0], translate[1] + globalNightTranslate[1]].join(' ')
}

MapWriter.prototype.buildCallout = function (callout) {
  const buildingNightMap = this.options.writeNightVariant
  let styleString = callout.styleString || ''
  const calloutType = callout.type || 'text'
  const rotateInt = callout.rotate.length ? callout.rotate : '0'
  const transformString = `translate(${this._calcFinalTranslate(callout)})`
    + ` rotate(${rotateInt})`
  let classString = classNames(callout.classNames, {
    // Add `hide` class to callouts that should only be rendered on night maps.
    // And visa-versa for callouts which have "day_only" enabled.
    hide: (callout.night_only && !buildingNightMap) || (callout.day_only && buildingNightMap),
    path: calloutType === 'path'
  })

  if (Math.abs(rotateInt) >= 50) {
    styleString = `letter-spacing: 0.8px; ${styleString}`
  }

  if (buildingNightMap) {
    classString = appendNightFontSize(classString, callout)
  }

  let innerContent = ''

  switch (calloutType) {
    case 'path':
      const pathName = callout.pathMarkup
      const pathMarkupFile = path.join(outlinesDir, pathName)

      const pathContents = fs.readFileSync(pathMarkupFile)

      innerContent = `${pathContents}`
      break
    default:
    case 'text':
      innerContent = `<text>${writeLines(callout.callout[this.options.calloutLanguage])}</text>`
      break
  }

  const calloutString = `<g transform="${transformString}" class="${classString}" style="${styleString}">
    ${innerContent}\n</g>`

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

MapWriter.prototype.buildLegend = function () {
  const hasLegend = typeof this.mapData.legend === 'object'
  if (!hasLegend) {
    return ''
  }

  const legendData = this.mapData.legend[this.options.calloutLanguage]
  let innerContent = ''

  legendData.forEach(function (item, index) {
    const isFirstLine = index === 0
    const key = item.key
    const value = item.value
    const legendMarkup = `<tspan x="0" dy="${isFirstLine ? '0' : '1.1em'}">${key} = ${value}</tspan>`
    innerContent = `${innerContent}${legendMarkup}`
  })

  const legendString = `<g id="legend" transform="translate(800 950)" class="callout anchor-left large" style=""><text>
    ${innerContent}\n</text></g>`
  return legendString
}

MapWriter.prototype.buildContents = function () {
  return this.buildXMLMeta()
    + this.buildSVGRoot()
    + this.injectStyleNode()
    + this.buildTitle()
    + this.buildMapGroup()
    + this.buildEmblem()
    + this.buildCalloutsGroup()
    + this.buildDevelopmentNotice()
    + this.buildLegend()
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
