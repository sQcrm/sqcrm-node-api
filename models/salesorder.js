var Waterline = require('waterline');

var salesorder = Waterline.Collection.extend({

	identity: 'salesorder',
	connection: 'sqcrmMysql',
	tableName: 'sales_order',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		id: {
			type: 'integer',
			columnName: 'idsales_order',
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

module.exports = salesorder;
