var utils = require('./utils')
var pagesExistanceMap = require('./existance').pagesExistanceMap

var tagMap = {}

// Yields the content with the rendered [[bracket tags]]
// The rules are the same for Gollum https://github.com/github/gollum
var extractTags = function (text) {
  tagMap = {}

  var matches = text.match(/\[\[(.+?)\]\]/g)
  var tag, id

  if (matches) {
    matches.forEach(function (match) {
      match = match.trim()
      tag = /(.?)\[\[(.+?)\]\](.?)/.exec(match)
      if (tag[1] === "'") return
      id = utils.hashCode(tag[2])
      tagMap[id] = tag[2]
      text = text.replace(tag[0], id)
    })
  }
  return text
}

var evalTags = function (text) {
  var parts, name, url, pageName, re, urlHash, wikiName, absent

  for (var k in tagMap) {
    if (tagMap.hasOwnProperty(k)) {
      parts = tagMap[k].split('|')
      // Parts are inverted comparing to claudioc/jingo
      // to match the order in Wikipedia: [[page name|text to display]]
      pageName = name = parts[0].trim()
      if (parts[1]) name = parts[1].trim()
      pageName = pageName.split('#')[0]
      urlHash = pageName.split('#')[1]
      // Build the url without the hash to avoid getting the '#' escaped
      wikiName = utils.wikify(pageName)

      if (pagesExistanceMap[wikiName] != null && !pagesExistanceMap[wikiName]) {
        absent = 'absent'
      } else {
        absent = ''
      }

      url = '/wiki/' + wikiName
      // Then, re-add it
      if (urlHash) url += '#' + urlHash

      tagMap[k] = '<a class="internal ' + absent + '" href="' + url + '">' + name + '</a>'
    }
  }

  for (k in tagMap) {
    if (tagMap.hasOwnProperty(k)) {
      re = new RegExp(k, 'g')
      text = text.replace(re, tagMap[k])
    }
  }

  return text
}

module.exports = function (text) {
  return evalTags(extractTags(text))
}
