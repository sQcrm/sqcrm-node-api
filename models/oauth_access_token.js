var Waterline = require('waterline');

var oauth_access_token = Waterline.Collection.extend({

	identity: 'oauth_access_token',
	connection: 'sqcrmMysql',
	tableName: 'oauth_access_tokens',
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
		
		accessToken: {
			type: 'string',
			required: true,
			columnName: 'access_token'
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
			required: true,
			columnName: 'expires'
		},
		
		privileges: {
			type: 'string',
			columnName: 'privileges'
		},
		
		toJSON: function() {
			return this.toObject();
		}
	}
});

module.exports = oauth_access_token;
