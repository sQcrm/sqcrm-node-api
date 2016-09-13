var crypto = require('crypto');

var md5 = function(value) {
	return crypto.createHash('md5').update(value).digest('hex');
};
exports.md5 = md5;
