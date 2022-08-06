/**
 * Use to filter an object
 * @param {object} body - Object to filter
 * @param {...string} allowedFields - List of fields to allow
 */
module.exports = (body, ...allowedFields) => {
	const obj = {};

	Object.keys(body).forEach((key) => {
		if (allowedFields.includes(key)) obj[key] = body[key];
	});

	return obj;
};
