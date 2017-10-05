/* global jQuery */

var utils = require('./utils')
var renderTags = require('./render_tags')
var existance = require('./existance')
var init = require('./init')

var cheatsheetShown = false

var proxyPath

var Jingo = window.Jingo = {
  init: function (setProxyPath) {
    proxyPath = setProxyPath

    init.setFocus()
    init.setLoginRedirection()
    init.confirmations()
    init.checkboxes()
    init.highlightQueryTerm()

    var pathname = window.location.pathname

    if (/^\/pages\/.*\/edit/.test(pathname) || /^\/pages\/new/.test(pathname)) {
      init.initEditPage()
    }

    if (/^\/wiki\//.test(pathname)) {
      existance.markMissingPagesAsAbsent('#content')
    }
  },

  initSimpleMDE: function () {
    var simplemde = new SimpleMDE({
      element: document.getElementById('editor'),
      spellChecker: false,
      autoDownloadFontAwesome: false,
      promptURLs: true,
      status: false,
      previewRender: Jingo.previewRender
    })

    var $toolbar = $('.editor-toolbar')
    var $messageGroup = $('#message').parent()
    var $saveGroup = $('.well')
    var lastToolbarState

    // Keep the message input and save and cancel buttons visible
    // when in fullscreen
    var updateMessageAndSave = function(){
      var isFullScreen = $toolbar.hasClass('fullscreen')
      if (isFullScreen !== lastToolbarState) {
        lastToolbarState = isFullScreen
        if (isFullScreen) {
          $messageGroup.addClass('fullscreen')
          $saveGroup.addClass('fullscreen')
        } else {
          $messageGroup.removeClass('fullscreen')
          $saveGroup.removeClass('fullscreen')
        }
      }
    }

    simplemde.codemirror.on('update', utils.debounce(updateMessageAndSave, 50))

    // Listen for key events that aren't handled by SimpleMDE
    $('#content').keydown(function (e) {
      // Ctrl+Enter
      if (e.ctrlKey && e.keyCode === 13) Jingo.save()
      // Esc
      if (e.keyCode === 27) Jingo.cancel()
    })
  },

  // SimpleMDE links to its own syntax guide
  customizeSyntaxGuide: function () {
    $el = $('a[title="Markdown Guide"]')
    $el[0].title = 'Syntax Guide'
    $el[0].removeAttribute('href')
    $el.click(Jingo.markdownSyntax)
  },

  markdownSyntax: function () {
    $('#syntax-reference').modal({keyboard: true, show: true, backdrop: false})
    if (!cheatsheetShown) {
      $('#syntax-reference .modal-body').load(proxyPath + '/misc/syntax-reference')
      cheatsheetShown = true
    }
  },

  previewRender: function(plainText, previewEL) {
    // Trigger after the DOM was updated
    setTimeout(existance.markMissingPagesAsAbsent.bind(null, previewEL), 10)
    var html = SimpleMDE.prototype.markdown(renderTags(plainText))
    var defaultTitle = $('#pageTitle')[0].value
    return require('./add_language_section_titles')(html, defaultTitle)
  },

  save: function () {
    $('form.edit').submit()
  },

  cancel: function () {
    $('.cancel')[0].click()
  }
}
