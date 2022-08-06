const Booking = require('../models/Booking');
const catchAsync = require('../utils/catchAsync');
const restrictFields = require('../utils/restrictFields');

exports.getAllBookings = catchAsync(async (req, res, next) => {
	const bookings = await Booking.find();

	res.status(200).json({
		status: 'success',
		results: bookings.length,
		data: { bookings },
	});
});

exports.getBookingsById = catchAsync(async (req, res, next) => {
	// Attempt to find the coresponding document
	const booking = await Booking.findById(req.params.id);

	// Send an error if no booking is found
	if (!booking) return next(new Error('No booking found'));

	// Send the found booking to the user
	res.status(200).json({
		status: 'success',
		data: { booking },
	});
});

exports.createBooking = catchAsync(async (req, res, next) => {
	// Getting the required data
	const bookingData = restrictFields(req.body, 'band', 'group_size', 'num_of_instruments', 'start_time', 'duration');
	bookingData.band = restrictFields(bookingData.band, 'band_name', 'lead_name', 'lead_email', 'lead_contact_num');

	// Creating a new booking
	const newBooking = await Booking.create(bookingData);

	// Send new booking in response
	res.status(201).json({
		status: 'success',
		data: {
			booking: newBooking,
		},
	});
});

exports.updateBooking = catchAsync(async (req, res, next) => {
	// Get the data to update
	const bookingData = restrictFields(req.body, 'band', 'group_size', 'num_of_instruments', 'start_time', 'duration');
	if (bookingData.band)
		bookingData.band = restrictFields(bookingData.band, 'band_name', 'lead_name', 'lead_email', 'lead_contact_num');

	// Attempt to get the selected booking, and send an error if no booking is found
	const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, bookingData, { new: true });
	if (!updatedBooking) return next(new Error('No booking found'));

	// Send updated booking in response
	res.status(200).json({
		status: 'success',
		data: {
			booking: updatedBooking,
		},
	});
});

exports.deleteBooking = catchAsync(async (req, res, next) => {
	// Attempt to find and delete the coresponding booking
	await Booking.findByIdAndDelete(req.params.id);

	// Send a response to the user
	res.status(204).json({
		status: 'success',
		data: { booking: null },
	});
});
