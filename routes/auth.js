var router = require('express').Router()
var app = require('../lib/app').getInstance()
var auth = app.locals.config.get('authentication')
var passport = app.locals.passport
var localStrategy = require('../lib/auth/local-strategy')
var proxyPath = app.locals.config.getProxyPath()
var redirectURL
var _getLogin = require('../lib/auth/login')
var _getLogout = require('../lib/auth/logout')
var _getAuthDone = require('../lib/auth/get-auth-done')
var chalk = require('chalk')

router.get('/login', _getLogin)
router.get('/logout', _getLogout)
router.post('/login', passport.authenticate('local', {
  successRedirect: proxyPath + '/auth/done',
  failureRedirect: proxyPath + '/login',
  failureFlash: true
}))
router.get('/auth/done', _getAuthDone)

passport.use(localStrategy)

passport.serializeUser(function (user, done) {
  chalk.green('serializeUser', user)
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  if (!user.displayName && user.username) {
    user.displayName = user.username
  }

  user.asGitAuthor = user.displayName + ' <' + user._id + '@inventaire.io>'
  chalk.green('deserializeUser', user)
  done(null, user)
})

module.exports = router
