var setLastLang = require('./lang_helpers').setLastLang
var contentHelpers = require('./content_helpers')
var buildLangSelector = contentHelpers.buildLangSelector
var scrollToHashSection = contentHelpers.scrollToHashSection
var updateUrl = contentHelpers.updateUrl
var updateTitle = contentHelpers.updateTitle

var $content = $('#content')
var $innerContentWrapper = $('#inner-content-wrapper')
var $h1 = require('./common_elements').$h1
var $pageControls = $('#page-controls')
var pageControlsToolsHtml = $('#page-controls-tools').html()
var originalHash = window.location.hash

var parsedData = require('./get_parsed_data')()

var updateContent = function (desiredLang) {
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

module.exports = updateContent
