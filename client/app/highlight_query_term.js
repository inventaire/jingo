module.exports = function () {
  if (window.location.search === '') return

  var hl = null
  $('input[name=term]').focus()

  var qs = $.map(window.location.search.substr(1).split('&'), function (kv) {
    kv = kv.split('=')
    return { k: kv[0], v: decodeURIComponent(kv[1]) }
  })

  $.each(qs, function (i, t) {
    if (t.k === 'hl') hl = t.v
  })

  if (!hl) return

  if (window.find && window.getSelection) {
    document.designMode = 'on'
    var sel = window.getSelection()
    sel.collapse(document.body, 0)
    while (window.find(hl)) {
      document.execCommand('HiliteColor', false, 'yellow')
      sel.collapseToEnd()
    }
    sel.collapse(document.body, 0)
    window.find(hl)
    sel.collapseToEnd()
    document.designMode = 'off'
  } else {
    if (document.body.createTextRange) {
      var textRange = document.body.createTextRange()
      while (textRange.findText(hl)) {
        textRange.execCommand('BackColor', false, 'yellow')
        textRange.collapse(false)
      }
    }
  }
}
