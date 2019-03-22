/* eslint-disable no-param-reassign */
/**
 * OK, so this step does a couple of transformations to the staged svg map.
 *
 * Some things this file will do, and things that should probably be put on
 * another step:
 *   * Create a `style` element and load the contents of the `style.css` file
 *     into the element.
 *   * Convert the background image to base64. (which does not appear to be
 *     necessary when using the `convert-svg-to-png` package [relative paths
 *     work fine with `convert-svg-to-png`]. However, almost every other
 *     'svg-to-image' package requires a base64 encoding.)
 *
 */
const fs = require('fs-extra')
const path = require('path')

const chalk = require('chalk')

const maps = require('./../packages/maps')
const btoa = require('btoa')
const replaceInFile = require('replace-in-file')
const SVGAST = require('./../packages/svgast')

const scriptsDir = path.dirname(__dirname, '..')
const rootDir = path.join(scriptsDir, '..', '..')
const externalDir = path.join(rootDir, 'source', 'external')
const stylesPath = path.join(rootDir, 'source', 'styles', 'style.css')

require('dotenv').config()

const BUILD_FOR_PRODUCTION = process.env.BUILD_FOR_PRODUCTION || false

// Whether to encode image in base64. Otherwise, uses a relative path.
const encodeImageWithBase64 = false


function updateStagedHrefs(next) {
  process.stdout.write('\n\nUpdating map hrefs\n')

  const mapList = maps.getStagedSync()

  mapList.forEach(mapPath => {
    const svgTree = new SVGAST(mapPath)
    const mapName = path.basename(mapPath, '.svg')
    const overviewJpg = path.join(
      externalDir,
      'root',
      'materials',
      'overviews',
      `${mapName}.jpg`
    )
    const relativePath = path.relative(mapPath, overviewJpg).slice(1)

    svgTree.transform(node => {
      if (node.attributes && node.attributes.id === `map_${mapName}`) {
        if (encodeImageWithBase64) {
          delete node.attributes.href

          node.attributes['xlink:href'] = 'data:image/jpg;base64,'
            + btoa(fs.readFileSync(overviewJpg))
        } else {
          node.attributes.href = relativePath
        }
      }

      return node
    })

    if (BUILD_FOR_PRODUCTION === false) {
      // Add a debug message in top left corner
      svgTree.transform(node => {
        if (node.attributes && node.attributes.id === 'callouts') {
          node.children.unshift({
            name: 'text',
            type: 'element',
            value: '',
            attributes: {
              class: 'callout development_notice',
              x: '20',
              y: '50'
            },
            children: [{
              name: '',
              type: 'text',
              value: 'DEVELOPMENT MODE',
              attributes: {},
              children: []
            }]
          })
        }

        return node
      })
    }

    svgTree.transform(node => {
      if (node.attributes && node.attributes.id === 'SVGRoot') {
        node.children.unshift({
          name: 'style',
          type: 'element',
          value: '',
          attributes: { type: 'text/css' },
          children: [{
            name: '',
            type: 'text',
            value: '%STAGED_STYLES_REPLACEMENT_IDENTIFIER%',
            attributes: {},
            children: []
          }]
        })
      }

      return node
    })

    svgTree.save({
      onSave: () => {
        const post = ` Updated hrefs for map ${mapName}\n`

        try {
          const styleString = '<![CDATA[\n' + fs.readFileSync(stylesPath, 'utf8') + '\n]]>\n'

          replaceInFile.sync({
            files: mapPath,
            from: /%STAGED_STYLES_REPLACEMENT_IDENTIFIER%/g,
            to: styleString
          })
        } catch (error) {
          console.error('Error occurred:', error)
          process.exit(1)
        }

        process.stdout.write('[' + chalk.green('success') + ']' + post)
      }
    })
  })

  return (typeof next === 'function' && next(), undefined)
}

module.exports = updateStagedHrefs
