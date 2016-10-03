var Waterline = require('waterline');

var modules = Waterline.Collection.extend({

	identity: 'modules',
	connection: 'sqcrmMysql',
	tableName: 'module',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		id: {
			type: 'integer',
			columnName: 'idmodule',
			primaryKey: true
		},

		name: {
			type: 'string',
			columnName: 'name'
		},

		moduleLabel: {
			type: 'string',
			columnName: 'module_label'
		},
		
		isActive: {
			type: 'integer',
			columnName: 'active'
		}
	}
});

module.exports = modules;
