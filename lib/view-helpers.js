const _ = require('lodash')
const { imgSrc } = require('inv-utils')(_)
const cacheBust = require('./cache_bust')

module.exports = function (program, app, config) {
  // Passed as arguments to avoid circular dependency with ./app.js
  const auth = config.get('authentication')
  const invHost = auth.local.inventaire.host
  return function (req, res, next) {
    res.locals = {
      get user () {
        return req.user
      },
      get appTitle () {
        return config.get('application').title
      },
      get proxyPath () {
        return config.getProxyPath()
      },
      get jingoVersion () {
        return program.version()
      },
      get authentication () {
        return config.get('authentication')
      },
      isAnonymous: function () {
        return !req.user
      },
      canSearch: function () {
        return !!req.user || app.locals.config.get('authorization').anonRead
      },
      invImgSrc: imgSrc(invHost),
      cacheBust: cacheBust,
      get isAjax () {
        return req.headers['x-requested-with'] && req.headers['x-requested-with'] === 'XMLHttpRequest'
      }
    }
    next()
  }
}
