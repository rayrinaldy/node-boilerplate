const express = require('express');
const router = express.Router();
const Account = require('../models/account');

router.get('/', (req, res) => {
    res.render('landing-page', {
        title: 'Ray Website',
        error: req.flash('error'),
        user: req.user
    });
});

router.get('/login', (req, res) => {
    if (req.user) {
        req.flash('error', 'Please log out first')
        res.redirect('/dashboard');
    } else {
        res.render('login', {
            title: 'Login - Ray Website',
            error: req.flash('error')
        });
    }
});

// Register new users
router.get('/register', (req, res) => {
    if(req.user) {
        res.redirect('/dashboard');
    } else {
        res.render('register', {
            title: 'Register - Ray Website',
            user: req.user,
            error: req.flash('error'),
            form: ''
        });
    }
});

// API & Admin Management
router.use('/api', require('./api'));
router.use('/admin', require('permission')('admin'), require('./admin'));

module.exports = router;