var Waterline = require('waterline');

var group_user_rel = Waterline.Collection.extend({

	identity: 'group_user_rel',
	connection: 'sqcrmMysql',
	tableName: 'group_user_rel',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		groupId: {
			type: 'integer',
			columnName: 'idgroup'
		},

		userId: {
			type: 'integer',
			columnName: 'iduser'
		}
	}
});

module.exports = group_user_rel;
