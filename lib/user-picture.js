// A small embedded database to match user pictures with user ids

var dbFolder = process.cwd() + '/db'
var Promiser = require('bluebird')
var db = Promiser.promisifyAll(require('level')(dbFolder))

module.exports = {
  /**
   * @param {String} user id
   * @return {String} picture url
   */
  get: function (userId) {
    if (userId === 'jingouser') {
      return Promiser.resolve(null)
    } else {
      return db.getAsync(userId)
    }
  },
  /**
   * @param {String} user id
   * @param {String} picture url
   */
  set: db.putAsync.bind(db)
}
