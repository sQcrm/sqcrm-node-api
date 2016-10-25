var Waterline = require('waterline');

var organizations = Waterline.Collection.extend({

	identity: 'organizations',
	connection: 'sqcrmMysql',
	tableName: 'organization',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		id: {
			type: 'integer',
			columnName: 'idorganization',
			primaryKey: true
		},
		
		deleted: {
			type: 'integer'
		},
		
		toJSON: function() {
			var obj = this.toObject();
			return obj;
		}
	}
});

module.exports = organizations;
