var app = require('./app').getInstance()
var log = require('./log')
var { issues:appIssues } = app.locals.config.get('application')

module.exports = {
  send500: function (res, err, label) {
    res.locals.title = '500 - Internal server error'
    label = label || res.locals.title
    err = err || new Error(label)
    res.statusCode = 500
    log.error(err, `${label} err`)
    res.render('500.jade', {
      message: `Sorry, something went wrong and I cannot recover. If you think this might be a bug, please file a detailed report about what you were doing here: ${appIssues} . Thank you!`,
      error: err
    })
  }
}
