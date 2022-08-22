const mongoose = require('mongoose');

const BandSchema = new mongoose.Schema({
	group_name: {
		type: String,
		required: [true, ''],
	},
	group_size: {
		type: Number,
		required: [true, 'Please provide the group size'],
		min: [1, 'Must have atleast one(1) member'],
	},

	lead_name: {
		type: String,
		required: [true, ''],
	},
	lead_email: {
		type: String,
		required: [true, ''],
	},
	lead_contact_num: {
		type: Number,
		required: [true, ''],
	},
});

const ArtistSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, ''],
	},
	email: {
		type: String,
		required: [true, ''],
	},
	contact_num: {
		type: Number,
		required: [true, ''],
	},
});

const BookingSchema = new mongoose.Schema(
	{
		customer_type: {
			type: String,
			required: [true, 'Please provide the type of customer'],
			enum: {
				values: ['artist', 'band'],
				message: 'Customer can either be an artist or a band',
			},
		},
		artist: ArtistSchema,
		band: BandSchema,

		num_of_instruments: {
			type: Number,
			required: true,
		},

		start_date: {
			type: Date,
		},
		duration: {
			type: Number,
			required: [true, 'Please specify a duration'],
			max: [4, 'Cannot be more that 4 hours'],
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
BookingSchema.virtual('end_date').get(function () {
	return new Date(this.start_date.getTime() + this.duration * 60 * 60 * 1000);
});
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
