var _ = require('lodash'),
	async = require('async'),
	modulesConfig = require('../config/modules_config');

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
			});
		},
		
		// get the module datashare permissions
		getModuleDatasharePermissions: function(autoCallback) {
			app.models.module_datashare_rel
			.find()
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
			});
		}],
		
		// get the associated groups of the user 
		getGroups: ['getSubordinateUsers', function(result, autoCallback) {
			if (user.isAdmin === 1) return autoCallback();
			var subordibateUsers = result.getSubordinateUsers,
				userId = user.id,
				groupUsers;
			
			if (subordibateUsers) {
				groupUsers = _.union(subordibateUsers,[userId]);
			} else {
				groupUsers = [userId];
			}
			
			app.models.group_user_rel
			.find({userId:groupUsers})
			.exec(function(err, groups) {
				if (err) return autoCallback();
				if (!groups) return autoCallback();
				return autoCallback(null, _.uniq(_.map(groups,'groupId')));
			});
			
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
		
		if (results.getActiveModules) {
			crmPrivileges.activeModules = results.getActiveModules;
		}
			
		if (user.isAdmin === 1) {
			return callback(null, crmPrivileges);
		} else {
			if (results.getSubordinateUsers) {
				crmPrivileges.subordibateUsers = results.getSubordinateUsers;
			}
			
			if (results.getGroups) {
				crmPrivileges.groups = results.getGroups;
			}
			
			var modulePermissions = {};
			var moduleStandardPermissions = {};
			var moduleDatasharePer = {};
			
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
						
						if (idStandardPermission === 1) {
							perArr["1"] = standardPermissionsValue.permission_flag;
						}
						
						if (idStandardPermission === 2) {
							perArr["2"] = standardPermissionsValue.permission_flag;
						}
						
						if (idStandardPermission === 3) {
							perArr["3"] = standardPermissionsValue.permission_flag;
						}
						
						moduleStandardPermissions[moduleId] = perArr;
					}
				});
				// create the object with the datashare permissions for each module which is the top level
				_.find(results.getModuleDatasharePermissions, function(datasharePermissionsValue) {
					if (datasharePermissionsValue.idmodule === moduleId) {
						moduleDatasharePer[moduleId] = datasharePermissionsValue.permissionFlag;
					}
				});
			});
			crmPrivileges.datasharePermissions = moduleDatasharePer;
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
	
	if (moduleName in modulesConfig.moduleMapping) {
		moduleId = modulesConfig.moduleMapping[moduleName];
	}
	if (!moduleId) return callback({status:403,title:'Unauthorized access !',details:'Module not found for data access!'});
	if (_.indexOf(privileges.activeModules,moduleId) === -1) return callback({status:403,title:'Unauthorized access !',details:'Module not found for data access!'});
	if (scope === 'user') {
		if (privileges.isAdmin === 1) return callback();
		if (_.has(privileges.modulePemissions,moduleId) && privileges.modulePemissions[moduleId] === 1) {
			return callback();
		} else {
			return callback({status:403,title:'Unauthorized access !',details:'Module is not allowed to be accessed !'});
		}
	} else {
		// for now if the scope is not user allow module access
		return callback();
	}
};

exports.isActionPermitted = function(req, moduleName, action, callback) {
	var scope = req.oauth.bearerToken.scope,
		privileges = req.oauth.bearerToken.privileges,
		moduleId;
		
	if (moduleName in modulesConfig.moduleMapping) {
		moduleId = modulesConfig.moduleMapping[moduleName];
	}
	if (!moduleId) return callback({status:403,title:'Unauthorized access !',details:'Module not found for data access!'});
	if (_.indexOf(privileges.activeModules,moduleId) === -1) return callback({status:403,title:'Unauthorized access !',details:'Module not found for data access!'});
	if (scope === 'user') {
		if (privileges.isAdmin === 1) return callback();
		var accessAllowed,
			stdPer;
			
		if (_.has(privileges,'moduleStandardPermissions')) {
			if (_.has(privileges.moduleStandardPermissions,moduleId)) {		
				stdPer = privileges.moduleStandardPermissions[moduleId];
				switch(action) {
					case "view":
						if (stdPer["1"] === 1 || stdPer["2"] === 1 || stdPer["3"] === 1) {
							accessAllowed = true ;
						}
						break;
					
					case "add":
					case "edit":
						if (stdPer["1"] === 1) {
							accessAllowed = true ;
						}
						break;
					
					case "delete":
						if (stdPer["3"] === 1) {
							accessAllowed = true ;
						}
						break;
				}
				if (accessAllowed === true) {
					return callback();
				} else {
					return callback({status:403,title:'Unauthorized access !',details:'Permission not available for '+action});
				}
			} else {
				return callback({status:403,title:'Unauthorized access !',details:'No standard permission found for the module'});
			}
		} else {
			return callback({status:403,title:'Unauthorized access !',details:'No standard permission found'});
		}
	}
};

/**
 * generate the where condition specific to a module data considerting the hierarchy
 * @param object req - request object of express
 * @param integer moduleId - module id for the module 
 * @param string tableName - the entity table name for the module
 * @param string groupRelationTable - the group relation table for the entity
 * @param boolean includeSubordinateUser - whether or not to include the subordibate users data
 * @param function callback - callback function once done
*/
exports.userWhereCondition = function(req, moduleId, tableName, groupRelationTable, includeSubordinateUser, callback) {
	var scope = req.oauth.bearerToken.scope,
		privileges = req.oauth.bearerToken.privileges,
		whereClause="",
		userId;
	if (scope === 'user') {
		userId = req.oauth.bearerToken.user.id;
		if (privileges.isAdmin !== 1) {
			if (_.has(privileges.datasharePermissions,moduleId)) {
				var publicAccessFlags = [1,2,3];
				
				if (privileges.datasharePermissions[moduleId] === 5) {
					whereClause = " AND `"+tableName+"`.`iduser` = "+userId;
				} else if (_.includes(publicAccessFlags, privileges.datasharePermissions[moduleId])) {
					whereClause = " AND 1=1";
				} else {
					var includeGroups = false,
						groupIds,
						subUserIds;
					
					if (groupRelationTable && _.has(privileges,'groups') && privileges.groups && privileges.groups.length > 0) {
						groupIds = privileges.groups.join();
						includeGroups = true;
					}
					
					if (includeSubordinateUser && _.has(privileges,'subordibateUsers') && privileges.subordibateUsers) {
						subUserIds = privileges.subordibateUsers.join();
						if (includeGroups) {
							whereClause = " AND";
							whereClause +=" (";
							whereClause +="	(`"+tableName+"`.`iduser` = "+userId+" OR `"+tableName+"`.`iduser` in("+subUserIds+") )";
							whereClause +="	OR `"+groupRelationTable+"`.`idgroup` in("+groupIds+")";
							whereClause +=" )";
						} else {
							whereClause =" AND ( `"+tableName+"`.`iduser` = "+userId+" OR `"+tableName+"`.`iduser` in("+subUserIds+") )";
						}
					} else {
						if (includeGroups) {
							whereClause = " AND (`"+tableName+"`.`iduser` = "+userId+" OR `"+groupRelationTable+"`.`idgroup` in("+groupIds+")";
						} else {
							whereClause = " AND `"+tableName+"`.`iduser` = "+userId;
						}
					}
				}
			} else {
				return callback('Module does not have the datashare permission set');
			}
		}
		return callback(null, whereClause);
	} else {
		return callback(null, whereClause);
	}
};