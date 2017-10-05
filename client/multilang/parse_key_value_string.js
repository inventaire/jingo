module.exports = function (str) {
  var data = {}

  if (!str) return data

  str
  .split('&')
  .forEach(function (param) {
    var paramsParts = param.split('=')
    var key = paramsParts[0]
    var value = trimQuotes(paramsParts[1])
    data[key] = value
  })

  return data
}

function trimQuotes (str) {
  return str
  .trim()
  .replace(/^"/, '')
  .replace(/"$/, '')
}
