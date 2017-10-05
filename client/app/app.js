/* global jQuery */

var renderTags = require('./render_tags')
var existance = require('./existance')

var cheatsheetShown = false

var $toolbar

var proxyPath

var Jingo = {

  init: function (setProxyPath) {
    proxyPath = setProxyPath

    var navh = $('.navbar').height()
    var $tools = $('.tools')
    var qs
    var hl = null

    if (window.location.search !== '') {
      $('input[name=term]').focus()
      qs = $.map(window.location.search.substr(1).split('&'), function (kv) {
        kv = kv.split('=')
        return { k: kv[0], v: decodeURIComponent(kv[1]) }
      })
      $.each(qs, function (i, t) {
        if (t.k === 'hl') {
          hl = t.v
        }
      })
      if (hl) {
        if (window.find && window.getSelection) {
          document.designMode = 'on'
          var sel = window.getSelection()
          sel.collapse(document.body, 0)
          while (window.find(hl)) {
            document.execCommand('HiliteColor', false, 'yellow')
            sel.collapseToEnd()
          }
          sel.collapse(document.body, 0)
          window.find(hl)
          sel.collapseToEnd()
          document.designMode = 'off'
        } else {
          if (document.body.createTextRange) {
            var textRange = document.body.createTextRange()
            while (textRange.findText(hl)) {
              textRange.execCommand('BackColor', false, 'yellow')
              textRange.collapse(false)
            }
          }
        }
      }
    }

    $('#login').attr('href', function () {
      return $(this).attr('href').replace('destination', 'destination=' + encodeURIComponent(window.location.pathname))
    })

    $('.confirm-delete-page').on('click', function (evt) {
      return window.confirm('Do you really want to delete this page?')
    })

    $('.confirm-revert').on('click', function (evt) {
      return window.confirm('Do you really want to revert to this revision?')
    })

    var $hCol1 = $('.history td:first-child')

    if ($('#content').hasClass('edit')) {
      $('#editor').focus()
    } else {
      $('#pageTitle').focus()
    }

    $('#rev-compare').attr('disabled', true)

    toggleCompareCheckboxes()
    $hCol1.find('input').on('click', function () {
      toggleCompareCheckboxes()
    })

    $('#rev-compare').on('click', function () {
      if ($hCol1.find(':checked').length < 2) {
        return false
      }
      window.location.href = proxyPath + '/wiki/' + $(this).data('pagename') + '/compare/' + $hCol1.find(':checked').map(function () { return $(this).val() }).toArray().reverse().join('..')
      return false
    })

    if (/^\/pages\/.*\/edit/.test(window.location.pathname) ||
        /^\/pages\/new/.test(window.location.pathname)) {
      $('#editor').closest('form').on('submit', function () {
        if (Jingo.cmInstance) {
          Jingo.cmInstance.save()
        }
        window.sessionStorage.setItem('jingo-page', $('#editor').val())
      })
      if (window.location.search === '?e=1') {
        // Edit page in error: restore the body
        var content = window.sessionStorage.getItem('jingo-page')
        if (content) {
          $('#editor').val(content)
        }
      } else {
        window.sessionStorage.removeItem('jingo-page')
      }
    }

    if (/^\/wiki\//.test(window.location.pathname)) {
      existance.markMissingPagesAsAbsent('#content')
    }

    function toggleCompareCheckboxes () {
      $('#rev-compare').attr('disabled', true)

      if ($hCol1.find(':checkbox').length === 1) {
        $hCol1.find(':checkbox').hide()
        return
      }
      if ($hCol1.find(':checked').length === 2) {
        $('#rev-compare').attr('disabled', false)
        $hCol1.find(':not(:checked)')
              .hide()
        $hCol1.parent('tr')
              .css({'color': 'silver'})
        $hCol1.find(':checked')
              .parents('tr')
              .css({'color': 'black'})
      } else {
        $hCol1.find('input')
              .show()
              .parents('tr')
              .css({'color': 'black'})
      }
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

window.Jingo = Jingo
