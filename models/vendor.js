var Waterline = require('waterline');

var vendor = Waterline.Collection.extend({

	identity: 'vendor',
	connection: 'sqcrmMysql',
	tableName: 'vendor',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		id: {
			type: 'integer',
			columnName: 'idvendor',
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

module.exports = vendor;
