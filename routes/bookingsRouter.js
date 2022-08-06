const express = require('express');
const bookingsController = require('../controllers/bookingsController');
const authController = require('../controllers/authController');

const router = express.Router();

// router.use(authController.protect);

router.route('/').get(bookingsController.getAllBookings).post(bookingsController.createBooking);
router
	.route('/:id')
	.get(bookingsController.getBookingsById)
	.patch(bookingsController.updateBooking)
	.delete(bookingsController.deleteBooking);

module.exports = router;
