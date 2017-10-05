module.exports = {
  wikify: function (str) {
    if (typeof str !== 'string' || str.trim() === '') return ''

    var spaceReplacement = '-'

    str = str
      // Replace < and > with '' (Gollum replaces it with '-')
      .replace(/[<>]/g, '')
      // Replace / with '+' (Gollum replaces it with '')
      .replace(/\//g, '+')
      .trim()
      .replace(/\s/g, spaceReplacement)

    return str
  },

  // Adapted from https://davidwalsh.name/javascript-debounce-function
  debounce: function (func, wait) {
    var timeout
    return function() {
      var context = this, args = arguments
      var later = function() {
        timeout = null
        func.apply(context, args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  // Adapted from http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
  hashCode: function (string) {
    var hash = 0
    var i = 0
    var len = string.length
    if (len === 0) return hash

    var char

    while (i < len) {
      char = string.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      // Convert to 32bit integer
      hash |= 0
      i++
    }

    return Math.abs(hash)
  }
}
