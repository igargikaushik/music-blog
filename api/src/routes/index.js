const router = require('express').Router();

router.use('/admin', require('./admin'));
router.use('/storage', require('./storage.js'));
router.use('/articles', require('./articles.js'));

module.exports = router;