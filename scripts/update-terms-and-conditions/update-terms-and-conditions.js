const fetch = require('node-fetch')
const path = require('path')
const getAccessToken = require('../../helpers/get-access-token')

const updateTermsAndConditions = async (argv) => {
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
    const dir = path.resolve(__dirname, `../../config/phase-${PHASE}/consent`)

    const fileContent = require(path.join(dir, 'terms-and-conditions.json'))

    const requestUrl = `${FIDC_URL}/openidm/config/selfservice.terms`
    const requestOptions = {
      method: 'put',
      body: JSON.stringify(fileContent),
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json'
      }
    }
    const { status, statusText } = await fetch(requestUrl, requestOptions)
    if (status > 299) {
      throw new Error(`${status}: ${statusText}`)
    }
    console.log('Terms and conditions updated')
    return Promise.resolve()
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

module.exports = updateTermsAndConditions