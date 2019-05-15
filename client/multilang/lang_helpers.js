var parseKeyValueString = function (str) {
  return str.split('&').reduce(function (data, part) {
    var parts = part.split('=')
    data[parts[0]] = parts[1]
    return data
  }, {})
}

var guessLang = function () {
  var browserLang = navigator.language || navigator.userLanguage
  browserLang = browserLang.slice(0, 2).toLowerCase()

  var queryStringData = parseKeyValueString(window.location.search.slice(1))
  var queryStringLang = queryStringData.lang

  return queryStringLang || getLastLang() || browserLang
}

var getLastLang = function () {
  // Wrap it in a try/catch as some browser don't support it
  try {
    return window.localStorage.getItem('last-lang')
  } catch (err) {
    console.error('getLastLang err', err)
  }
}

var setLastLang = function (lang) {
  // Wrap it in a try/catch as some browser don't support it
  try {
    window.localStorage.setItem('last-lang', lang)
  } catch (err) {
    console.error('setLastLang err', err)
  }
}

module.exports = {
  guessLang: guessLang,
  setLastLang: setLastLang
}