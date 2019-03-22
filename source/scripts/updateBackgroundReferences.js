'use strict'

const path = require('path')
const fs = require('fs-extra')

const chalk = require('chalk')
const glob = require('glob')
const isDirectory = require('is-directory')

const svgson = require('svgson')
const beautifyHtml = require('js-beautify').html
const prettyData = require('pretty-data2').pd

const stylesheetFile = path.join(__dirname, '..', 'styles', 'style.css')

require('dotenv').config()


/**
 * Updates the map image href tag in a file, reformats the file, and saves it.
 *
 * @param {string} mapFile A location to an svg file.
 * @param {string} imageFile The image location to the directory storing the
 * map overviews.
 */
function updateReference(mapFile, imageFile) {
  const mapName = path.basename(mapFile, '.svg')
  const relativePath = path.relative(mapFile, imageFile).slice(1)

  const preSvg = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>'
    + '\n<?xml-stylesheet href="' + path.relative(mapFile, stylesheetFile).slice(1) + '" type="text/css"?>'


  svgson.parse(fs.readFileSync(mapFile, 'utf8'), {
    transformNode: node => {
      if (node.attributes && node.attributes.id === `map_${mapName}`) {
        // eslint-disable-next-line no-param-reassign
        node.attributes.href = relativePath
      }

      return node
    }
  }).then(obj => {
    const updatedSvg = svgson.stringify(obj)
    const pd = prettyData.xml(updatedSvg)

    const prettified = beautifyHtml(pd, {
      extra_liners: ['g', 'title'],
      indent_size: 2,
      wrap_line_length: 80,
      end_with_newline: true
    })

    const complete = `${preSvg}\n\n${prettified}`

    try {
      fs.writeFileSync(mapFile, complete)

      console.log(chalk.green(`Reformated and updated references for ${mapFile}`))
    } catch (err) {
      throw err
    }
  })
}

module.exports = function updateMapBackgroundReferences(mapsPath, overviewsPath) {
  if (!isDirectory.sync(mapsPath)) {
    throw `The path '${mapsPath}' does not point to a valid directory`
  }

  if (!isDirectory.sync(overviewsPath)) {
    throw `The path '${overviewsPath}' does not point to a valid directory`
  }

  const images = {}

  glob.sync(path.join(overviewsPath, '*.jpg')).forEach(imageFile => {
    const basename = path.basename(imageFile, '.jpg')
    images[basename] = imageFile
  })

  const maps = glob.sync(path.join(mapsPath, '*.svg'))

  maps.forEach(mapFile => {
    const basename = path.basename(mapFile, '.svg')
    const imageLocation = images[basename]

    if (typeof imageLocation !== 'string') {
      console.log(chalk.red(`Unable to locate an image for map ${basename}`))
      console.log(chalk.red(`Searched for ${path.join(overviewsPath, basename + '.jpg')}`))
      return
    }

    console.log(chalk.green(`Discovered map for ${mapFile}`))
    updateReference(mapFile, imageLocation)
  })
}
