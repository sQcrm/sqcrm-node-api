// Dependencies
var _ = require('lodash'),
	bodyParser = require('body-parser'),
	express = require('express'),
	fs = require('fs'),
	methodOverride = require('method-override'),
	path = require('path'),
	Waterline = require('waterline');

// Instantiations and configs
var app = express(),
	config = require('./config/config'),
	isProd = (config.env === 'production'),
	Router = require('./routes'),
	orm = new Waterline();

// Load all models into Waterline
var modelsDir = __dirname + '/models';
fs.readdirSync(modelsDir)
	.filter(function(file) {
		return (file.indexOf(".") !== 0);
	})
	.forEach(function(file) {
		var model = require(path.join(modelsDir, file));
		orm.loadCollection(model);
	});

// Setup Express Application
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(methodOverride());

// Setup routes
var routes = new Router(app);
app.use(config.apiNamespace, routes);

// START WATERLINE

// Start Waterline passing adapters in
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
