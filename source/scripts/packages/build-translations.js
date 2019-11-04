const childProcess = require('child_process')
const path = require('path')
const chalk = require('chalk')
const fs = require('fs-extra')
const which = require('which')
const detectNewline = require('detect-newline')
const vdf = require('simple-vdf')

const maps = require('./maps')

const scriptsDir = path.join(__dirname, '..')
const sourceDir = path.join(scriptsDir, '..')
const rootDir = path.join(sourceDir, '..')
const buildDir = path.join(rootDir, 'build')
const externalDir = path.join(sourceDir, 'external')

const GAME_DIRECTORY = process.env.GAME_LOCATION

const defaultEnvFile = path.join(rootDir, '.env')
const gameLocation = path.join(GAME_DIRECTORY)

require('dotenv').config(defaultEnvFile)


const vpk = which.sync('vpk', {
  nothrow: true
})

if (vpk === null) {
  console.log(chalk.red('Unable to locate \'vpk\' package.'))
  console.log(chalk.red('Did you run \'pip install vpk\'?'))
  process.exit(1)
}

const translationCache = {}

// A list of resources already extracted
const resourceCache = {
  'resourceName.vpk': {
    'resource/insurgency_english.txt': {
      declaredIn: ['ambush.json']
    }
  }
}

function extractResource(resource) {
  const resourceVPKPath = path.join(gameLocation, 'insurgency', resource.resource)

  if (path.extname(resource.path[resource.path.length - 1]) !== '.txt') {
    throw new Error('The resource path must be a txt file.')
  }
  const execString = `${vpk} "${resourceVPKPath}" -f ${path.join(...resource.path)} -x translations`
  let ret = null

  try {
    const execVPK = childProcess.execSync(execString, {
      cwd: externalDir
    })

    let extractedResourcePath = path.join(externalDir, execVPK.toString())
    const EOLSymbol = detectNewline(extractedResourcePath)

    // execSync().toString() contains a newline at the end that we need to remove.
    extractedResourcePath = extractedResourcePath.split(EOLSymbol)[0]

    fs.appendFileSync(path.join(externalDir, 'vpk_exec_translations.log'), `${execVPK.toString()} with execString of: ${execString}\n successfully extracted translation from vpk to ${extractedResourcePath}\n\n`)

    const extractedResourceShort = execVPK.toString().split('/').slice(1).join('/')
    process.stdout.write('[' + chalk.keyword('green')('success') + `] Extracted ${extractedResourceShort}`)
    ret = extractedResourcePath
  } catch (err) {
    console.log(err)
    console.log(chalk.red('Failed to extract a translation file.'))
    process.exit(1)
  }

  return ret
}

function buildTranslation(translationPath) {
  const translationPathBasename = path.basename(translationPath)
  process.stdout.write('[' + chalk.keyword('yellow')('info') + '] Building translation for ' + translationPathBasename + '\n')

  const translations = fs.readJSONSync(translationPath)
  const extractedResourcePath = extractResource(translations.file, translationPath)

  // Insurgency VDF assets contain \u0000 (null) characters between non-null
  // characters that must be stripped for parsedVDF to work as intended. See
  // https://stackoverflow.com/a/22809513
  let vdfFile = fs.readFileSync(extractedResourcePath, 'utf16le').replace(/\0/g, '')


  if (vdfFile.indexOf('#') !== -1 && vdfFile.indexOf('#') < vdfFile.indexOf('"')) {
    console.log(chalk.red('While processing a file for translations, a hashtag character was discovered before a quotation mark character.'))
    console.log(chalk.red('This usually means the translation file contains #include flag'))
    console.log(chalk.red('TODO: support processing of both " and # characters when trimming start of file.'))
    process.exit(1)
  } else {
    // For whatever reason, some translation files contain bad characters before
    // the first `"`. This removes all characters before the first quotation mark.
    vdfFile = '"' + vdfFile.split('"').slice(1).join('"')
  }
  const parsedVDF = vdf.parse(vdfFile)
  const vdfTranslationRoot = parsedVDF.lang.Tokens

  // eslint-disable-next-line no-restricted-syntax
  for (const translation of translations.tokens) {
    const {
      key_path: transPath,
      value: transValue
    } = translation

    if (transPath.length !== 1) {
      console.log(chalk.red('Translation path only supports 1 level deep.'))
      process.exit(1)
    }

    const computedTransValue = (() => {
      let ret = ''

      if (typeof transValue === 'string') {
        ret = transValue
      } else if (Array.isArray(transValue)) {
        // Use Windows EOL format for compatibility reasons.
        ret = transValue.join('\r\n')
      } else {
        console.log(chalk.red('The translation value must be a string or array of strings.'))
        process.exit(1)
      }

      return ret
    })()

    if (transPath[0] in vdfTranslationRoot) {
      vdfTranslationRoot[transPath[0]] = computedTransValue
    } else {
      process.stdout.write(chalk.red(`The translation "${transPath.join('/')}" does not exist under ${path.basename(extractedResourcePath)}.`))
      process.exit(1)
    }
  }

  fs.writeFileSync(extractedResourcePath, vdf.stringify(parsedVDF), {
    encoding: 'utf16le'
  })

  process.stdout.write('[' + chalk.keyword('green')('success') + `] Updated translation for ${path.basename(extractedResourcePath)}\n`)
}

async function buildTranslations(next) {
  process.stdout.write('\n\nBuilding translations\n')

  const translationsList = maps.getTranslationsSync()

  // eslint-disable-next-line no-restricted-syntax
  for (const translation of translationsList) {
    buildTranslation(translation)
  }

  const callNext = typeof next === 'function'

  if (callNext) {
    console.log('[' + chalk.keyword('yellow')('info') + '] Executing next step')
    return (callNext && next(), undefined)
  }

  return undefined
}

module.exports = buildTranslations
