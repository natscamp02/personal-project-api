const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
	{
		name: String,

		email: {
			type: String,
			trim: true,

			required: [true, ''],
			unique: true,

			validate: {
				validator(v) {
					return v === 'an email';
				},
				message: 'Must be a valid email address',
			},
		},

		password: {
			type: String,
			trim: true,

			required: [true, ''],
			validate: {
				validator(v) {
					return v === this.confirm;
				},
				message: 'Passwords do not match',
			},
		},
		confirm: String,

		active: {
			type: Boolean,
			default: true,
		},
	},
	{
		collection: 'users',
		timestamps: true,
	}
);

// Doccument middleware
UserSchema.pre('save', async function (next) {
	if (this.isNew || this.isModified('password')) {
		await bcrypt.hash(this.password, 12);
		this.confirm = undefined;
	}

	next();
});

UserSchema.pre(/^find/, function (next) {
	this.select('-password -__v');

	next();
});

UserSchema.pre(/^find/, function (next) {
	this.find({ active: { $ne: false } });

	next();
});

// Document methods
UserSchema.method('correctPassword', async function (userPassword) {
	return await bcrypt.compare(userPassword, this.password);
});

module.exports = mongoose.model('User', UserSchema);
