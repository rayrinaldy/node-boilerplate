const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const Account = require('../models/account');
const config = require('../config/config');

passport.use(new GoogleStrategy({
        clientID: config.session.google.clientID,
        clientSecret: config.session.google.clientSecret,
        callbackURL: config.session.google.callbackURL
    },
    function (accessToken, refreshToken, profile, done) {
        Account.findOrCreate({
            userid: profile.id
        }, {
            name: profile.displayName,
            userid: profile.id
        }, function (err, user) {
            return done(err, user);
        });
    }
));

module.exports = passport;