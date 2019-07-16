const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const async = require('async');
const { check, validationResult } = require('express-validator');
const mailer = require('@sendgrid/mail');
const config = require('../../../config/config');
const Account = require('../../../models/account');

mailer.setApiKey(process.env.SENDGRID_API_KEY);

const controller = {
    login: (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) return next(err);

            if (!user) {
                req.flash('error', info.message );
                return res.redirect('/login');
            }
            
            req.logIn(user, (err) => {
                if (err) return next(err);

                req.session.user = user;

                if(user.userGroup === 'admin') {
                    return res.redirect('/admin');
                } else {
                    return res.redirect('/');
                }
            });
        })(req, res, next);
    },
    register: async (req, res, next) => {
        const { username, password, firstName, lastName, phone, email, userGroup } = req.body;
        const errors = await validationResult(req);

        if(!errors.isEmpty()) {
            res.render('register', {
                title: 'Register - Ray Website',
                user: req.user,
                error: req.flash('error'),
                formError: errors.array(),
                form: {
                    username,
                    firstName,
                    lastName,
                    phone,
                    email,
                },
            });

            return false;
        }

        try {
            let passwordHash = password;
            
            const userDocument = new Account({
                username,
                passwordHash,
                name: {
                    firstName,
                    lastName
                },
                phone,
                email,
                userGroup
            });

            await userDocument.save();

            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                res.status(200).send('New user registered');
            } else {
                await passport.authenticate('local', (err, user, info) => {
                    if (err) return next(err);
        
                    if (!user) {
                        req.flash('error', info.message );
                        return res.redirect('/register');
                    }
                    
                    req.logIn(user, (err) => {
                        if (err) return next(err);
        
                        req.session.user = user;
        
                        return res.redirect('/');
                    });
                })(req, res, next);
            }
        } catch (err) {
            res.json({
                error: 'Username is taken'
            })
        }
    },
    allUsers: (req, res, next) => {
        Account
            .find({})
            .populate('address')
            .populate('shipment')
            .select('-passwordHash')
            .exec((err, data) => {
                if (err) return next(err);
                
                res.status(200).send(data);
            })
    },
    editUser: (req, res, next) => {
        const { username, firstName, lastName, phone, email, userGroup } = req.body;

        Account
            .findById(req.params.id)
            .exec((err, user) => {
                if (err) return next(err);

                user.username = username;
                user.name.firstName = firstName;
                user.name.lastName = lastName;
                user.phone = phone;
                user.email = email;
                user.userGroup = userGroup;

                user.save((err, data) => {
                    if (err) return next(err);
                    res.status(200).send('User updated');
                })
            })
    },
    editPassword: (req, res, next) => {
        Account
            .findById(req.params.id)
            .exec((err, user) => {
                if (err) return next(err);

                user.passwordHash = req.body.password;

                user.save((err, data) => {
                    if (err) return next(err);
                    res.status(200).send('User updated');
                })
            })
    },
    deleteUser: (req, res, next) => {
        Account.findOneAndRemove({_id: req.params.id}, (err) => {
            if (err)
                return next(err);

            res.status(200).send('User details deleted successfully!');
        });
    },
    logout: (req, res, next) => {
        req.logout();
        req.session.save((err) => {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    },
    forgetPassword: (req, res, next) => {
        res.render('forgot', {
            title: 'Forgot Password',
            error: req.flash('error'),
            user: req.user,
        });
    },
    sendPassword: (req, res, next) => {
        async.waterfall([
            done => {
                crypto.randomBytes(20, function(err, buf) {
                    let token = buf.toString('hex');
                    done(err, token);
                });
            },
            (token, done) => {
                Account.findOne({ username: req.body.username }, (err, user) => {
                    if (!user) {
                      req.flash('error', 'No account with that email address exists.');
                      return res.redirect('/api/users/forget');
                    }
            
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            
                    user.save((err) => {
                      done(err, token, user);
                    });
                });
            },
            (token, user, done) => {
                const mailOptions = {
                    to: user.email,
                    from: 'passwordreset@rayrinaldy.com',
                    subject: 'Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };

                mailer.send(mailOptions, (err) => {
                    req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
    
                    done(err, 'done');
                });
            }
        ], (err) => {
            if (err) return next(err);
            res.redirect('/forgot');
        })
    },
    resetPassword: (req, res, next) => {
        async.waterfall([
            done => {
                Account.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
                    if (!user) {
                        req.flash('error', 'Password reset token is invalid or has expired.');
                        return res.redirect('back');
                    }
                    user.password = req.body.password;
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
    
                    user.save((err) => {
                        req.logIn(user, function(err) {
                            done(err, user);
                        });
                    });
                });
            },
            (user, done) => {
                const mailOptions = {
                    to: user.email,
                    from: 'passwordreset@rayrinaldy.com',
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };

                mailer.send(mailOptions, (err) => {
                    req.flash('success', 'Success! Your password has been changed.');
                    done(err, 'done');
                });
            }
        ], (err) => {
            if (err) return next(err);
            res.redirect('/');
        })
    },
    ping: (req, res) => {
        res.status(200).send("pong!");
    },
}

module.exports = controller;