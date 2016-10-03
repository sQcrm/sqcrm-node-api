var Waterline = require('waterline');

var module_datashare_rel = Waterline.Collection.extend({

	identity: 'module_datashare_rel',
	connection: 'sqcrmMysql',
	tableName: 'module_datashare_rel',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		id: {
			type: 'integer',
			columnName: 'idmodule_datashare_rel',
			primaryKey: true
		},

		idmodule: {
			type: 'integer',
			columnName: 'idmodule'
		},
		
		permissionFlag: {
			type: 'integer',
			columnName: 'permission_flag'
		},
	}
});

module.exports = module_datashare_rel;