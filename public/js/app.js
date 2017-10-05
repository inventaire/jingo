/* global jQuery */
!(function (window, $, undefined) { // eslint-disable-line
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
        markMissingPagesAsAbsent('#content')
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
      const text = evalTags(extractTags(plainText))
      return SimpleMDE.prototype.markdown(text)
    },

    save: function () {
      $('form.edit').submit()
    }
  }

  function markMissingPagesAsAbsent (selector) {
    var pages = []
    var match
    var href
    // Also accept elements
    var $el = $(selector)

    $(selector).find('a.internal').each(function (i, a) {
      href = $(a).attr('href')
      href = href.slice(proxyPath.length)
      match = /\/wiki\/(.+)/.exec(href)
      if (match) {
        pages.push(decodeURIComponent(match[1]))
      }
    })

    $.getJSON(proxyPath + '/misc/existence', {data: pages}, function (result) {
      $.each(result.data, function (href, a) {
        var name = a.split('#')[0]
        var hash = a.split('#')[1]
        var url = proxyPath.split('/').join('\\/') + '\\/wiki\\/' + encodeURIComponent(name)
        if (hash) url += '#' + hash
        $el.find("a[href='" + url + "']").addClass('absent')
      })
    })
  }

  var tagmap = {}

  // Yields the content with the rendered [[bracket tags]]
  // The rules are the same for Gollum https://github.com/github/gollum
  function extractTags (text) {
    tagmap = {}

    var matches = text.match(/\[\[(.+?)\]\]/g)
    var tag, id

    if (matches) {
      matches.forEach(function (match) {
        match = match.trim()
        tag = /(.?)\[\[(.+?)\]\](.?)/.exec(match)
        if (tag[1] === "'") return
        id = hashCode(tag[2])
        tagmap[id] = tag[2]
        text = text.replace(tag[0], id)
      })
    }
    return text
  }

  function evalTags (text) {
    var parts, name, url, pageName, re, urlHash

    for (var k in tagmap) {
      if (tagmap.hasOwnProperty(k)) {
        parts = tagmap[k].split('|')
        // Parts are inverted comparing to claudioc/jingo
        // to match the order in Wikipedia: [[page name|text to display]]
        pageName = name = parts[0].trim()
        if (parts[1]) {
          name = parts[1].trim()
        }
        pageName = pageName.split('#')[0]
        urlHash = pageName.split('#')[1]
        // Build the url without the hash to avoid getting the '#' escaped
        url = wikify(pageName)
        // Then, re-add it
        if (urlHash) url += '#' + urlHash

        tagmap[k] = '<a class="internal" href="' + url + '">' + name + '</a>'
      }
    }

    for (k in tagmap) {
      if (tagmap.hasOwnProperty(k)) {
        re = new RegExp(k, 'g')
        text = text.replace(re, tagmap[k])
      }
    }

    return text
  }

  function wikify (str) {
    if (typeof str !== 'string' || str.trim() === '') return ''

    var spaceReplacement = '-'

    str = str
      // Replace < and > with '' (Gollum replaces it with '-')
      .replace(/[<>]/g, '')
      // Replace / with '+' (Gollum replaces it with '')
      .replace(/\//g, '+')
      .trim()
      .replace(/\s/g, spaceReplacement)

    return '/wiki/' + str
  }

  // adapted from http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
  function hashCode (string) {
    var hash = 0
    var i = 0
    var len = string.length
    if (len === 0) return hash

    var char

    while (i < len) {
      char = string.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      // Convert to 32bit integer
      hash |= 0
      i++
    }

    return Math.abs(hash)
  }

  window.Jingo = Jingo
}(this, jQuery))
