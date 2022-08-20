const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const UserSchema = new mongoose.Schema(
	{
		name: String,

		email: {
			type: String,
			trim: true,

			required: [true, ''],
			unique: true,

			validate: {
				validator: validator.isEmail,
				message: 'Must be a valid email address',
			},
		},

		password: {
			type: String,
			select: false,
			trim: true,

			required: [true, 'Please provide a password'],
			validate: {
				validator(pass) {
					return pass === this.confirm;
				},
				message: 'Passwords do not match',
			},
		},
		confirm: String,

		passwordChangedAt: Date,

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
	if (!this.isNew && !this.isModified('password')) return next();

	this.password = await bcrypt.hash(this.password, 12);
	this.confirm = undefined;
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
UserSchema.method('passwordChangedAfter', function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
		return JWTTimestamp < changedTimestamp;
	}

	return false;
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
