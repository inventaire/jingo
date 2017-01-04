module.exports = {
  // Used instead of 'escape' to keep some markups
  removeScriptTags: function (text) {
    return text
    .replace(/<script([^>]*)>/g, '&lt;script$1&gt;')
    .replace(/<img([^>]*)>/g, '&lt;img$1&gt;')
    .replace(/<\/script>/g, '&lt;/script&gt;')
    .replace(/<\/img>/g, '&lt;/img&gt;')
  }
}
