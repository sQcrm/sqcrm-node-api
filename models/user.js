var Waterline = require('waterline');

var user = Waterline.Collection.extend({

	identity: 'user',
	connection: 'sqcrmMysql',
	tableName: 'user',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		id: {
			type: 'integer',
			columnName: 'iduser',
			primaryKey: true
		},

		firstName: {
			type: 'string',
			columnName: 'firstname'
		},

		lastName: {
			type: 'string',
			columnName: 'lastname'
		},

		userName: {
			type: 'string',
			columnName: 'user_name'
		},

		isAdmin: {
			type: 'string',
			columnName: 'is_admin'
		},

		password: {
			type: 'string'
		},
		
		title: {
			type: 'string'
		},
		
		department: {
			type: 'string'
		},
		
		fax: {
			type: 'string'
		},
		
		officePhone: {
			type: 'string',
			columnName: 'office_phone'
		},
		
		otherEmail: {
			type: 'string',
			columnName: 'other_email'
		},
		
		mobileNum: {
			type: 'string',
			columnName: 'mobile_num'
		},

		deleted: {
			type: 'integer'
		},
		
		isActive: {
			type: 'integer',
			columnName: 'is_active'
		},
		
		roleId: {
			type: 'string',
			columnName: 'idrole'
		},
		
		privileges: function() {
			return this.privileges;
		},
		
		toJSON: function() {
			var obj = this.toObject();
			obj.privileges = this.privileges();
			return obj;
		}
	}
});

module.exports = user;
