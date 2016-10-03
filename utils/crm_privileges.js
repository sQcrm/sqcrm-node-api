var _ = require('lodash'),
	async = require('async'),
	config = require('../config/config');
	
var moduleMapping = {
	Test:1
};

/**
 * load the crm privileges for user scope 
 * @param object app - express app instance
 * @param object user - user object retrived via oauth
 * @param function callback - callback function once done
*/
exports.loadCRMPrivileges = function(app, user, callback) {
	if (!user) {
		return callback();
	}
	
	var crmPrivileges = {};
	crmPrivileges.isAdmin = (user.isAdmin === 1 ? 1 : 0);
	
	async.auto({
		// get the active modules of the crm 
		getActiveModules: function(autoCallback) {
			app.models.modules
			.find({isActive:1})
			.exec(function(err, modules) {
				if (err) return autoCallback(err);
				if (!modules) return autoCallback();
				return autoCallback(null, _.map(modules,'id'));
			});
		},
		
		// get the role detail of the user
		getRoleDetail: function(autoCallback) {
			if (user.isAdmin === 1) return autoCallback();
			app.models.roles
			.findOne({roleId:user.roleId})
			.exec(function(err, userRoleData) {
				if (err) return autoCallback();
				if (!userRoleData) return autoCallback();
				return autoCallback(null, userRoleData);
			})
		},
		
		// get the module datashare permissions
		getModuleDatasharePermissions: function(autoCallback) {
			app.models.module_datashare_rel
			.findAll()
			.exec(function(err, datasharePermissions) {
				if (err) return autoCallback();
				if (!datasharePermissions) return autoCallback();
				return autoCallback(null, datasharePermissions);
			});
		},
		
		// get the subordibate users if not admin
		getSubordinateUsers: ['getRoleDetail', function(result, autoCallback) {
			if (user.isAdmin === 1) return autoCallback();
			var parentRole = result.getRoleDetail.parentRole;
			var query =  " select u.iduser from user u";
				query += " join role r on r.idrole = u.idrole";
				query += " where";
				query += " r.parentrole like '"+parentRole+"%'";
				query += " AND u.idrole <> '"+user.roleId+"'";
				query += " AND u.iduser <> "+user.id;
			
			app.models.user
			.query(query, function(err, subUsers) {
				if (err) return autoCallback();
				if (!subUsers) return autoCallback();
				return autoCallback(null,_.map(subUsers,'iduser'));
			})
		}],
		
		// get the module standard permissions for the associated profiles view ,add/edit, delete
		getUserModuleStandardPermissions: function(autoCallback) {
			if (user.isAdmin === 1) return autoCallback();
			var query =  " select pspr.idmodule,pspr.idstandard_permission,max(pspr.permission_flag) as permission_flag";
				query += " from profile_standard_permission_rel pspr";
				query += " join role_profile_rel rpl on rpl.idprofile = pspr.idprofile";
				query += " where rpl.idrole = 'N2'";
				query += " group by pspr.idmodule,pspr.idstandard_permission";
				
			app.models.profile_standard_permission_rel
			.query(query, function(err, standardPermissions) {
				if (err) return autoCallback();
				if (!standardPermissions) return autoCallback();
				return autoCallback(null,standardPermissions);
			});
		},
		
		// get the module access permissions for the associated profiles
		getUserModulePermissions: function(autoCallback) {
			if (user.isAdmin === 1) return autoCallback();
			var query =  " select pmr.idmodule, max(pmr.permission_flag) as permission_flag";
				query += " from profile_module_rel pmr";
				query += " join role_profile_rel rpl on rpl.idprofile = pmr.idprofile";
				query += " where rpl.idrole = '"+user.roleId+"'";
				query += " group by pmr.idmodule";
				
			app.models.profile_module_rel
			.query(query, function(err,modulePemissions) {
				if (err) return autoCallback();
				if (!modulePemissions) return autoCallback();
				return autoCallback(null, modulePemissions);
			});
		}
	},
	function(err, results) {
		if (err) return callback(err);
		
		if (user.isAdmin === 1) {
			return callback(null, crmPrivileges);
		} else {
			if (results.getActiveModules) {
				crmPrivileges.activeModules = results.getActiveModules;
			}
			
			if (results.getSubordinateUsers) {
				crmPrivileges.subordibateUsers = results.getSubordinateUsers;
			}
			
			if (results.getModuleDatasharePermissions) {
				crmPrivileges.datasharePermissions = results.getModuleDatasharePermissions;
			}
			
			var modulePermissions = {};
			var moduleStandardPermissions = {};
			
			// loop through the active modules
			async.each(results.getActiveModules, function(moduleId, err) {
				// create object with the module permssions with the moduleId
				_.find(results.getUserModulePermissions, function(permissionValue) {
					if (permissionValue.idmodule === moduleId) {
						modulePermissions[moduleId] =  permissionValue.permission_flag ;
					}
				});
				// create the object with the standard permissions with the moduleId
				var perArr = {};
				_.find(results.getUserModuleStandardPermissions, function(standardPermissionsValue) {
					if (standardPermissionsValue.idmodule === moduleId) {
						var idStandardPermission = standardPermissionsValue.idstandard_permission;
						var permissionFlag = standardPermissionsValue.permission_flag;
						
						if (standardPermissionsValue.idstandard_permission === 1) {
							perArr["1"] = standardPermissionsValue.permission_flag;
						}
						
						if (standardPermissionsValue.idstandard_permission === 2) {
							perArr["2"] = standardPermissionsValue.permission_flag;
						}
						
						if (standardPermissionsValue.idstandard_permission === 1) {
							perArr["3"] = standardPermissionsValue.permission_flag;
						}
						
						moduleStandardPermissions[moduleId] = perArr;
					}
				});
			});
			crmPrivileges.modulePemissions = modulePermissions;
			crmPrivileges.moduleStandardPermissions = moduleStandardPermissions;
		}
		return callback(null, crmPrivileges);
	});
};

/**
 * checks if the module access is allowed
 * @param object req - request object of express
 * @param string moduleName - module name of the CRM 
 * @param function callback - callback function once done
*/
exports.isModuleAccessAllowed = function(req, moduleName, callback) {
	var scope = req.oauth.bearerToken.scope,
		privileges = req.oauth.bearerToken.privileges,
		moduleId;
	
	if (moduleName in moduleMapping) {
		moduleId = moduleMapping[moduleName];
	}
	if (!moduleId) return callback('Unauthorized access ! Module not found !');
	if (_.indexOf(privileges.activeModules,moduleId) === -1) return callback('Unauthorized access ! Module not found !');
	if (scope === 'user') {
		if (privileges.isAdmin === 1) return callback();
		if (_.has(privileges.modulePemissions,moduleId) && privileges.modulePemissions[moduleId] === 1) {
			return callback();
		} else {
			return callback('Unauthorized access ! Module is not allowed to be accessed !');
		}
	} else {
		// for now if the scope is not user allow module access
		return callback();
	}
};