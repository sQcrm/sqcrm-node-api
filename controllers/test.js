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
		*      parameters:
		*        - name: Authorization
		*          description: access token
		*          paramType: header
		*          required: true
		*          dataType: string
		*          defaultValue: Bearer ACCESS_TOKEN_HERE
		*/
		getAll: function(req, res, next) {
			var apiBase = req.protocol + '://' + req.get('host') + apiNamespace,
				apiEndpoint = apiBase + '/' + resourceType + '/';
			var results = [{
					id: '1',
					firstName: 'Sandro',
					lastName: 'Munda',
				}, 
				{
					id: '2',
					firstName: 'Lawrence',
					lastName: 'Bennett'
				}
			];
			
			res.locals.JSONAPIOptions = {
				resourceType: resourceType,
				attributes:['firstName', 'lastName'],
				dataLinks: {
					self: function (results,user) {
						return apiEndpoint + user.id;
					}
				}
			};
			
			res.body = results;
			return next();
		}	
	};
};
