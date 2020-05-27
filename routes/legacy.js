var router = require('express').Router()

router.get('/post/110540440753/*', (req, res) => res.redirect(301, 'https://wiki.inventaire.io/wiki/mapping-resources-using-open-knowledge'))
router.get('/wiki/Blog/post/110540440753/*', (req, res) => res.redirect(301, 'https://wiki.inventaire.io/wiki/mapping-resources-using-open-knowledge'))

module.exports = router
