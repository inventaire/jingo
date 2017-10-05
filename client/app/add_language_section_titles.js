var langMarkupPattern = /<!--\s?LANG:(\w{2}).*title="(.*)"\s?-->/g

var langMap = require('../multilang/lang_map')

var langTitle = '<h2 class="lang-section-header"></h2>'

module.exports = function (html) {
  var matches = html.match(langMarkupPattern)
  matches.forEach(function (match) {
    var lang = match.match(/LANG:(\w{2})/)[1]
    var title = match.match(/title="(.*)"/)[1]
    html = html.replace(match, langSectionTitle(lang, title))
  })
  return html
}

function langSectionTitle (lang, title) {
  var langLabel = langMap[lang.toLowerCase()]
  return '<h2 class="lang-section-header" title="'+ lang + '">' + langLabel + ': ' + title +'</h2>'
}
