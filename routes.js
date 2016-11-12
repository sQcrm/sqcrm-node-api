var router = require('express').Router(),
	fs = require('fs'),
	config = require(__dirname + '/config/config'),
	crmPrivileges = require(__dirname+'/utils/crm_privileges');

module.exports = function Router(app) {

	// Load all controller modules from the controllers folder
	var controllerPath = __dirname + '/controllers/',
		appControllers = {},
		appControllerPaths = [];

	//Create an object to store all controller files found under /controllers/
	fs.readdirSync(controllerPath).forEach(function(file) {
		appControllers[file.replace('.js', '')] = require(controllerPath + file)(app, config);
		appControllerPaths.push(controllerPath + file);
	});

	// Swagger setup
	if (config.env !== 'production') {
		app.use(require('swagger-express').init(app, {
			apiVersion: config.version,
			swaggerVersion: '1.0',
			swaggerURL: config.apiNamespace + '/docs',
			swaggerJSON: config.apiNamespace + '/docs.json',
			swaggerUI: __dirname + '/public/docs/',
			basePath: config.protocol + config.domain,
			apis: appControllerPaths
		}));
	}
	
	/**
	 * middleware to check if the module access is permitted for the request
	*/
	function moduleAccess(moduleName) {
		return moduleAccess[moduleName] || (moduleAccess[moduleName]= function(req, res, next) {
			crmPrivileges.isModuleAccessAllowed(req, moduleName, function(err) {
				if (err) return next(err);
				return next();
			});
		});
	}
	
	/**
	 * middleware to check if the action is permitted on the module i.e. view, add, edit, delete
	*/
	function actionPermitted(moduleName, action) {
		return actionPermitted[moduleName] || (actionPermitted[moduleName] = function(req, res, next) {
			crmPrivileges.isActionPermitted(req, moduleName, action, function(err) {
				if (err) return next(err);
				return next();
			});
		});
	}
	
	router.route('/oauth/token')
	.post(app.oauth.grant());
	
	router.get('*', app.oauth.authorise());
	router.post('*', app.oauth.authorise());
	
	router.route('/test')
	.get(moduleAccess('Contacts'),actionPermitted('Contacts','view'),appControllers.test.getAll);
	
	//Leads endpoint 
	router.route('/leads')
	.get(moduleAccess('Leads'),actionPermitted('Leads','view'),appControllers.leads.getAll);
	
	// Organizations end point
	router.route('/organizations')
	.get(moduleAccess('Organization'),actionPermitted('Organization','view'),appControllers.organizations.getAll);
	
	// Prospects end point
	router.route('/prospects')
	.get(moduleAccess('Potentials'),actionPermitted('Potentials','view'),appControllers.prospects.getAll);
	
	// CalendarEvents end point
	router.route('/calendarevents')
	.get(moduleAccess('Calendar'),actionPermitted('Calendar','view'),appControllers.events.getAll);
        
	//Contacts end point 
	router.route('/contacts')
	.get(moduleAccess('Contacts'),actionPermitted('Contacts','view'),appControllers.contacts.getAll);
	
	// Vendors end point
	router.route('/vendors')
	.get(moduleAccess('Vendor'),actionPermitted('Vendor','view'),appControllers.vendors.getAll);
	
	//Contacts end point 
	router.route('/Products')
	.get(moduleAccess('Products'),actionPermitted('Products','view'),appControllers.products.getAll);

	// Quotes end point
	router.route('/quotes')
	.get(moduleAccess('Quotes'),actionPermitted('Quotes','view'),appControllers.quotes.getAll);
	
	// SalesOrder end point
	router.route('/salesorders')
	.get(moduleAccess('SalesOrder'),actionPermitted('SalesOrder','view'),appControllers.salesorder.getAll);
	
	// Invoice end point
	router.route('/invoices')
	.get(moduleAccess('Invoice'),actionPermitted('Invoice','view'),appControllers.invoice.getAll);
	
	return router;
};