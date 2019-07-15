const express = require('express');
const router = express.Router();

// Users management
router.use('/users', require('./users'));
router.use('/promo', require('permission')(), require('./promo'));

// require('permission')()

module.exports = router;