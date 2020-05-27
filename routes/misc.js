/* global Git */
var router = require('express').Router()
var renderer = require('../lib/renderer')
var fs = require('fs')
var models = require('../lib/models')
// using fs.access instead of the deprecated fs.exists:
// https://nodejs.org/api/fs.html#fs_fs_exists_path_callback
var exists = fs.promises.access

models.use(Git)

router.get('/misc/syntax-reference', _getSyntaxReference)
router.post('/misc/preview', _postPreview)
router.get('/misc/existence', _getExistence)

function _getSyntaxReference (req, res) {
  res.render('syntax')
}

function _postPreview (req, res) {
  res.render('preview', {
    content: renderer.render(req.body.data)
  })
}

function _getExistence (req, res) {
  if (!req.query.data) {
    res.json({data: []})
    return
  }

  var result = []

  Promise.all(req.query.data.map(function (pageName) {
    // Prevent passing page names with url hashes
    var cleanedName = pageName.split('#')[0]
    var page = new models.Page(cleanedName)
    return exists(page.pathname)
    .catch(function (err) {
      if (err.code === 'ENOENT') {
        // But return the names with the hash as it's what the client side asked for
        result.push(pageName)
      } else {
        console.error(err)
      }
    })
  }))
  .then(function () {
    res.json({data: result})
  })
}

router.all('*', function (req, res) {
  res.locals.title = '404 - Not found'
  res.statusCode = 404
  res.render('404.jade')
})

module.exports = router
