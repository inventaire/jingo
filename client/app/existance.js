var pagesExistanceMap = {}

var utils = require('./utils')

function updateKnownPages ($el, knownPages) {
  knownPages.forEach(function (page) {
    var pageExists = pagesExistanceMap[page]
    if (!pageExists) displayAsAbsent($el, page)
  })
}

function displayAsAbsent ($el, page) {
  var name = page.split('#')[0]
  var hash = page.split('#')[1]
  var url = '/wiki/' + encodeURIComponent(name)
  if (hash) url += '#' + hash
  var $link = $el.find("a[href='" + url + "']")
  if (!$link.hasClass('absent')) $link.addClass('absent')
}

var lazyUpdateKnownPages = utils.debounce(updateKnownPages, 400)

module.exports = {
  pagesExistanceMap: pagesExistanceMap,
  markMissingPagesAsAbsent: function (selector) {
    var missingPages = []
    var knownPages = []
    var match
    var href
    var page
    // Also accept elements
    var $el = $(selector)

    $(selector).find('a.internal').each(function (i, a) {
      href = $(a).attr('href')
      match = /\/wiki\/(.+)/.exec(href)
      if (match) {
        page = decodeURIComponent(match[1])
        if (pagesExistanceMap[page] != null) {
          knownPages.push(page)
        } else {
          missingPages.push(page)
        }
      }
    })

    if (missingPages.length === 0) return lazyUpdateKnownPages($el, knownPages)

    $.getJSON('/misc/existence', {data: missingPages}, function (result) {
      var confirmedMissingPages = result.data
      missingPages.forEach(function (page) {
        if (confirmedMissingPages.indexOf(page) === -1) {
          pagesExistanceMap[page] = true
        } else {
          displayAsAbsent($el, page)
          pagesExistanceMap[page] = false
        }
      })
      lazyUpdateKnownPages($el, knownPages)
    })
  }
}

