// All language versions being written on the same wiki page,
// this scripts takes care of splitting the page per-language
// to display only one version at a time

// Expect language sections in the markdown with per-lang comment markups:

// <!-- LANG:EN -->
// hello
// <!-- LANG:FR, title=Accueil -->
// salut

var updateContent = require('./update_content')
var guessLang = require('./lang_helpers').guessLang

updateContent(guessLang())
