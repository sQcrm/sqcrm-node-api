var _ = require('lodash'),
	async = require('async');

/**
 * @swagger
 * resourcePath: /test
 * description: sQcrm test
 */
module.exports = function(app, config) {
	var apiNamespace = config.apiNamespace,
		resourceType = 'test';

	// Public Methods
	return {
		/**
		* @swagger
		* path: /api/v1/test
		* operations:
		*   -  httpMethod: GET
		*      summary: A test end point for sQcrm.
		*      notes: Return some test data
		*      responseClass: test
		*      nickname: test
		*/
		getAll: function(req, res, next) {
			var apiBase = req.protocol + '://' + req.get('host') + apiNamespace,
				apiEndpoint = apiBase + '/' + resourceType + '/';
				var results = {
					status:200,
					title:'Sucess',
					detail:'API call is successful'
				}
				//res.body = results;
				//console.log(res.body);
				res.json(results);
				return next();
		}	
	};
};
