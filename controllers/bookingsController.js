const Booking = require('../models/Booking');
const catchAsync = require('../utils/catchAsync');
const restrictFields = require('../utils/restrictFields');
const { AppError } = require('../utils/appError');

exports.getAllBookings = catchAsync(async (req, res, next) => {
	let query = Booking.find();
	let data = {};

	if (req.query) {
		// Group
		if (req.query.group) {
			switch (req.query.group) {
				case 'incomplete':
					query.find({ completed: false });
					break;
				case 'complete':
					query.find({ completed: true });
					break;
				case 'any':
				default:
					query.find();
					break;
			}
		}

		// Filtering
		if (req.query.filter) {
			const filterOpts = {};

			let [filterBy, filterValue] = req.query.filter.split('=');

			if (filterValue.match(/^(true|false)$/)) filterValue = filterValue === 'true' ? true : false;
			filterOpts[filterBy] = filterValue;

			query.find(filterOpts);
		}

		// Searching
		if (req.query.search) {
			const nameRegex = new RegExp(req.query.search, 'i');

			query.find({
				$or: [{ 'artist.name': nameRegex }, { 'band.group_name': nameRegex }],
			});
		}

		// Sorting
		if (req.query.sort) {
			const sortOpts = {};

			let [sortBy, sortDirection] = req.query.sort.split('=');
			sortOpts[sortBy] = sortDirection || 'asc';

			query.sort(sortOpts);
		}

		// Pagination
		if (req.query.page) {
			const limit = +req.query.limit || 20;
			const maxNumOfPages = Math.ceil(Math.max(await Booking.countDocuments(query), 1) / limit);

			const page = Math.min(+req.query.page || 1, maxNumOfPages);
			const skip = (page - 1) * limit;

			query.skip(skip).limit(limit);

			data.page = {
				limit: limit,
				current: page,
				maxNumOfPages: maxNumOfPages,
			};
		}
	}

	data.bookings = await query;
	data.results = data.bookings?.length;

	res.status(200).json({
		status: 'success',
		data,
	});
});

exports.getBookingsById = catchAsync(async (req, res, next) => {
	// Attempt to find the corresponding document
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

exports.approveBooking = catchAsync(async (req, res, next) => {
	// Get the data to update
	const bookingData = restrictFields(req.body, 'payed', 'completed');

	// Update the booking data
	const booking = await Booking.findByIdAndUpdate(
		req.params.id,
		{ ...bookingData, approved_by: req.user._id },
		{ new: true }
	);

	if (!booking) return next(new AppError('No booking found', 404));

	res.status(200).json({ status: 'success', data: { booking } });
});

exports.deleteBooking = catchAsync(async (req, res, next) => {
	// Attempt to find and delete the corresponding booking
	const booking = await Booking.findByIdAndDelete(req.params.id);
	if (!booking) return next(new AppError('No booking found', 404));

	// Send a response to the user
	res.status(204).json({
		status: 'success',
		data: { booking: null },
	});
});
