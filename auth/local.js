const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// const passportJWT = require('passport-jwt');
// const JWTStrategy = passportJWT.Strategy;
const bcrypt = require('bcrypt');

const Account = require('../models/account');

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
}, (username, password, done) => {
    Account.findOne({
        username: username
    }, (err, user) => {
        if (err) return done(err);

        if (!user) return done(null, false, {
            message: 'Incorrect username/password'
        });

        user.comparePassword(password, (err, isMatch) => {
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
        });
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    Account.findById(id).then(user => {
        done(null, user);
    });
});