var cryptoz = require('crypto')

var tools = {

  hashify: function (str) {
    var shasum = cryptoz.createHash('sha1')
    shasum.update(str)
    return shasum.digest('hex')
  }
}

module.exports = tools
