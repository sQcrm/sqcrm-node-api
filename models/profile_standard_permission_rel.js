var Waterline = require('waterline');

var profile_standard_permission_rel = Waterline.Collection.extend({

	identity: 'profile_standard_permission_rel',
	connection: 'sqcrmMysql',
	tableName: 'profile_standard_permission_rel',
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
		
		standardPermission: {
			type: 'integer',
			columnName: 'idstandard_permission'
		},
		
		permissionFlag: {
			type: 'integer',
			columnName: 'permission_flag'
		}
	}
});

module.exports = profile_standard_permission_rel;
