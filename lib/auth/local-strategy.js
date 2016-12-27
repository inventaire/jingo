var app = require('../app').getInstance()
var auth = app.locals.config.get('authentication')
var passportLocal = require('passport-local')
var got = require('got')
var chalk = require('chalk')

function getUser (username, password, done) {
  inventaireLogin(username, password)
  .then((user) => {
    console.log(chalk.green('user'), user)
    if (user) {
      done(null, user)
    } else {
      done(null, user, { message: 'Invalid username or password'})
    }
  })
  .catch((err) => {
    console.log(chalk.red('getUser err'), err)
    done(err, false, { message: err.message })
  })
}

invLoginEndpoint = `${auth.local.inventaire.host}/api/auth/public?action=login`

function inventaireLogin (username, password) {
  return got.post(invLoginEndpoint, {
    body: {
      strategy: 'local',
      username: username,
      password: password
    }
  })
  .then((res) => {
    var body = JSON.parse(res.body)
    console.log(chalk.green('inventaire res'), body, typeof body)
    return body.user
  })
  .catch((err) => {
    if (err.statusCode === 401) {
      console.log(chalk.yellow('invalid inventaire user'), err.message)
      // Return an empty user to signify that the authentification failed
      // but that it's not a server error
      return null
    } else {
      throw err
    }
  })
}

module.exports = new passportLocal.Strategy(getUser)
