const fs = require('fs')
const path = require('path')

const rootDir = path.join(__dirname, '..', '..')
const envPath = path.join(rootDir, '.env')
const envSample = `${envPath}.sample`
process.stdout.write('\n\nRunning preinstall script\n')

try {
  process.stdout.write('Checking for `.env` file\n')

  if (!fs.existsSync(envPath)) {
    fs.copyFileSync(envSample, envPath)
    process.stdout.write('Created a .env file.\n')
  } else {
    process.stdout.write('An existing .env was found\n')
  }
} catch (err) {
  process.stdout.write('Error during preinstall [id114]\n')
  console.log(err)

  throw err
}
