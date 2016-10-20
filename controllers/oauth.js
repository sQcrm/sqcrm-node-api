var async = require('async'),
	common = require('../utils/common'),
	crmPrivileges = require('../utils/crm_privileges');
/**
 * @swagger
 * resourcePath: /oauth
 * description: OAuth2
 */
module.exports = function(app, config) {
	
	return {
		/**
		* @swagger
		* path: /api/v1/oauth/token
		* operations:
		*   -  httpMethod: POST
		*      nickname: oauth/token
		*      parameters:
		*        - name: grant_type
		*          paramType: form
		*          required: true
		*          dataType: string
		*          enum: ['client_credentials', 'password', 'refresh_token']
		*        - name: Authorization
		*          description: YOUR_CLIENT_ID:YOUR_CLIENT_SECRET, base64 encoded
		*          paramType: header
		*          required: true
		*          dataType: string
		*          defaultValue: Basic ACCESS_TOKEN_HERE
		*        - name: username
		*          description: required if `grant_type=password`
		*          paramType: form
		*          dataType: string
		*        - name: password
		*          description: required if `grant_type=password`
		*          paramType: form
		*          dataType: string
		*        - name: refresh_token
		*          description: required if `grant_type=refresh_token`
		*          paramType: form
		*          dataType: string
		*/
		// Get access token
		getAccessToken: function(bearerToken, callback) {
			var whereClause = {accessToken: bearerToken};
			async.auto({
				token: function(autoCallback) {
					app.models.oauth_access_token
					.findOne(whereClause)
					.populate('client')
					.exec(function(err, token) {
						if (err) return autoCallback(err);
						if (!token) return autoCallback();
						return autoCallback(null, token);
					});
				},
				user: ['token', function(results, autoCallback) {
					if (!results.token) return autoCallback();
					
					if (results.token.client.scope !== 'user') {
						return autoCallback(null, results.token.user);
					}
					
					app.models.user.findOne({id: results.token.user})
					.exec(function(err, user) {
						if (err) return autoCallback(err);
						return autoCallback(null, user);
					});
				}]
			},
			function(err, results) {
				if (err) return callback(err);

				if (!results.token) return callback();
						  
				var returnObj = {
					accessToken: results.token.accessToken,
					clientId: results.token.client.clientId,
					scope: results.token.client.scope,
					expires: results.token.expiresAt,
					privileges: JSON.parse(results.token.privileges)
				};

				// If not user scope, then set user ID instead of obj
				if (results.token.client.scope !== 'user') {
					returnObj.userId = results.user;
				}
				else {
					returnObj.user = results.user;
				}

				return callback(null, returnObj);
			});
		},
		
		// Get the client 
		getClient: function(clientId, clientSecret, callback) {
			var whereClause = {clientId : clientId};
			app.models.oauth_clients
			.findOne(whereClause)
			.exec(function(err, client) {
				if (err) return callback(err);

				client = client || false;
				var returnObj = {
					clientId: client.clientId,
					clientSecret: client.clientSecret
				};
				
				return callback(null, returnObj);
			});
		},
		
		// Check if grand type is allowed
		grantTypeAllowed: function(clientId, grantType, callback) {
			var whereClause = {clientId : clientId};
			app.models.oauth_clients
			.findOne(whereClause)
			.exec(function(err, client) {
				if (err) return callback(err);

				client = client || false;
				
				if (grantType !== client.grantType) return callback('Grant Type not allowed');
				return callback(null, true);
			});
		},
		
		// Get the refresh token
		getRefreshToken: function(bearerToken, callback) {
			var whereClause = {refresh_token: bearerToken};
			app.models.oauth_refresh_token
			.findOne(whereClause)
			.exec(function(err, token) {
				if (err) return callback(err);

				token = token || false;

				return callback(null, token);
			});
		},
		
		// Get the user
		getUser: function(username, password, callback) {
			app.models.user.findOne({
				password: common.md5(password),
				userName: username
			}).exec(function(err, user) {
				if (err) return callback(err);
				
				if (!user) callback('User not found !!');
					
				crmPrivileges.loadCRMPrivileges(app, user, function(err, privileges) {
					if (err) callback(null, user);
					user.privileges = privileges;
					return callback(null, user);
				});
			});
		},
		
		// Get the user from client
		getUserFromClient: function(clientId, clientSecret, callback) {
			var whereClause = {client: clientId};
			app.models.oauth_client_user
			.findOne(whereClause)
			.populate('user')
			.exec(function(err, client_user) {
				if (err) return callback(err);

				client_user = client_user || false;

				return callback(null, client_user.user);
			});
		},
		
		// Save this access token, if it doesn't already exist
		saveAccessToken: function (accessToken, clientId, expires, user, callback) {
			var saveObj = {
				accessToken: accessToken,
				client: clientId,
				user: user.id,
				expiresAt: expires
			};
			
			if (user.privileges) saveObj.privileges = JSON.stringify(user.privileges);
			
			app.models.oauth_access_token_write.create(saveObj, function(err, newAccessToken) {
				if (err) return callback(err);
				return callback(null, newAccessToken);
			});
		},
		
		// Save the refresh token
		saveRefreshToken: function(refreshToken, clientId, expires, user, callback) {
			var saveObj = {
				refreshToken: refreshToken,
				client: clientId,
				user: user.id,
				expiresAt: expires
			};
			
			if (user.privileges) saveObj.privileges = JSON.stringify(user.privileges);
			
			app.models.oauth_refresh_token_write.create(saveObj, function(err, newRefreshToken) {
				if (err) return callback(err);
				return callback(null, newRefreshToken);
			});
		}
	};
};
