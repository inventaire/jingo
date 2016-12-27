var app = require('../app').getInstance()
var auth = app.locals.config.get('authentication')

module.exports = function _getLogin (req, res) {
  req.session.destination = req.query.destination

  if (req.session.destination === '/login') {
    req.session.destination = '/'
  }

  res.locals.errors = req.flash()

  res.render('login', {
    title: app.locals.config.get('application').title,
    auth: auth
  })
}
