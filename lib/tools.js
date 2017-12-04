const crypto = require('crypto')
const imagePattern = /!\[.*\]\((.*)\)/
const { langMarkupPattern, globalLangMarkupPattern } = require('../client/app/shared')

module.exports = {
  hashify: str => {
    const shasum = crypto.createHash('sha1')
    shasum.update(str)
    return shasum.digest('hex')
  },

  extratFirstImageUrlFromMarkdown: markdown => {
    const match = markdown.match(imagePattern)
    return match && match[1]
  },

  splitContentByLang: markdown => {
    const partsByLang = {}
    const parts = markdown.split(globalLangMarkupPattern)

    // Discard the part before the first language markup
    parts.shift()

    while (parts.length > 0) {
      let lang = parts.shift().toLowerCase()
      let part = parts.shift().trim()
      partsByLang[lang] = part
    }

    return partsByLang
  }
}
