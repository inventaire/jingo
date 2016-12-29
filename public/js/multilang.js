// All language versions being written on the same wiki page,
// this scripts takes care of splitting the page per-language
// to display only one version at a time

// Expect language sections in the markdown with per-lang comment markups:

// <!-- LANG:EN -->
// hello
// <!-- LANG:FR, title=Accueil -->
// salut


// Avoid leaking variables to the global scope
!(function () {

  var langMap = {
    en: 'English',
    fr: 'Français',
    es: 'Español'
  }

  var $content = $('#content')
  var parsedData = getParsedData()

  updateContent(guessLang())

  // Helpers

  function updateContent (desiredLang) {
    var desiredLangData = parsedData.langsData[desiredLang]
    var updatedHtml = ''
    if (desiredLangData.title) {
      updatedHtml += '<h1>' + desiredLangData.title + '</h1>'
    } else {
      updatedHtml += parsedData.h1
    }

    updatedHtml += buildLangSelector(parsedData.langsData, desiredLang)

    updatedHtml += desiredLangData.html

    $content
    // Update html
    .html(updatedHtml)
    // Started with the class hidden to avoid displaying the full content
    // before cutting it
    .removeClass('hidden')
    // Listen for language change
    .find('.lang-selector').on('change', updateContentOnLangChange)
  }

  function updateContentOnLangChange (event) {
    var lang = event.currentTarget.value
    setLastLang(lang)
    updateContent(lang)
  }

  function getParsedData () {
    var contentHtml = $content.html()
    var parts = contentHtml.split('<!-- LANG:')
    var h1 = parts[0]
    var perLangContent = parts.slice(1)
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
    var headerParts = header.split(',').map(trim)
    var lang = headerParts[0]
    var metadata = headerParts[1]

    langData.lang = lang.slice(0, 2).toLowerCase()
    metadata = parseMetadata(metadata)
    langData.title = metadata.title
    langData.html = html.trim()

    return langData
  }

  function trim (str) { return str.trim() }

  function parseMetadata (str) {
    var metadata = {}

    if (!str) return metadata

    str
    .split('&')
    .forEach(function (param) {
      var paramsParts = param.split('=')
      var key = paramsParts[0]
      var value = paramsParts[1]
      metadata[key] = value
    })

    return metadata
  }

  // Lang helpers

  function guessLang () {
    var browserLang = navigator.language || navigator.userLanguage
    return getLastLang() || browserLang
  }

  function getLastLang () {
    // Wrap it in a try/catch as some browser don't support it
    try {
      return window.localStorage.getItem('last-lang')
    } catch (err) {
      console.error('getLastLang err', err)
    }
  }

  function setLastLang (lang) {
    // Wrap it in a try/catch as some browser don't support it
    try {
      window.localStorage.setItem('last-lang', lang)
    } catch (err) {
      console.error('setLastLang err', err)
    }
  }

  function buildLangSelector (langsData, selectedLang) {
    var optionsHtml = ''
    var availableLangs = Object.keys(langsData)

    availableLangs.forEach(function (lang) {
      var innerOption = langMap[lang]
      var attributes = 'value="' + lang + '" '
      if (lang === selectedLang) attributes += 'selected'
      optionsHtml += '<option ' + attributes + '>' + innerOption + '</option>'
    })

    return '<select class="lang-selector">' + optionsHtml + '</select>'
  }

})()
