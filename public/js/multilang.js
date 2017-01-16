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

  // Those are the active languages in inventaire
  // https://github.com/inventaire/inventaire-client/blob/943fe11140ade7a0f966aebbc9097d9d974e3cf8/app/lib/languages_data.coffee
  var langMap = {
    da: 'Dansk',
    de: 'Deutsch',
    en: 'English',
    es: 'Español',
    fr: 'Français',
    it: 'Italiano',
    ja: '日本語',
    no: 'Norsk',
    pl: 'Polski',
    pt: 'Português',
    sv: 'Svenska'
  }

  var originalTitle = window.document.title.split(' – ')[0]

  var $content = $('#content')
  var $innerContentWrapper = $('#inner-content-wrapper')
  var $h1 = $('#title-wrapper h1')
  var $pageControls = $('#page-controls')
  var pageControlsToolsHtml = $('#page-controls-tools').html()
  var originalHash = window.location.hash

  var parsedData = getParsedData()

  updateContent(guessLang())

  // Helpers

  function updateContent (desiredLang) {
    var langData = parsedData.langsData[desiredLang] || parsedData.langsData.en

    updateUrl(langData.lang)
    updateTitle(langData.title)

    if (langData && langData.title) {
      $h1.text(langData.title)
    } else {
      $h1.text(parsedData.h1)
    }

    var selectorLi = buildLangSelector(parsedData.langsData, desiredLang)
    $pageControls.html(selectorLi + pageControlsToolsHtml)

    // Started with the class hidden to avoid displaying the full content
    // before cutting it
    $content.removeClass('hidden')

    // Listen for language change
    $content.find('.lang-selector').on('change', updateContentOnLangChange)

    // Update inner content html
    var updatedHtml = (langData && langData.html) || ''
    $innerContentWrapper.html(updatedHtml)

    // Then, once the DOM is ready, scroll to hash
    // as we were messing with the DOM when the browser tryed
    scrollToHashSection(originalHash)
  }

  function updateContentOnLangChange (event) {
    var lang = event.currentTarget.value
    setLastLang(lang)
    updateContent(lang)
  }

  function getParsedData () {
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
    var headerParts = header.split(',').map(trim)
    var lang = headerParts[0]
    var metadata = headerParts[1]

    langData.lang = lang.slice(0, 2).toLowerCase()
    metadata = parseKeyValueString(metadata)
    langData.title = metadata.title
    langData.html = html.trim()

    return langData
  }

  function trim (str) { return str.trim() }

  function trimQuotes (str) {
    return str
    .trim()
    .replace(/^"/, '')
    .replace(/"$/, '')
  }

  function parseKeyValueString (str) {
    var data = {}

    if (!str) return data

    str
    .split('&')
    .forEach(function (param) {
      var paramsParts = param.split('=')
      var key = paramsParts[0]
      var value = trimQuotes(paramsParts[1])
      data[key] = value
    })

    return data
  }

  // Lang helpers

  function guessLang () {
    var browserLang = navigator.language || navigator.userLanguage
    browserLang = browserLang.slice(0, 2).toLowerCase()

    var queryStringData = parseKeyValueString(window.location.search.slice(1))
    var queryStringLang = queryStringData.lang

    return queryStringLang || getLastLang() || browserLang
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
  }

  function scrollToHashSection (hash) {
    if (hash && hash.length > 0) window.location.hash = hash
  }

  function updateUrl (lang) {
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
  }

  function updateTitle (pageTitle) {
    var currentTitleParts = window.document.title.split(' – ')
    pageTitle = pageTitle || originalTitle
    window.document.title = pageTitle + ' – ' + currentTitleParts[1]
  }

})()
