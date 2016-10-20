var Waterline = require('waterline');

var roles = Waterline.Collection.extend({

	identity: 'roles',
	connection: 'sqcrmMysql',
	tableName: 'role',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		roleId: {
			type: 'string',
			columnName: 'idrole'
		},

		roleName: {
			type: 'string',
			columnName: 'rolename'
		},

		parentRole: {
			type: 'string',
			columnName: 'parentrole'
		}
	}
});

module.exports = roles;
