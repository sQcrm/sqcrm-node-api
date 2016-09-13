var Waterline = require('waterline');

var oauth_clients = Waterline.Collection.extend({

	identity: 'oauth_clients',
	connection: 'sqcrmMysql',
	tableName: 'oauth_clients',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		clientId: {
			type: 'string',
			required: true,
			columnName: 'client_id',
			primaryKey: true
		},

		clientSecret: {
			type: 'string',
			required: true,
			columnName: 'client_secret'
		},

		grantType: {
			type: 'string',
			required: true,
			columnName: 'grant_type'
		},

		redirectUri: {
			type: 'string',
			required: true,
			columnName: 'redirect_uri'
		},

		scope: {
			type: 'string',
			required: true,
		}
	}
});

module.exports = oauth_clients;
