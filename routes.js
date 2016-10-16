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
				if (err) {
					return next({
						status: 403,
						title: err
					});
				}
				return next();
			});
		});
	}
	
	router.route('/oauth/token')
	.post(app.oauth.grant());
	
	router.get('*', app.oauth.authorise());
	router.post('*', app.oauth.authorise());
	
	router.route('/test')
	.get(moduleAccess('Contacts'),appControllers.test.getAll);
	
	return router;
};