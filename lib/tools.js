const crypto = require('crypto')
const imagePattern = /!\[.*\]\((.*)\)/

module.exports = {
  hashify: str => {
    const shasum = crypto.createHash('sha1')
    shasum.update(str)
    return shasum.digest('hex')
  },

  extratFirstImageUrlFromMarkdown: markdown => {
    const match = markdown.match(imagePattern)
    return match && match[1]
  }
}
