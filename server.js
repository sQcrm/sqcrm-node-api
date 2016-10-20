// Dependencies
var _ = require('lodash'),
	bodyParser = require('body-parser'),
	express = require('express'),
	fs = require('fs'),
	methodOverride = require('method-override'),
	path = require('path'),
	waterline = require('waterline'),
	JSONAPISerializer = require('jsonapi-serializer').Serializer,
	inflection = require('inflection'),
	oauthserver = require('oauth2-server');

// Instantiations and configs
var app = express(),
	config = require('./config/config'),
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
app.use(bodyParser.json());
app.use(methodOverride());

// Setup routes
var routes = new Router(app);
app.use(config.apiNamespace, routes);

// Setup JSONAPI response with the supplied options (global scope) in controllers  via res.locals 
app.use( function(req, res, next) {
	var JSONAPIOptions = res.locals.JSONAPIOptions,
		status = res.locals.status || 200,
		responseBody = res.body;
	
	if (JSONAPIOptions) {
		if (!JSONAPIOptions.typeForAttribute) {
			// making sure to singularize if typeForAttribute is not specified in option explicitely
			JSONAPIOptions.typeForAttribute = function(attribute) {
				return inflection.singularize(attribute);
			};
		}
		// always camelize the attributes
		JSONAPIOptions.keyForAttribute = function(attribute) {
			return inflection.camelize(attribute, true);
		};
		
		// do the serialize 
		var data = new JSONAPISerializer(JSONAPIOptions.resourceType, JSONAPIOptions).serialize(responseBody);
		// response data along with status 
		res.status(status).json(data);
	} else {
		res.status(status).json({data:responseBody});
	}
});

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
	
	// TODO better error handlers
	if (err) {
		var errRes = {},
			code = 500;
		errRes.code = code;
		if (_.isObject(err)) {
			if (_.has(err,'status') && err.status) {
				code = err.status;
				errRes.code = code;
			} 
			
			if (_.has(err,'title') && err.title) {
				errRes.error = err.title;
			}
			
			if (_.has(err,'details') && err.details) {
				errRes.error_description = err.details;
			}
		} else {
			errRes.error = err;
		}
		res.status(code).json(errRes);
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
