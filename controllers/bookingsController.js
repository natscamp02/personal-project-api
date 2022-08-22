const Booking = require('../models/Booking');
const catchAsync = require('../utils/catchAsync');
const restrictFields = require('../utils/restrictFields');
const { AppError } = require('../utils/appError');

exports.getAllBookings = catchAsync(async (req, res, next) => {
	let query = Booking.find();

	if (req.query) {
		// Filtering
		if (req.query.filter) {
			const filterOpts = {};

			const [filterBy, filterValue] = req.query.filter.split('=');
			filterOpts[filterBy] = filterValue;

			query.find(filterOpts);
		}

		// Filtering
		if (req.query.search) {
			query.find({
				$or: [
					{ 'artist.name': new RegExp(req.query.search, 'i') },
					{ 'band.group_name': new RegExp(req.query.search, 'i') },
				],
			});
		}

		// Pagination
		if (req.query.page) {
			const page = +req.query.page || 1;
			const limit = +req.query.limit || 20;
			const skip = (page - 1) * limit;

			query.skip(skip).limit(limit);
		}
	}

	const bookings = await query;

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
	if (!booking) return next(new AppError('No booking found', 404));

	// Send the found booking to the user
	res.status(200).json({
		status: 'success',
		data: { booking },
	});
});

exports.createBooking = catchAsync(async (req, res, next) => {
	// Getting the required data
	const bookingData = restrictFields(
		req.body,
		'customer_type',
		'artist',
		'band',
		'num_of_instruments',
		'start_date',
		'duration',
		'message'
	);
	if (bookingData.artist) bookingData.artist = restrictFields(bookingData.artist, 'name', 'email', 'contact_num');
	if (bookingData.band)
		bookingData.band = restrictFields(
			bookingData.band,
			'group_name',
			'group_size',
			'lead_name',
			'lead_email',
			'lead_contact_num'
		);

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
	// Attempt to get the selected booking, and send an error if no booking is found
	const updatedBooking = await Booking.findById(req.params.id);
	if (!updatedBooking) return next(new AppError('No booking found', 404));

	// Get the data to update
	const bookingData = restrictFields(
		req.body,
		'customer_type',
		'artist',
		'band',
		'num_of_instruments',
		'start_date',
		'duration',
		'message'
	);
	if (bookingData.artist) bookingData.artist = restrictFields(bookingData.artist, 'name', 'email', 'contact_num');
	if (bookingData.band)
		bookingData.band = restrictFields(
			bookingData.band,
			'group_name',
			'group_size',
			'lead_name',
			'lead_email',
			'lead_contact_num'
		);

	updatedBooking.set({ ...bookingData });
	await updatedBooking.save();

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
	const booking = await Booking.findByIdAndDelete(req.params.id);
	if (!booking) return next(new AppError('No booking found', 404));

	// Send a response to the user
	res.status(204).json({
		status: 'success',
		data: { booking: null },
	});
});
