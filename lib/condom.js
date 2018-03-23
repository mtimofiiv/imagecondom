const gm = require('gm')
const bytes = require('bytes')
const pjson = require('../package.json')
const validUrl = require('valid-url')
const stream = require('stream')
const { get } = require('https')

const ALLOWED_MIME_TYPES = [ 'image/jpeg', 'image/png', 'image/gif' ]
const MAX_CONTENT_LENGTH = bytes(process.env.MAX_SIZE || 10485760)

const testForBadRequests = ({ statusCode, headers }) => {
  if (statusCode < 200 || statusCode > 200) return 'Cannot get file'
  if (ALLOWED_MIME_TYPES.indexOf(headers['content-type']) === -1) return 'Invalid file type'
  if (headers['content-length'] > MAX_CONTENT_LENGTH) return 'File too big'

  return true;
}

const log = ({ level, code, message, url, reqStart, image }) => (
  console[level || 'info'](
    `=> ${code} ${Date.now() - reqStart}ms ${url} (${image || 'invalid URI'}) ${message || ''}`
  )
)

module.exports = ({ url }, res) => {
  if (url === '/favicon.ico') return res.end()

  const [ width, base64uri ] = url.slice(1).split('/')
  const reqStart = Date.now()

  if (!width || !base64uri) {
    log({
      reqStart,
      code: 400,
      level: 'error',
      message: 'A required parameter is missing',
      url
    })

    res.statusCode = 400
    return res.end('Invalid request')
  }

  const imageUri = new Buffer(base64uri, 'base64').toString('ascii')

  if (width < 1 || !validUrl.isUri(imageUri)) {
    log({
      reqStart,
      code: 400,
      level: 'error',
      message: 'Image URL not valid',
      url,
      image: imageUri
    })

    res.statusCode = 400
    return res.end('Invalid request')
  }

  const remoteImage = get(imageUri)

  remoteImage.on('response', response => {
    const requestIsValid = testForBadRequests(response)

    if (requestIsValid !== true) {
      log({
        reqStart,
        code: 400,
        level: 'error',
        message: `Image not valid: ${requestIsValid}`,
        url,
        image: imageUri
      })

      res.statusCode = 400
      return res.end(requestIsValid)
    }

    log({
      reqStart,
      code: 200,
      url,
      image: imageUri
    })

    return gm(response).resize(width).stream().pipe(res)
  })
}
