var app = require('../app').getInstance()
var proxyPath = app.locals.config.getProxyPath()

module.exports = function _getLogout (req, res) {
  req.logout()
  req.session = null
  res.redirect(proxyPath + '/')
}
