var router = require('express').Router()

router.get('/post/110540440753/*', (req, res) => res.redirect(301, '/wiki/mapping-resources-using-open-knowledge'))

module.exports = router
