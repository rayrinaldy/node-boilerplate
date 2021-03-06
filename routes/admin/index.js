const express = require('express');
const async = require('async');
const Account = require('../../models/account');
const router = express.Router();

router.get('/', (req, res, next) => {
    async.series([
        done => Account.find({}, done).select('-passwordHash'),
        // done => Account.find({}, done)
        //             .populate('user')
        //             .populate({
        //                 path: 'staff',
        //                 populate: {
        //                     path: 'account'
        //                 }
        //             })
        //             .populate({
        //                 path: 'driver',
        //                 populate: {
        //                     path: 'account'
        //                 }
        //             }),
    ], (err, results) => {
        res.render('../views/admin', {
            title: 'Admin - Ray Website',
            user: req.user,
            users: results[0],
            jobs: results[1],
            error: req.flash('error')
        })
    })
})

module.exports = router;
