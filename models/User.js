const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please provide a name'],
		},

		photo: String,

		email: {
			type: String,
			trim: true,

			required: [true, 'Please provide an email'],
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
			minLength: [8, 'Must be at least 8 characters long'],
		},
		confirm: {
			type: String,
			validate: {
				validator(pass) {
					return pass === this.password;
				},
				message: 'Passwords do not match',
			},
		},

		passwordChangedAt: Date,

		active: {
			type: Boolean,
			default: true,
		},
	},
	{
		collection: 'users',
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'last_updated',
		},
	}
);

// Doccument middleware
UserSchema.pre('save', async function (next) {
	if (!this.isNew && !this.isModified('password')) return next();

	this.password = await bcrypt.hash(this.password, 12);
	this.confirm = undefined;
	next();
});

UserSchema.pre('save', function (next) {
	if (this.isNew || this.isModified('name')) {
		const name = this.name.replaceAll(' ', '%20');
		this.photo = `https://avatars.dicebear.com/api/initials/${name}.svg`;
	}

	next();
});

UserSchema.pre('save', function (next) {
	if (!this.isNew && this.isModified('password')) {
		this.passwordChangedAt = new Date();
	}

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
