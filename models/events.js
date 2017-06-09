var Waterline = require('waterline');

var events = Waterline.Collection.extend({

	identity: 'events',
	connection: 'sqcrmMysql',
	tableName: 'events',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		id: {
			type: 'integer',
			columnName: 'idevents',
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

module.exports = events;
