// Require any waterline compatible adapters here
var mysqlAdapter = require('sails-mysql'),
	envData = require('dotenv').config(),
	port = process.env.PORT || 9601,
	env = process.env.NODE_ENV || 'local',
	apiNamespace = '/api/v1',
	domain = process.env.API_DOMAIN,
	protocol = 'https://';

// If local, append port to the domain and serve over http.
// Mostly to support Swagger, though config.protocol is used elsewhere.
if (env === 'local') {
	domain += ':' + port;
	protocol = 'http://';
}

module.exports = {
	version: '1.0.0',
	port: port,
	env: env,
	domain: domain,
	protocol: protocol,
	apiNamespace: apiNamespace,	
	
	// waterline config for the adapters with no migration, need to make sure model related tables are already there.
	waterline: {

		// Setup named Adapters
		adapters: {
			'default': mysqlAdapter,
			mysql: mysqlAdapter
		},

		// Connection config for orm with named adapter, read and write connections useful for replication
		// if no replication is done then read and write will use the same db and credentials
		connections: {
			sqcrmMysql: {
				adapter: 'mysql',
				host: process.env.API_DB_MYSQL_READ_HOST,
				user: process.env.API_DB_MYSQL_READ_USER,
				password: process.env.API_DB_MYSQL_READ_PASS,
				database: process.env.API_DB_MYSQL_NAME,
				charset: 'utf8mb4'
			},
			sqcrmWrite: {
				adapter: 'mysql',
				host: process.env.API_DB_MYSQL_WRITE_HOST,
				user: process.env.API_DB_MYSQL_WRITE_USER,
				password: process.env.API_DB_MYSQL_WRITE_PASS,
				database: process.env.API_DB_MYSQL_NAME,
				charset: 'utf8mb4'
			}
		},

		defaults: {
			migrate: 'safe'
		}
	},
	
	oauth: {
		accessTokenLifetime: 7200, // 2 hours
		refreshTokenLifetime: 7776000, // 90 days
		grants: ['client_credentials', 'refresh_token', 'password'],
		debug: false
	}
};
