var app = require('../app').getInstance()
var auth = app.locals.config.get('authentication')
var proxyPath = app.locals.config.getProxyPath()

module.exports = function _getAuthDone (req, res) {
  if (!res.locals.user) {
    res.redirect(proxyPath + '/')
    return
  }

  var dst = req.session.redirectTo || req.session.destination || proxyPath + '/'
  delete req.session.redirectTo
  delete req.session.destination
  res.redirect(dst)
}
