var chalk = require('chalk')
var separatorTop = chalk.grey('******')
var separatorBottom = chalk.grey('------------')

function log (data, label, color='cyan') {
  console.log(`${separatorTop} ${chalk[color](label)} ${separatorTop}`)
  console.log(data)
  console.log(separatorBottom)
  return data
}

log.info = function (data, label) { log(data, label, 'blue') }
log.success = function (data, label) { log(data, label, 'green') }
log.error = function (data, label) { log(data, label, 'red') }
log.warn = function (data, label) { log(data, label, 'yellow') }

module.exports = log
