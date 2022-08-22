const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.use(authController.protect);

router
	.route('/profile')
	.get(authController.getCurrentUser)
	.patch(authController.updateCurrentUser)
	.delete(authController.deleteCurrentUser);
router.post('/profile/verify', authController.verifyUser);
router.patch('/profile/password', authController.updateCurrentUserPassword);

router.route('/').get(userController.getAllUsers).post(userController.createUser);
router.route('/:id').get(userController.getUserByID).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
