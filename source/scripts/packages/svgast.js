/* eslint-disable no-param-reassign */

'use strict'

/* eslint-disable func-names */
const fs = require('fs-extra')
const path = require('path')

const chalk = require('chalk')
const svgson = require('svgson')

const beautifyHtml = require('js-beautify').html
const prettyData = require('pretty-data2').pd

const projectRootDir = path.join(__dirname, '..', '..', '..')
const projectSourceDirectory = path.join(projectRootDir, 'source')
const projectExternalDirectory = path.join(projectSourceDirectory, 'external')
const overviewsDirectory = path.join(projectExternalDirectory, 'root', 'materials', 'overviews')

// SVG AST Editor
function SVGAST(mapPath, config) {
  this.mapPath = mapPath
  this.mapName = path.basename(mapPath, '.svg')
  this.mapTree = this.transform()
  this.mapTreeAsString = undefined

  this.config = Object.assign({
    overviewsDirectory: overviewsDirectory
  }, config)
}

SVGAST.prototype.getPathName = function () {
  return this.mapPath
}

SVGAST.prototype.transform = function (transformNode) {
  if (typeof transformNode !== 'function') {
    transformNode = function (node) {
      return node
    }
  }

  try {
    const useMapString = typeof this.mapTreeAsString === 'string'

    const svgSource = useMapString
      ? this.mapTreeAsString
      : fs.readFileSync(this.mapPath, 'utf8')

    const tree = svgson.parseSync(svgSource, { transformNode })

    this.mapTree = tree
    this.mapTreeAsString = svgson.stringify(tree)

    return tree
  } catch (err) {
    throw err
  }
}

SVGAST.prototype.save = function (options) {
  options = Object.assign({
    prepend: '',
    append: '',
    onSave: () => {}
  }, options)

  let prettified = prettyData.xml(this.mapTreeAsString)
  prettified = beautifyHtml(prettified, {
    extra_liners: ['g', 'title'],
    indent_size: 2,
    wrap_line_length: 80,
    end_with_newline: true
  })

  try {
    fs.writeFileSync(this.mapPath, `${options.prepend}${prettified}${options.append}`)
    options.onSave()

    return
  } catch (err) {
    throw err
  }
}

module.exports = SVGAST
