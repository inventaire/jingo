/* eslint-env mocha */
/* global expect */

var Tools = require('../../lib/tools')

describe('Tools', function () {
  it('should hashify a string with sha1', function () {
    expect(Tools.hashify('tornado')).to.equal('474446ad24ee5490f8e879012ee2a855a7c7bf56')
  })

})
