var globalLangMarkupPattern = require('./shared').globalLangMarkupPattern
var langMap = require('../multilang/lang_map')

module.exports = function (html, defaultTitle) {
  var matches = html.match(globalLangMarkupPattern)
  matches.forEach(function (match) {
    var lang = match.match(/LANG:(\w{2})/)[1]
    var titleMatch = match.match(/title="(.*)"/)
    var title = (titleMatch && titleMatch[1]) || defaultTitle
    html = html.replace(match, langSectionTitle(lang, title))
  })
  return html
}

function langSectionTitle (lang, title) {
  var langLabel = langMap[lang.toLowerCase()] || lang
  return '<h2 class="lang-section-header" title="'+ lang + '">' + langLabel + ': ' + title +'</h2>'
}
