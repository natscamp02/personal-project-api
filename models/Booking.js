const mongoose = require('mongoose');
const validator = require('validator');
const dayjs = require('dayjs');

const BandSchema = new mongoose.Schema({
	group_name: {
		type: String,
		required: [true, "Please enter the group's name"],
	},
	group_size: {
		type: Number,
		required: [true, "Please provide the group's size"],
		min: [1, 'Must have atleast one(1) member'],
	},

	lead_name: {
		type: String,
		required: [true, 'Please enter a name'],
	},
	lead_email: {
		type: String,
		required: [true, 'Please enter an email address'],
		validate: {
			validator: validator.isEmail,
			message: 'Please enter a valid email address',
		},
	},
	lead_contact_num: {
		type: Number,
		required: [true, 'Please enter a contact number'],
	},
});

const ArtistSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please enter the a name'],
	},
	email: {
		type: String,
		required: [true, 'Please enter an email address'],
		validate: {
			validator: validator.isEmail,
			message: 'Please enter a valid email address',
		},
	},
	contact_num: {
		type: Number,
		required: [true, 'Please enter a contact number'],
	},
});

const BookingSchema = new mongoose.Schema(
	{
		customer_type: {
			type: String,
			required: [true, 'Please choose an option'],
			enum: {
				values: ['artist', 'band'],
				message: 'Can either be an artist or a band',
			},
		},
		artist: ArtistSchema,
		band: BandSchema,

		num_of_instruments: {
			type: Number,
			default: 0,
			min: [0, 'Cannot be less that 0'],
		},

		start_date: {
			type: Date,
			required: [true, 'Please enter a date'],
			validate: {
				validator: (v) => {
					const today = dayjs().hour(0).minute(0).second(0);
					const date = dayjs(v);

					return date.diff(today, 'd') > 0;
				},
				message: 'Cannot book session on or before today',
			},
		},
		duration: {
			type: Number,
			required: [true, 'Please specify a duration'],
			min: [1, 'Cannot be less than 1 hour'],
			max: [4, 'Cannot be more than 4 hours'],
		},

		message: {
			type: String,
			maxLength: [255, 'Exceeded maximum character limit'],
		},

		completed: {
			type: Boolean,
			default: false,
		},
		payed: {
			type: Boolean,
			default: false,
		},
		approved_by: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: 'User',
		},
	},
	{
		collection: 'bookings',
		timestamps: {
			createdAt: 'booked_at',
			updatedAt: 'last_updated',
		},
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Virtuals
BookingSchema.virtual('cost').get(function () {
	return this.duration * process.env.SESSION_RATE;
});

// Document middleware
BookingSchema.pre(/^find/, function (next) {
	this.populate('approved_by');

	next();
});

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;
