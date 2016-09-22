// Dependencies
var _ = require('lodash'),
	bodyParser = require('body-parser'),
	express = require('express'),
	fs = require('fs'),
	methodOverride = require('method-override'),
	path = require('path'),
	waterline = require('waterline'),
	oauthserver = require('oauth2-server');

// Instantiations and configs
var app = express(),
	config = require('./config/config'),
	isProd = (config.env === 'production'),
	Router = require('./routes'),
	orm = new waterline();

// Load all models into Waterline
var modelsDir = __dirname + '/models';
var modelFiles = fs.readdirSync(modelsDir);
var model = '';
_.filter(modelFiles, function(file) {
	if (file.indexOf(".") !== 0) {
		model = require(path.join(modelsDir, file));
		orm.loadCollection(model);
	}
});

// Start OAuth server
app.oauth = oauthserver({
	accessTokenLifetime: config.oauth.accessTokenLifetime,
	refreshTokenLifetime: config.oauth.refreshTokenLifetime,
	grants: config.oauth.grants,
	debug: config.oauth.debug,
	model: require('./controllers/oauth.js')(app, config)
});
	
// Setup Express Application
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(methodOverride());

// Setup routes
var routes = new Router(app);
app.use(config.apiNamespace, routes);

// error handlers 
app.use(function(err, req, res, next) {
	// handling the oauth server errors
	if (err.name && err.name === 'OAuth2Error') {
		var responseBody = {
			code: err.code,
			error: err.error,
			error_description: err.error_description,
		};
		res.json(responseBody);	
	}
});

// Initialize Waterline with the orm config
orm.initialize(config.waterline, function(err, models) {
	if (err) {
		console.log('Error initializing ORM. '+err);
		throw err;
	}

	app.models = models.collections;
	app.connections = models.connections;

	// Start Server
	app.listen(config.port);
	console.log('App listening in '+ config.env.toUpperCase() + ' on port ' + config.port);
});
