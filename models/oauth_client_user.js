var Waterline = require('waterline');

var oauth_client_user = Waterline.Collection.extend({

	identity: 'oauth_client_user',
	connection: 'sqcrmMysql',
	tableName: 'oauth_client_users',
	autoPK: false,
	autoUpdatedAt: false,
	
	attributes: {
		id: {
			type: 'integer',
			required: true,
			columnName: 'id',
			primaryKey: true
		},

		client: {
			columnName: 'client_id',
			model: 'oauth_clients'
		},

		user: {
			columnName: 'user',
			model: 'user'
		},

		createdAt: {
			type: 'datetime',
			required: true,
			columnName: 'date_created'
		}
	}
});

module.exports = oauth_client_user;
