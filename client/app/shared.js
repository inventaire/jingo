// Functions or utility elements shared with the server

var langMarkupPattern = /<!--\s?LANG:(\w{2}).*-->/

module.exports = {
  langMarkupPattern: langMarkupPattern,
  globalLangMarkupPattern: new RegExp(langMarkupPattern, 'g')
}
