var Waterline = require('waterline');

var products = Waterline.Collection.extend({

	identity: 'products',
	connection: 'sqcrmMysql',
	tableName: 'products',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		id: {
			type: 'integer',
			columnName: 'idproducts',
			primaryKey: true
		},

		productName: {
			type: 'string',
			columnName: 'product_name'
		},

		isActive: {
			type: 'string',
			columnName: 'is_active'
		},

		productCategory: {
			type: 'string',
			columnName: 'product_category'
		},
		
		manufacturer: {
			type: 'string',
			columnName: 'manufacturer'
		},
		
		idvendor: {
			type: 'integer',
			columnName: 'idvendor'
		},
		
		vendorName: {
			type: 'string',
			columnName: 'vendor_name'
		},
		
		website: {
			type: 'string',
			columnName: 'website'
		},
		
		description: {
			type: 'string',
			columnName: 'description'
		},
		
		assignedTo: {
			type: 'string',
			columnName: 'assigned_to'
		},
		
		addedOn: {
			type: 'string',
			columnName: 'added_on'
		},
		
		lastModified: {
			type: 'string',
			columnName: 'last_modified'
		},
		
		priceInformation: {
			type: 'string',
			columnName: 'price_information'
		},
		
		assistantPhone: {
			type: 'string',
			columnName: 'assistant_phone'
		},
		
		quantity: {
			type: 'string',
			columnName: 'quantity'
		},
		
		taxValue: {
			type: 'string',
			columnName: 'tax_value'
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

module.exports = products;
