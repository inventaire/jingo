const paramsPattern = /\w+="[^"]+"/g
const paramPattern = /(\w+)="([^"]+)"/

module.exports = function (str) {
  var data = {}

  if (!str) return data

  var paramsMatches = str.match(paramsPattern)

  if (!paramsMatches) return data

  paramsMatches
  .forEach(function (param) {
    var match = param.match(paramPattern)
    data[match[1]] = match[2]
  })

  return data
}
