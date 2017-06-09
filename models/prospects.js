var Waterline = require('waterline');

var prospects = Waterline.Collection.extend({

	identity: 'prospects',
	connection: 'sqcrmMysql',
	tableName: 'potentials',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		id: {
			type: 'integer',
			columnName: 'idpotentials',
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

module.exports = prospects;
