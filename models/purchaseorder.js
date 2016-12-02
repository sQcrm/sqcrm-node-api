var Waterline = require('waterline');

var purchaseorder = Waterline.Collection.extend({

	identity: 'purchaseorder',
	connection: 'sqcrmMysql',
	tableName: 'purchase_order',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		id: {
			type: 'integer',
			columnName: 'idpurchase_order',
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

module.exports = purchaseorder;
