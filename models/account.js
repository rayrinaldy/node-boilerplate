const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require('bcrypt');
const timestamp = require('./plugins/timestamp');

let Account = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    userGroup: {
        type: String,
        required: true,
        default: 'user'
    },
    passwordHash: {
        type: String,
        required: true
    },
    name: {
        firstName: String,
        lastName: String
    },
    address: [{
        type: Schema.Types.ObjectId,
        ref: 'addresses'
    }],
    email: {
        type: String,
        lowercase: true
    },
    phone: String,
    preference: {
        type: Schema.Types.ObjectId,
        ref: 'preferences'
    },
    payment: [{
        type: Schema.Types.ObjectId,
        ref: 'payments'
    }],
    verified: {
        type: Boolean,
        default: false
    },
    invoice: [{
        type: Schema.Types.ObjectId,
        ref: 'invoices'
    }],
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

Account.plugin(timestamp);

Account.plugin(passportLocalMongoose, {
    usernameLowerCase: true
});

Account.pre('save', function (next) {
    if (!this.isModified("passwordHash")) return next();
    this.passwordHash = bcrypt.hashSync(this.passwordHash, 10);
    next();
});

Account.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.passwordHash, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('accounts', Account);