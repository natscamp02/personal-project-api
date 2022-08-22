const express = require('express');
const bookingsController = require('../controllers/bookingsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(authController.protect, bookingsController.getAllBookings).post(bookingsController.createBooking);

router.use(authController.protect);
router.patch('/approve/:id', bookingsController.approveBooking);
router
	.route('/:id')
	.get(bookingsController.getBookingsById)
	.patch(bookingsController.updateBooking)
	.delete(bookingsController.deleteBooking);

module.exports = router;
