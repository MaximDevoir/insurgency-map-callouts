const fs = require('fs')

// TODO: Create this module into a separate dependency, and add methods such as
// envWriteSync.sync, where envWriteSync by default is asynchronously writing the .env
// file with callbacks and all that fancy stuff.
/**
 * Example: envWriteSync('/path/to/.env', { ENV_1: 'firstValue', ENV_2: 'second
 * value' })
 */
module.exports = function envWriteSync(path, obj) {
  let envString = ''

  // eslint-disable-next-line no-restricted-syntax,guard-for-in
  for (const key in obj) {
    let value = obj[key]

    if (!(Object.prototype.hasOwnProperty.call(obj, key))) {
      continue
    }

    envString = `${envString}${key}=${value}\n`
  }

  // TODO: Pass through data options from an argument variable
  fs.writeFileSync(path, envString)
}
