const fs = require('fs')
const path = require('path')
const getAccessToken = require('../../helpers/get-access-token')
const fidcRequest = require('../../helpers/fidc-request')

const updateManagedObjects = async (argv) => {
  // Check environment variables
  const { FIDC_URL, PHASE = '0' } = process.env

  if (!FIDC_URL) {
    console.error('Missing FIDC_URL environment variable')
    return process.exit(1)
  }

  try {
    const accessToken = await getAccessToken(argv)

    console.log(`Using phase ${PHASE} config`)

    // Combine managed object JSON files
    const dir = path.resolve(
      __dirname,
      `../../config/phase-${PHASE}/managed-objects`
    )

    const managedObjects = fs
      .readdirSync(dir)
      .filter((name) => path.extname(name) === '.json') // Filter out any non JSON files
      .map((filename) => require(path.join(dir, filename))) // Map JSON file content to an array

    // Update all managed objects
    const requestUrl = `${FIDC_URL}/openidm/config/managed`
    const requestBody = {
      objects: managedObjects
    }

    await fidcRequest(requestUrl, requestBody, accessToken)
    console.log('Managed objects updated')
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

module.exports = updateManagedObjects
