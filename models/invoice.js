var Waterline = require('waterline');

var invoice = Waterline.Collection.extend({

	identity: 'invoice',
	connection: 'sqcrmMysql',
	tableName: 'invoice',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		id: {
			type: 'integer',
			columnName: 'idinvoice',
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

module.exports = invoice;
