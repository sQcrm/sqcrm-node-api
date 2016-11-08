var Waterline = require('waterline');

var lineitems = Waterline.Collection.extend({

	identity: 'lineitems',
	connection: 'sqcrmMysql',
	tableName: 'lineitems',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		id: {
			type: 'integer',
			required: true,
			columnName: 'idlineitems',
			primaryKey: true
		},

		recordid: {
			type: 'integer',
			required: true,
			columnName: 'recordid'
		},

		itemType: {
			type: 'string',
			required: true,
			columnName: 'item_type'
		},
		
		itemName: {
			type: 'string',
			required: true,
			columnName: 'item_name'
		},
		
		itemValue: {
			type: 'string',
			required: true,
			columnName: 'item_value'
		},
		
		itemDescription: {
			type: 'string',
			columnName: 'item_description'
		},
		
		itemQuantity: {
			type: 'float',
			required: true,
			columnName: 'item_quantity'
		},
		
		itemPrice: {
			type: 'float',
			required: true,
			columnName: 'item_price'
		},
		
		discountType: {
			type: 'string',
			columnName: 'discount_type'
		},
		
		discountValue: {
			type: 'float',
			columnName: 'discount_value'
		},
		
		discountedAmount: {
			type: 'float',
			columnName: 'discounted_amount'
		},
		
		taxValues: {
			type: 'string',
			columnName: 'tax_values'
		},
		
		taxedAmount: {
			type: 'float',
			columnName: 'taxed_amount'
		},
		
		totalAfterDiscount: {
			type: 'float',
			columnName: 'total_after_discount'
		},
		
		totalAfterTax: {
			type: 'float',
			columnName: 'total_after_tax'
		},
		
		netTotal: {
			type: 'float',
			columnName: 'net_total'
		}
	}
});

module.exports = lineitems;
