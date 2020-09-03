var parseKeyValueString = require('./parse_key_value_string')
var commonElements = require('./common_elements')
var $h1 = commonElements.$h1
var $innerContentWrapper = commonElements.$innerContentWrapper

module.exports = function () {
  var h1 = $h1.text()

  var perLangContent = $innerContentWrapper.html().split('<!-- LANG:').slice(1)
  var data = { h1: h1, langsData: {} }

  perLangContent
  .map(parseLangContent)
  .forEach(function (langData) {
    data.langsData[langData.lang] = langData
  })

  return data
}

function parseLangContent (content) {
  var langData = {}
  var parts = content.split('-->')
  var header = parts[0]
  var html = parts[1]
  var match = header.match(/\s*(\w+),\s*(.*)/)
  var lang, metadata
  if (match) {
    lang = match[1]
    metadata = match[2]
  }

  langData.lang = lang.slice(0, 2).toLowerCase()
  metadata = parseKeyValueString(metadata)
  langData.title = metadata.title
  langData.html = html.trim()

  return langData
}

function trim (str) { return str.trim() }
