var Waterline = require('waterline');

var oauth_refresh_token_write = Waterline.Collection.extend({

	identity: 'oauth_refresh_token_write',
	connection: 'sqcrmWrite',
	tableName: 'oauth_refresh_tokens',
	autoPK: false,
	autoUpdatedAt: false,
	autoCreatedAt: false,
	
	attributes: {
		id: {
			type: 'integer',
			columnName: 'id',
			primaryKey: true,
			autoIncrement: true
		},
		
		refreshToken: {
			type: 'string',
			required: true,
			columnName: 'refresh_token'
		},

		client: {
			model: 'oauth_clients',
			columnName: 'client_id'
		},

		user: {
			model: 'user',
			columnName: 'iduser'
		},

		expiresAt: {
			type: 'datetime',
			columnName: 'expires'
		}
	}
});

module.exports = oauth_refresh_token_write;
