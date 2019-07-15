const express = require('express');
const async = require('async');
const Account = require('../../models/account');
const Promo = require('../../models/promo');
const router = express.Router();

router.get('/', (req, res, next) => {
    async.series([
        done => Account.find({}, done).select('-passwordHash'),
        done => Jobs.find({}, done)
                    .populate('user')
                    .populate({
                        path: 'staff',
                        populate: {
                            path: 'account'
                        }
                    })
                    .populate({
                        path: 'driver',
                        populate: {
                            path: 'account'
                        }
                    }),
    ], (err, results) => {
        res.render('../views/admin', {
            title: 'Admin - Laundry Dashboard',
            user: req.user,
            users: results[0],
            jobs: results[1],
            error: req.flash('error')
        })
    })
})

// Promo manager
router.get('/promo', (req, res) => {
    async.series([
        done => Promo.find({}, done),
    ], (err, results) => {
        res.render('../views/admin/promo', {
            title: 'Promo - Laundry Dashboard',
            user: req.user,
            promo: results[0],
            error: req.flash('error')
        })
    })
});

module.exports = router;
