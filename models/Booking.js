const mongoose = require('mongoose');

const BandSchema = new mongoose.Schema({
	band_name: {
		type: String,
		required: [true, ''],
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

const BookingSchema = new mongoose.Schema(
	{
		band: BandSchema,
		group_size: {
			type: Number,
			required: [true, ''],
			min: [1, 'Must have atleast one(1) member'],
			max: [8, 'Cannot have more than eight(8) members'],
		},
		num_of_instruments: {
			type: Number,
			required: true,
		},

		start_time: {
			type: Date,
		},
		duration: {
			type: Number,
			required: [true, 'Please specify a duration'],
			max: [4, 'Cannot be more that 4 hours'],
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
BookingSchema.virtual('end_time').get(function () {
	return new Date(this.start_time.getTime() + this.duration * 60 * 60 * 1000);
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
