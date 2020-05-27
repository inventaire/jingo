// A small embedded database to match user pictures with user ids

var dbFolder = process.cwd() + '/db'
var db = require('level')(dbFolder)

module.exports = {
  /**
   * @param {String} user id
   * @return {String} picture url
   */
  get: async function (userId) {
    if (userId === 'jingouser') return null
    return db.get(userId)
  },
  /**
   * @param {String} user id
   * @param {String} picture url
   */
  set: db.put.bind(db)
}
