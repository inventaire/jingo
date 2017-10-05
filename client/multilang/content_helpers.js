var langMap = require('./lang_map')
var originalTitle = window.document.title.split(' – ')[0]

module.exports = {
  buildLangSelector: function (langsData, selectedLang) {
    var optionsHtml = ''
    var availableLangs = Object.keys(langsData)
    if (availableLangs.length === 0) {
      return '<a href="/wiki/wiki-how-to#language-markups" class="lang-selector absent" title="">missing language markups</a>'
    }

    availableLangs.forEach(function (lang) {
      var innerOption = langMap[lang] || lang
      var attributes = 'value="' + lang + '" '
      if (lang === selectedLang) attributes += 'selected'
      optionsHtml += '<option ' + attributes + '>' + innerOption + '</option>'
    })

    var selector = '<select class="lang-selector">' + optionsHtml + '</select>'
    return '<li>' + selector + '</li>'
  },

  scrollToHashSection: function (hash) {
    if (hash && hash.length > 0) window.location.hash = hash
  },

  updateUrl: function (lang) {
    if (window.history.pushState && lang && lang.length === 2) {
      // source: https://developer.mozilla.org/en-US/docs/Web/API/History_API
      var stateObj = {}
      var currentPath = location.pathname + location.search
      var newPath = location.pathname + '?lang=' + lang

      // Case when hitting previous
      if (currentPath === newPath) return

      stateObj[currentPath] = newPath

      var initialLocation = location.search === ''
      var fnName = initialLocation ? 'replaceState' : 'pushState'

      history[fnName](stateObj, '', newPath);
    }
  },

  updateTitle: function (pageTitle) {
    var currentTitleParts = window.document.title.split(' – ')
    pageTitle = pageTitle || originalTitle
    window.document.title = pageTitle + ' – ' + currentTitleParts[1]
  }
}
