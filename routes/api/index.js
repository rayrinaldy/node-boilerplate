const express = require('express');
const router = express.Router();

// Users management
router.use('/users', require('./users'));

// require('permission')(['admin', 'users])

module.exports = router;