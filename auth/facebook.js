const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const Account = require('../models/account');
const config = require('../config/config');

passport.use(new FacebookStrategy({
        clientID: config.session.facebook.app_id,
        clientSecret: config.session.facebook.app_secret,
        callbackURL: config.session.facebook.callback_url,
        profileFields: ['id', 'emails', 'name', 'displayName', 'address']
    },
    function (accessToken, refreshToken, profile, done) {
        Account.findOne({
            'facebook.id': profile.id
        }, function (err, user) {
            if (err) return done(err);
            if (user) return done(null, user);
            else {
                var newUser = new Account();

                // set all of the facebook information in our user model
                newUser.facebook.id = profile.id;
                newUser.name.firstName = profile.name.givenName;
                newUser.name.lastName = profile.name.familyName;
                newUser.address = profile.address;
                newUser.facebook.token = accessToken;
                newUser.facebook.name = profile.displayName;
                if (typeof profile.emails != 'undefined' && profile.emails.length > 0)
                    newUser.facebook.email = profile.emails[0].value;
                    newUser.email = profile.emails[0].value;

                newUser.save(function (err) {
                    if (err) throw err;
                    return done(null, newUser);
                });
            }
        });
    }
));

module.exports = passport;