/* global Git */

var router = require('express').Router()
const removeMd = require('remove-markdown')
var renderer = require('../lib/renderer')
var models = require('../lib/models')
var corsEnabler = require('../lib/cors-enabler')
var app = require('../lib/app').getInstance()
var log = require('../lib/log')
var { extratFirstImageUrlFromMarkdown, splitContentByLang } = require('../lib/tools')

var publicHost = app.locals.config.get('server').publicHost
var appTitle = app.locals.config.get('application').title
var proxyPath = app.locals.config.getProxyPath()
const redirectPattern = /^#REDIRECT\[\[([\w-]+)\]\]$/

models.use(Git)

router.get('/', _getIndex)
router.get('/wiki', _getWiki)
router.options('/wiki/:page', corsEnabler)
router.get('/wiki/:page', corsEnabler, _getWikiPage)
router.get('/wiki/:page/history', _getHistory)
router.get('/wiki/:page/edit', _redirectEdit)
router.get('/wiki/:page/:version', _getWikiPage)
router.get('/wiki/:page/compare/:revisions', _getCompare)

function _getHistory (req, res) {
  var page = new models.Page(req.params.page)

  page.fetch().then(function () {
    return page.fetchHistory()
  }).then(function (history) {
    // FIXME better manage an error here
    if (!page.error) {
      res.render('history', {
        items: history,
        title: 'History of ' + page.name,
        page: page
      })
    } else {
      res.locals.title = '404 - Not found'
      res.statusCode = 404
      res.render('404.jade')
    }
  })
}

function _getWiki (req, res) {
  var items = []
  var pagen = 0 | req.query.page

  var pages = new models.Pages()

  pages.fetch(pagen).then(function () {
    pages.models.forEach(function (page) {
      if (!page.error) {
        items.push({
          page: page,
          hashes: page.hashes.length === 2 ? page.hashes.join('..') : ''
        })
      }
    })

    res.render('list', {
      items: items,
      title: 'All the pages',
      pageNumbers: Array.apply(null, Array(pages.totalPages)).map(function (x, i) {
        return i + 1
      }),
      pageCurrent: pages.currentPage
    })
  }).catch(function (ex) {
    console.log(ex)
  })
}

function _getWikiPage (req, res) {
  var page = new models.Page(req.params.page, req.params.version)

  page.fetch().then(function () {
    if (!page.error) {
      res.locals.canEdit = true
      if (page.revision !== 'HEAD' && page.revision !== page.hashes[0]) {
        res.locals.warning = "You're not reading the latest revision of this page, which is " + "<a href='" + page.urlForShow() + "'>here</a>."
        res.locals.canEdit = false
      }

      res.locals.notice = req.session.notice
      delete req.session.notice

      const redirectData = page.content.match(redirectPattern)

      if (redirectData && req.query.redirect !== 'false') {
        const distinationPage = redirectData[1]
        var distination = `/wiki/${distinationPage}`
        if (req._parsedUrl.query) distination += `?${req._parsedUrl.query}`
        return res.redirect(distination)
      }

      var contentHtml = renderer.render(page.content)

      var html = `
      <section id="title-wrapper">
        <h1>${page.title}</h1>
        <ul id="page-controls"></ul>
      </section>
      <section id="inner-content-wrapper">
        ${contentHtml}
      </section>
      `

      // If a lang is passed in the URL,
      // take only the language part into account to build the meta headers
      const lang = req.query.lang || 'en'
      const langParts = splitContentByLang(page.content)
      const langContent = (langParts && langParts[lang]) || page.content

      const description = removeMd(langContent)
        .trim()
        .replace(/\n/g, ' — ')
        .replace(/—\s+—/g, '—')
        .slice(0, 250)

      const data = {
        page,
        title: page.title + ' – ' + appTitle,
        url: publicHost + '/wiki/' + page.wikiname,
        description,
        image: extratFirstImageUrlFromMarkdown(langContent),
        content: html
      }

      res.render('show', data)
    } else {
      if (req.user) {
        // Try sorting out redirect loops with case insentive fs
        // Path 'xxxxx.md' exists on disk, but not in 'HEAD'.
        if (/but not in 'HEAD'/.test(page.error)) {
          page.setNames(page.name.slice(0, 1).toUpperCase() + page.name.slice(1))
        }
        res.redirect(page.urlFor('new'))
      } else {
        // Special case for the index page, anonymous user and an empty docbase
        if (page.isIndex()) {
          res.render('welcome', {
            title: 'Welcome to ' + app.locals.config.get('application').title
          })
        } else {
          res.locals.title = '404 - Not found'
          res.statusCode = 404
          res.render('404.jade')
          return
        }
      }
    }
  })
}

function _getCompare (req, res) {
  var revisions = req.params.revisions

  var page = new models.Page(req.params.page)

  page.fetch().then(function () {
    return page.fetchRevisionsDiff(revisions)
  }).then(function (diff) {
    if (!page.error) {
      var lines = []
      diff.split('\n').slice(4).forEach(function (line) {
        if (line.slice(0, 1) !== '\\') {
          lines.push({
            text: line,
            ldln: leftDiffLineNumber(0, line),
            rdln: rightDiffLineNumber(0, line),
            className: lineClass(line)
          })
        }
      })

      var revs = revisions.split('..')
      res.render('compare', {
        page: page,
        lines: lines,
        title: 'Revisions compare',
        revs: revs
      })
    } else {
      res.locals.title = '404 - Not found'
      res.statusCode = 404
      res.render('404.jade')
      return
    }
  })

  var ldln = 0
  var cdln

  function leftDiffLineNumber (id, line) {
    var li

    switch (true) {
      case line.slice(0, 2) === '@@':
        li = line.match(/\-(\d+)/)[1]
        ldln = parseInt(li, 10)
        cdln = ldln
        return '...'

      case line.slice(0, 1) === '+':
        return ''

      case line.slice(0, 1) === '-':
      default:
        ldln++
        cdln = ldln - 1
        return cdln
    }
  }

  var rdln = 0
  function rightDiffLineNumber (id, line) {
    var ri

    switch (true) {
      case line.slice(0, 2) === '@@':
        ri = line.match(/\+(\d+)/)[1]
        rdln = parseInt(ri, 10)
        cdln = rdln
        return '...'

      case line.slice(0, 1) === '-':
        return ' '

      case line.slice(0, 1) === '+':
      default:
        rdln += 1
        cdln = rdln - 1
        return cdln
    }
  }

  function lineClass (line) {
    if (line.slice(0, 2) === '@@') {
      return 'gc'
    }
    if (line.slice(0, 1) === '-') {
      return 'gd'
    }
    if (line.slice(0, 1) === '+') {
      return 'gi'
    }
  }
}

function _getIndex (req, res) {
  res.redirect(proxyPath + '/wiki/' + app.locals.config.get('pages').index)
}

function _redirectEdit (req, res) {
  res.redirect(`${proxyPath}/pages/${req.params.page}/edit`)
}

module.exports = router
