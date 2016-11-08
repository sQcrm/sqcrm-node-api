var Waterline = require('waterline');

var quotes = Waterline.Collection.extend({

	identity: 'quotes',
	connection: 'sqcrmMysql',
	tableName: 'quotes',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		id: {
			type: 'integer',
			columnName: 'idquotes',
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

module.exports = quotes;
