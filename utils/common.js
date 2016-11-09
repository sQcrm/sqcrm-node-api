var _ = require('lodash'),
	crypto = require('crypto');

var md5 = function(value) {
	return crypto.createHash('md5').update(value).digest('hex');
};
exports.md5 = md5;

exports.parseTaxData = function(taxData) {
	if (!taxData) return null;
	var parsedData,
		returnData = [];
	
	parsedData = _.split(_.trimEnd(taxData,','),',');
	_.forEach(parsedData, function(value) {
		var keyVal = _.split(value,'::');
		var obj = {
			"taxName" : keyVal[0],
			"taxValue": keyVal[1]
		};
		returnData.push(obj);
	});
	return returnData;
};
