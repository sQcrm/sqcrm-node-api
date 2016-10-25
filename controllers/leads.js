var _ = require('lodash'),
	crmPrivileges = require('../utils/crm_privileges'),
	modulesConfig = require('../config/modules_config'),
	async = require('async'),
	pagination = require('../utils/pagination');
/**
 * @swagger
 * resourcePath: /leads
 * description: sQcrm Leads 
 */
module.exports = function(app, config) {
	var apiNamespace = config.apiNamespace,
		resourceType = 'leads';
	
	// Public Methods
	return {
		/**
		* @swagger
		* path: /api/v1/leads
		* operations:
		*   -  httpMethod: GET
		*      summary: Get all the leads
		*      notes: Return some test data
		*      responseClass: test
		*      nickname: test
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

			crmPrivileges.userWhereCondition(req, 3, 'leads', 'leads_to_grp_rel', true, function(err, whereCond) {
				if (err) return next(err);
				whereClause = whereCond;
			});
			
			pagination.parsePagingRequest(req, function(err, pagingReq) {
				if (err) return next(err);
				page = pagingReq.page;
				limit = pagingReq.limit;
			});
			
			
			async.auto({
				// get the record count
				recordCount: function(autoCallback) {
					var query = " select count(*) as tot from `leads`";
						query+= " inner join `leads_address` on `leads_address`.`idleads` = `leads`.`idleads`";
						query+= " inner join `leads_custom_fld` on `leads_custom_fld`.`idleads` = `leads`.`idleads`";
						query+= " left join `user` on `user`.`iduser` = `leads`.`iduser`";
						query+= " left join `leads_to_grp_rel` on `leads_to_grp_rel`.`idleads` = `leads`.`idleads`";
						query+= " left join `group` on `group`.`idgroup` = `leads_to_grp_rel`.`idgroup`";
						query+= " where `leads`.`deleted` = 0";
						query+= whereClause;
					
					app.models.leads
					.query(query, function(err, leadCount) {
						if (err) return autoCallback(err);
						return autoCallback(null, leadCount);
					});
				},
			  
				// get the records
				getRecords: ['recordCount', function(result, autoCallback) {
					// if record count is 0 then no need to execute the query to get the data
					var leadCount = (_.isArray(result.recordCount)) ? result.recordCount[0].tot : result.recordCount.tot;
					if (leadCount === 0) return autoCallback();

					var query = " select `leads`.`idleads` as `id`, `leads`.*,`leads_address`.*,`leads_custom_fld`.*,`leads_to_grp_rel`.`idgroup`,";
						query+= " case when (`user`.`user_name` not like '')";
						query+= " then";
						query+= " `user`.`user_name`";
						query+= " else";
						query+= " `group`.`group_name` end";
						query+= " as `assigned_to`";
						query+= " from `leads`";
						query+= " inner join `leads_address` on `leads_address`.`idleads` = `leads`.`idleads`";
						query+= " inner join `leads_custom_fld` on `leads_custom_fld`.`idleads` = `leads`.`idleads`";
						query+= " left join `user` on `user`.`iduser` = `leads`.`iduser`";
						query+= " left join `leads_to_grp_rel` on `leads_to_grp_rel`.`idleads` = `leads`.`idleads`";
						query+= " left join `group` on `group`.`idgroup` = `leads_to_grp_rel`.`idgroup`";
						query+= " where `leads`.`deleted` = 0";
						query+= whereClause;
						query+= " limit "+page+" , "+limit;
					
					app.models.leads
					.query(query, function(err, leads) {
						if (err) return autoCallback(err);
						return autoCallback(null, leads);
					});
				}]
			},
			function(err, results) {
				if (err) return next(err);
				var leads = _.map(results.getRecords, function(leadsData) {
					// add the address info in the response data 
					var addressInfo = {};
					modulesConfig.moduleAttributes.Leads.address.forEach( function(attr) {
						addressInfo[attr]= leadsData[attr];
					}); 
					leadsData.address = addressInfo;
					return leadsData;
				});
				
				var leadCount = (_.isArray(results.recordCount)) ? results.recordCount[0].tot : results.recordCount.tot;
				var pagingLinks = pagination.pagingLinks(page, limit, leadCount, apiEndpoint);
				
				res.locals.JSONAPIOptions = {
					resourceType: resourceType,
					topLevelLinks: pagingLinks,
					attributes:modulesConfig.moduleAttributes.Leads.default,
					dataLinks: {
						self: function (leads,lead) {
							return apiEndpoint + lead.id;
						}
					}
				};
				res.locals.meta = {totalRecords: leadCount};
				res.body = leads;
				return next(); 
			});
		}	
	};
};
