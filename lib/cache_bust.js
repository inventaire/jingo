const md5File = require('md5-file')
var log = require('./log')
const publicFolder = process.cwd() + '/public'
const hashes = {}

module.exports = function (assetRelativeUrl) {
  var hash = hashes[assetRelativeUrl] || getFileHash(assetRelativeUrl)
  return bustedUrl(assetRelativeUrl, hash)
}

// This has to be a sync function
function getFileHash (assetRelativeUrl) {
  const fileHash = md5File.sync(getFilePath(assetRelativeUrl))
  return hashes[assetRelativeUrl] = fileHash.slice(0, 7)
}

const getFilePath = (assetRelativeUrl) => `${publicFolder}${assetRelativeUrl}`
const bustedUrl = (assetRelativeUrl, hash) => `${assetRelativeUrl}?${hash}`
