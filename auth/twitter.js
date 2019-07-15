const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const Account = require('../models/account');
const config = require('../config/config');

passport.serializeUser(function (user, fn) {
    fn(null, user);
});

passport.deserializeUser(function (id, fn) {
    Account.findOne({
        _id: id.doc._id
    }, function (err, user) {
        fn(err, user);
    });
});

passport.use(new TwitterStrategy({
        consumerKey: config.session.twitter.consumerKey,
        consumerSecret: config.session.twitter.consumerSecret,
        callbackURL: config.session.twitter.callbackURL
    },
    function (accessToken, refreshToken, profile, done) {
        Account.findOrCreate({
            name: profile.displayName
        }, {
            name: profile.displayName,
            userid: profile.id
        }, function (err, user) {
            if (err) {
                console.log(err);
                return done(err);
            }
            done(null, user);
        });
    }
));

module.exports = passport;