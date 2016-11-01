var _ = require('lodash'),
	crmPrivileges = require('../utils/crm_privileges'),
	modulesConfig = require('../config/modules_config'),
	async = require('async'),
	pagination = require('../utils/pagination');
/**
 * @swagger
 * resourcePath: /organizations
 * description: sQcrm Organizations 
 */
module.exports = function(app, config) {
	var apiNamespace = config.apiNamespace,
		resourceType = 'organizations';
	
	// Public Methods
	return {
		/**
		* @swagger
		* path: /api/v1/organizations
		* operations:
		*   -  httpMethod: GET
		*      summary: Get all the organizations
		*      notes: Return all the organization associated with the token
		*      responseClass: organizations
		*      nickname: organizations
		*      parameters:
		*        - name: Authorization
		*          description: access token
		*          paramType: header
		*          required: true
		*          dataType: string
		*          defaultValue: Bearer ACCESS_TOKEN_HERE
		*        - name: page
		*          description: page number of results
		*          paramType: query
		*          required: false
		*          dataType: integer
		*          defaultValue: 1
		*        - name: limit
		*          description: the number of results per page
		*          paramType: query
		*          required: false
		*          dataType: integer
		*          defaultValue: 50
		*/
		getAll: function(req, res, next) {
			var apiBase = req.protocol + '://' + req.get('host') + apiNamespace,
				apiEndpoint = apiBase + '/' + resourceType + '/',
				whereClause,
				page,
				limit;

			crmPrivileges.userWhereCondition(req, 6, 'organization', 'org_to_grp_rel', true, function(err, whereCond) {
				if (err) return next(err);
				whereClause = whereCond;
			});
			
			pagination.parsePagingRequest(req, function(err, pagingReq) {
				if (err) return next(err);
				page = pagingReq.page - 1; // limit 0,1 in case the page is 1
				limit = pagingReq.limit;
			});
			
			
			async.auto({
				// get the record count
				recordCount: function(autoCallback) {
					var query = " select count(*) as tot from `organization`";
						query+= " inner join `organization_address` on `organization_address`.`idorganization` = `organization`.`idorganization`";
						query+= " inner join `organization_custom_fld` on `organization_custom_fld`.`idorganization` = `organization`.`idorganization`";
						query+= " left join `user` on `user`.`iduser` = `organization`.`iduser`";
						query+= " left join `org_to_grp_rel` on `org_to_grp_rel`.`idorganization` = `organization`.`idorganization`";
						query+= " left join `group` on `group`.`idgroup` = `org_to_grp_rel`.`idgroup`";
						query+= " where `organization`.`deleted` = 0";
						query+= whereClause;
					
					app.models.organizations
					.query(query, function(err, orgCount) {
						if (err) return autoCallback(err);
						return autoCallback(null, orgCount);
					});
				},
			  
				// get the records
				getRecords: ['recordCount', function(result, autoCallback) {
					// if record count is 0 then no need to execute the query to get the data
					var orgCount = (_.isArray(result.recordCount)) ? result.recordCount[0].tot : result.recordCount.tot;
					if (orgCount === 0) return autoCallback();

					var query = " select `organization`.`idorganization` as `id`,`organization`.*,";
						query+= " `organization_address`.*,";
						query+= " `organization_custom_fld`.*,";
						query+= " `org_to_grp_rel`.`idgroup`,";
						query+= " `org2`.`organization_name` as `organization_member_of`,";
						query+= " case when (`user`.`user_name` not like '')";
						query+= " then";
						query+= " `user`.`user_name`";
						query+= " else";
						query+= " `group`.`group_name` end";
						query+= " as `assigned_to`";
						query+= " from `organization`";
						query+= " inner join `organization_address` on `organization_address`.`idorganization` = `organization`.`idorganization`";
						query+= " inner join `organization_custom_fld` on `organization_custom_fld`.`idorganization` = `organization`.`idorganization`";
						query+= " left join `user` on `user`.`iduser` = `organization`.`iduser`";
						query+= " left join `org_to_grp_rel` on `org_to_grp_rel`.`idorganization` = `organization`.`idorganization`";
						query+= " left join `group` on `group`.`idgroup` = `org_to_grp_rel`.`idgroup`";
						query+= " left join `organization` as `org2` on `organization`.`member_of` = `org2`.`idorganization` AND `organization`.`member_of` <> 0";
						query+= " where `organization`.`deleted` = 0";
						query+= whereClause;
						query+= " order by `organization`.`idorganization`";
						query+= " limit "+page+" , "+limit;
					
					app.models.organizations
					.query(query, function(err, orgs) {
						if (err) return autoCallback(err);
						return autoCallback(null, orgs);
					});
				}]
			},
			function(err, results) {
				if (err) return next(err);
				var organizations = _.map(results.getRecords, function(orgData) {
					// add the address info in the response data 
					var addressInfo = {};
					modulesConfig.moduleAttributes.Organization.address.forEach( function(attr) {
						addressInfo[attr]= orgData[attr];
					}); 
					orgData.address = addressInfo;
					return orgData;
				});
				
				var orgCount = (_.isArray(results.recordCount)) ? results.recordCount[0].tot : results.recordCount.tot;
				var pagingLinks = pagination.pagingLinks(req, orgCount, apiEndpoint);
				
				res.locals.JSONAPIOptions = {
					resourceType: resourceType,
					topLevelLinks: pagingLinks,
					attributes:modulesConfig.moduleAttributes.Organization.default,
					dataLinks: {
						self: function (organizations,orgs) {
							return apiEndpoint + orgs.id;
						}
					}
				};
				res.locals.meta = {totalRecords: orgCount};
				res.body = organizations;
				return next(); 
			});
		}	
	};
};
