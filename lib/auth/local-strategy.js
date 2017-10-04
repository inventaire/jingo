var app = require('../app').getInstance()
var auth = app.locals.config.get('authentication')
var passportLocal = require('passport-local')
var got = require('got')
var userPicture = require('../user-picture')
var log = require('../log')

function getUser (username, password, done) {
  inventaireLogin(username, password)
  .then((user) => {
    log.success(user, 'user')
    if (user) {
      done(null, user)
    } else {
      done(null, user, { message: 'Invalid username or password'})
    }
  })
  .catch((err) => {
    log.error(err, 'getUser err')
    done(err, false, { message: err.message })
  })
}

// 'agent' is an optional parameter to make those requests
// easy to spot in the logs
endpoint = '/api/auth?action=login&agent=jingo&include-user-data=true'
invLoginUrl = `${auth.local.inventaire.host}${endpoint}`

function inventaireLogin (username, password) {
  return got.post(invLoginUrl, {
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ strategy: 'local', username, password })
  })
  .then(res => {
    var body = JSON.parse(res.body)
    log.success(body, 'inventaire res')
    return body.user
  })
  .then(addUserPictureToDb)
  .catch((err) => {
    if (err.statusCode === 401) {
      log.warn(err.message, 'invalid inventaire user')
      // Return an empty user to signify that the authentification failed
      // but that it's not a server error
      return null
    } else {
      throw err
    }
  })
}

function addUserPictureToDb (user) {
  log([user._id, user.picture], 'setting user picture')
  return userPicture.set(user._id, user.picture)
  .then(() => user )
}

module.exports = new passportLocal.Strategy(getUser)
