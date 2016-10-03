var Waterline = require('waterline');

var profile_module_rel = Waterline.Collection.extend({

	identity: 'profile_module_rel',
	connection: 'sqcrmMysql',
	tableName: 'profile_module_rel',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		profileId: {
			type: 'string',
			columnName: 'idprofile'
		},

		idmodule: {
			type: 'integer',
			columnName: 'idmodule'
		},
		
		permissionFlag: {
			type: 'integer',
			columnName: 'permission_flag'
		}
	}
});

module.exports = profile_module_rel;
