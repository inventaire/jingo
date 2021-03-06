/* global Git */

var router = require('express').Router()
var namer = require('../lib/namer')
var app = require('../lib/app').getInstance()
var models = require('../lib/models')
var components = require('../lib/components')
var log = require('../lib/log')
var errors_ = require('../lib/errors')

var { title:appTitle } = app.locals.config.get('application')

models.use(Git)

router.get('/pages/new', _getPagesNew)
router.get('/pages/new/:page', _getPagesNew)
router.get('/pages/:page', _redirectPage)
router.get('/pages/:page/edit', _getPagesEdit)
router.post('/pages', _postPages)
router.put('/pages/:page', _putPages)
router.delete('/pages/:page', _deletePages)
router.get('/pages/:page/revert/:version', _getRevert)

var pagesConfig = app.locals.config.get('pages')
var proxyPath = app.locals.config.getProxyPath()

function _deletePages (req, res) {
  var page = new models.Page(req.params.page)

  if (page.isIndex() || !page.exists()) {
    req.session.notice = 'The page cannot be deleted.'
    res.redirect(proxyPath + '/')
    return
  }

  page.author = req.user.asGitAuthor

  page.remove().then(function () {
    page.unlock()

    if (page.isFooter()) {
      app.locals._footer = null
    }

    if (page.isSidebar()) {
      app.locals._sidebar = null
    }

    req.session.notice = 'The page `' + page.wikiname + '` has been deleted.'
    res.redirect(proxyPath + '/')
  })
}

function _getPagesNew (req, res) {
  var page
  var title = ''

  if (req.params.page) {
    // This is not perfect, unfortunately
    title = namer.unwikify(req.params.page)
    page = new models.Page(title)
    if (page.exists()) {
      res.redirect(page.urlForShow())
      return
    }
  }

  res.locals.errors = req.session.errors
  res.locals.formData = req.session.formData || {}
  delete req.session.errors
  delete req.session.formData

  res.render('create', {
    title: `${appTitle} – Create page ${title}`,
    pageTitle: title,
    pageName: page ? page.wikiname : ''
  })
}

function _postPages (req, res) {
  var errors,
    pageName

  if (pagesConfig.title.fromFilename) {
    // pageName (from url) is not considered
    pageName = req.body.pageTitle
  } else {
    // pageName (from url) is more important
    pageName = (namer.unwikify(req.body.pageName) || req.body.pageTitle)
  }

  var page = new models.Page(pageName)

  req.check('pageTitle', 'The page title cannot be empty').notEmpty()
  req.check('content', 'The page content cannot be empty').notEmpty()

  errors = req.validationErrors()

  if (errors) {
    req.session.errors = errors
    // If the req.body is too big, the cookie session-store will crash,
    // logging out the user. For this reason we use the sessionStorage
    // on the client to save the body when submitting
    //    req.session.formData = req.body;
    req.session.formData = {
      pageTitle: req.body.pageTitle
    }
    res.redirect(page.urlForNewWithError())
    return
  }

  req.sanitize('pageTitle').trim()
  req.sanitize('pageTitle').escape()
  req.sanitize('content').trim()
  req.sanitize('content').removeScriptTags()

  if (page.exists()) {
    req.session.errors = [{msg: 'A document with this title already exists'}]
    res.redirect(page.urlFor('new'))
    return
  }

  page.author = req.user.asGitAuthor
  page.title = req.body.pageTitle
  page.content = cleanupContent(req.body.content)

  page.save().then(function () {
    req.session.notice = 'The page has been created. <a href="' + page.urlForEdit() + '">Edit it again?</a>'
    res.redirect(page.urlForShow())
  }).catch(function (err) {
    errors_.send500(res, err, 'pages _postPages err')
  })
}

function _putPages (req, res) {
  var errors,
    page

  page = new models.Page(req.params.page)

  req.check('pageTitle', 'The page title cannot be empty').notEmpty()
  req.check('content', 'The page content cannot be empty').notEmpty()

  errors = req.validationErrors()

  if (errors) {
    fixErrors()
    return
  }

  // Highly unluckly (someone deleted the page we were editing)
  if (!page.exists()) {
    req.session.notice = 'The page does not exist anymore.'
    res.redirect(proxyPath + '/')
    return
  }

  req.sanitize('pageTitle').trim()
  req.sanitize('pageTitle').escape()
  req.sanitize('content').trim()
  req.sanitize('content').removeScriptTags()
  req.sanitize('message').trim()
  req.sanitize('message').escape()

  page.author = req.user.asGitAuthor

  // Test if the user changed the name of the page and try to rename the file
  // If the title is from filename, we cannot overwrite an existing filename
  // If the title is from content, we never rename a file and the problem does not exist
  if (app.locals.config.get('pages').title.fromFilename &&
      page.name.toLowerCase() !== req.body.pageTitle.toLowerCase()) {
    page.renameTo(req.body.pageTitle)
          .then(savePage)
          .catch(function (ex) {
            errors = [{
              param: 'pageTitle',
              msg: 'A page with this name already exists.',
              value: ''
            }]
            fixErrors()
          })
  } else {
    savePage()
  }

  function savePage () {
    page.title = req.body.pageTitle
    page.content = req.body.content
    page.save(req.body.message).then(function () {
      page.unlock()

      if (page.name === '_footer') {
        components.expire('footer')
      }

      if (page.name === '_sidebar') {
        components.expire('sidebar')
      }

      req.session.notice = 'The page has been updated. <a href="' + page.urlForEdit() + '">Edit it again?</a>'
      res.redirect(page.urlForShow())
    }).catch(function (err) {
      errors_.send500(res, err, 'pages savePage err')
    })
  }

  function fixErrors () {
    req.session.errors = errors
    // If the req.body is too big, the cookie session-store will crash,
    // logging out the user. For this reason we use the sessionStorage
    // on the client to save the body when submitting
    //    req.session.formData = req.body;
    req.session.formData = {
      pageTitle: req.body.pageTitle,
      message: req.body.message
    }
    res.redirect(page.urlForEditWithError())
  }
}

const cleanupContent = content => {
  return content
  .split('\n')
  // Somewhere, somehow, lines get prefixed by a white space
  // so this drops it, unless its a
  .map(line => line.replace(/^\s+([^\s*\-])/, '$1'))
  .join('\n')
}

function _redirectPage (req, res) {
  res.redirect(`${proxyPath}/wiki/${req.params.page}`)
}

function _getPagesEdit (req, res) {
  var page = new models.Page(req.params.page)
  var warning

  if (!page.lock(req.user)) {
    warning = 'Warning: this page is probably being edited by ' + page.lockedBy.displayName
  }

  models.repositories.refreshAsync().then(function () {
    return page.fetch()
  }).then(function () {
    if (!req.session.formData) {
      res.locals.formData = {
        pageTitle: page.title,
        content: cleanupContent(page.content)
      }
    } else {
      res.locals.formData = req.session.formData
      // FIXME remove this when the sessionStorage fallback will be implemented
      if (!res.locals.formData.content) {
        res.locals.formData.content = page.content
      }
    }

    res.locals.errors = req.session.errors

    delete req.session.errors
    delete req.session.formData

    var title = `${appTitle} – Edit page ${page.title}`

    res.render('edit', { title, page, warning })
  })
}

function _getRevert (req, res) {
  var page = new models.Page(req.params.page, req.params.version)

  page.author = req.user.asGitAuthor

  page.fetch().then(function () {
    if (!page.error) {
      page.revert()
      res.redirect(page.urlFor('history'))
    } else {
      errors_.send500(res, null, 'pages _getRevert')
    }
  })
}

module.exports = router
