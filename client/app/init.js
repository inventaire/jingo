var pathname = window.location.pathname

module.exports = {
  setFocus: function () {
    if ($('#content').hasClass('edit')) {
      $('#editor').focus()
    } else {
      $('#pageTitle').focus()
    }
  },

  setLoginRedirection: function () {
    $('#login').attr('href', function () {
      return $(this).attr('href').replace('destination', 'destination=' + encodeURIComponent(pathname))
    })
  },

  confirmations: function () {
    $('.confirm-delete-page').on('click', function (evt) {
      return window.confirm('Do you really want to delete this page?')
    })

    $('.confirm-revert').on('click', function (evt) {
      return window.confirm('Do you really want to revert to this revision?')
    })
  },

  compare: function () {
    $('#rev-compare').attr('disabled', true)

    $('#rev-compare').on('click', function () {
      var $hCol1 = $('.history td:first-child')
      if ($hCol1.find(':checked').length < 2) {
        return false
      }
      window.location.href = proxyPath + '/wiki/' + $(this).data('pagename') + '/compare/' + $hCol1.find(':checked').map(function () { return $(this).val() }).toArray().reverse().join('..')
      return false
    })
  },

  initEditPage: function () {
    $('#editor').closest('form').on('submit', function () {
      if (Jingo.cmInstance) {
        Jingo.cmInstance.save()
      }
      window.sessionStorage.setItem('jingo-page', $('#editor').val())
    })

    if (window.location.search === '?e=1') {
      // Edit page in error: restore the body
      var content = window.sessionStorage.getItem('jingo-page')
      if (content) {
        $('#editor').val(content)
      }
    } else {
      window.sessionStorage.removeItem('jingo-page')
    }
  },

  checkboxes: function () {
    var $hCol1 = $('.history td:first-child')
    toggleCompareCheckboxes($hCol1)
    $hCol1.find('input').on('click', function () {
      toggleCompareCheckboxes($hCol1)
    })

  },

  highlightQueryTerm: require('./highlight_query_term')
}

function toggleCompareCheckboxes ($hCol1) {
  $('#rev-compare').attr('disabled', true)

  if ($hCol1.find(':checkbox').length === 1) {
    $hCol1.find(':checkbox').hide()
    return
  }
  if ($hCol1.find(':checked').length === 2) {
    $('#rev-compare').attr('disabled', false)
    $hCol1.find(':not(:checked)').hide()
    $hCol1.parent('tr').css({'color': 'silver'})
    $hCol1.find(':checked').parents('tr').css({'color': 'black'})
  } else {
    $hCol1.find('input').show().parents('tr').css({'color': 'black'})
  }
}
