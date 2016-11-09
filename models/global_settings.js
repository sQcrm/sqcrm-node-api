var Waterline = require('waterline');

var global_settings = Waterline.Collection.extend({

	identity: 'global_settings',
	connection: 'sqcrmMysql',
	tableName: 'crm_global_settings',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		id: {
			type: 'string',
			required: true,
			columnName: 'idcrm_global_settings',
			primaryKey: true
		},

		settingName: {
			type: 'string',
			required: true,
			columnName: 'setting_name'
		},

		settingData: {
			type: 'string',
			required: true,
			columnName: 'setting_data'
		}
	}
});

module.exports = global_settings;
