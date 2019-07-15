const express = require('express');
const userController = require('./controller/userController');
const validation = require('./controller/validation');

const router = express.Router();

// User Credentials
router.post('/register', validation.validate('register'), userController.register);
router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.get('/forget', userController.forgetPassword);
router.post('/forget', userController.sendPassword);
router.post('/forget/:token', userController.resetPassword);

// User Modifications
router.get('/all', require('permission')('admin'), userController.allUsers);
router.post('/update/:id', require('permission')('admin'), userController.editUser)
router.post('/update-password/:id', require('permission')(), userController.editPassword)
router.delete('/delete/:id', require('permission')('admin'), userController.deleteUser)

// Users to Modify Address
router.get('/address', userController.allAddress);
router.get('/address/:id', require('permission')(['admin', 'user']), userController.address);
router.post('/address', require('permission')(['admin', 'user']), userController.addAddress);
router.post('/address/update/:id', require('permission')(['admin', 'user']), userController.updateAddress);
router.delete('/address/delete/:id', require('permission')(['admin', 'user']), userController.deleteAddress);

module.exports = router;