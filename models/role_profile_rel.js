var Waterline = require('waterline');

var role_profile_rel = Waterline.Collection.extend({

	identity: 'role_profile_rel',
	connection: 'sqcrmMysql',
	tableName: 'role_profile_rel',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		roleId: {
			type: 'string',
			columnName: 'idrole'
		},

		profileId: {
			type: 'integer',
			columnName: 'idprofile'
		}
	}
});

module.exports = role_profile_rel;
