const { check } = require('express-validator');
const Account = require('../../../models/account');

exports.validate = (method) => {
    switch(method) {
        case 'register': {
            return [
                check('username').not().isEmpty().isLength({ min: 3 }).withMessage('Min username length is 3').custom(value => {
                    return Account.findOne({username: value}).then(user => {
                        if (user) {
                            return Promise.reject('Username has already been taken');
                        }
                    });
                }),
                check('password').not().isEmpty().isLength({ min: 6 }).withMessage('Min password length is 6').custom((value,{req, loc, path}) => {
                    if (value !== req.body.confirmPassword) {
                        throw new Error("Password not match");
                    } else {
                        return value;
                    }
                }),
                check('firstName').not().isEmpty().withMessage('First Name cannot be empty'),
                check('lastName').not().isEmpty().withMessage('Last Name cannot be empty'),
                check('phone').isInt().withMessage('Invalid phone number'),
                check('email').isEmail().normalizeEmail().withMessage('Invalid email'),
            ]
        }

        case 'login': {
            return [
                check('username').not().isEmpty().isLength({ min: 3 }).withMessage('Min username length is 3'),
                check('password').not().isEmpty().isLength({ min: 6 }).withMessage('Min password length is 6'),
            ]
        }
    }
}