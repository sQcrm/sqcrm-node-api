var Waterline = require('waterline');

var leads = Waterline.Collection.extend({

	identity: 'leads',
	connection: 'sqcrmMysql',
	tableName: 'leads',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		id: {
			type: 'integer',
			columnName: 'idleads',
			primaryKey: true
		},

		firstname: {
			type: 'string',
			columnName: 'firstname'
		},

		lastname: {
			type: 'string',
			columnName: 'lastname'
		},

		email: {
			type: 'string',
			columnName: 'email'
		},
		
		phone: {
			type: 'string',
			columnName: 'phone'
		},
		
		mobile: {
			type: 'string',
			columnName: 'mobile'
		},
		
		title: {
			type: 'string',
			columnName: 'title'
		},
		
		fax: {
			type: 'string',
			columnName: 'fax'
		},
		
		leadsource: {
			type: 'string',
			columnName: 'leadsource'
		},
		
		industry: {
			type: 'string',
			columnName: 'industry'
		},
		
		organization: {
			type: 'string',
			columnName: 'organization'
		},
		
		website: {
			type: 'string',
			columnName: 'website'
		},
		
		leadStatus: {
			type: 'string',
			columnName: 'lead_status'
		},
		
		anualRevenue: {
			type: 'string',
			columnName: 'anual_revenue'
		},
		
		rating: {
			type: 'string',
			columnName: 'rating'
		},
		
		description: {
			type: 'string',
			columnName: 'description'
		},
		
		assignedTo: {
			type: 'string',
			columnName: 'assigned_to'
		},

		street: {
			type: 'string',
			columnName: 'street'
		},
		
		poBox: {
			type: 'string',
			columnName: 'po_box'
		},
		
		postalCode: {
			type: 'string',
			columnName: 'postal_code'
		},
		
		country: {
			type: 'string',
			columnName: 'country'
		},
		
		city: {
			type: 'string',
			columnName: 'city'
		},
		
		state: {
			type: 'string',
			columnName: 'state'
		},
		
		addedOn: {
			type: 'string',
			columnName: 'added_on'
		},
		
		lastModified: {
			type: 'string',
			columnName: 'last_modified'
		},
		
		converted: {
			type: 'string',
			columnName: 'converted'
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

module.exports = leads;
