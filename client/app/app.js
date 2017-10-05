/* global jQuery */

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
      init.editPage()
    }

    if (/^\/wiki\//.test(pathname)) {
      existance.markMissingPagesAsAbsent('#content')
    }
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
    return SimpleMDE.prototype.markdown(renderTags(plainText))
  },

  save: function () {
    $('form.edit').submit()
  }
}
