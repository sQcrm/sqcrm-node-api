var _ = require('lodash'),
	crmPrivileges = require('../utils/crm_privileges'),
	modulesConfig = require('../config/modules_config'),
	async = require('async'),
	pagination = require('../utils/pagination');
/**
 * @swagger
 * resourcePath: /prospects
 * description: sQcrm Leads 
 */
module.exports = function(app, config) {
	var apiNamespace = config.apiNamespace,
		resourceType = 'prospects';
	
	// Public Methods
	return {
		/**
		* @swagger
		* path: /api/v1/prospects
		* operations:
		*   -  httpMethod: GET
		*      summary: Get all the prospects
		*      notes: Return all the prospects associated with the token
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

			crmPrivileges.userWhereCondition(req, 5, 'potentials', 'pot_to_grp_rel', true, function(err, whereCond) {
				if (err) return next(err);
				whereClause = whereCond;
			});
			
			pagination.parsePagingRequest(req, function(err, pagingReq) {
				if (err) return next(err);
				page = pagingReq.page -1; // limit 0,1 in case the page is 1
				limit = pagingReq.limit;
			});
			
			
			async.auto({
				// get the record count
				recordCount: function(autoCallback) {
					var query = " select count(*) as tot from `potentials`";
						query+= " inner join `potentials_custom_fld` on `potentials_custom_fld`.`idpotentials` = `potentials`.`idpotentials`";
						query+= " left join `user` on `user`.`iduser` = `potentials`.`iduser`";
						query+= " left join `pot_to_grp_rel` on `pot_to_grp_rel`.`idpotentials` = `potentials`.`idpotentials`";
						query+= " left join `group` on `group`.`idgroup` = `pot_to_grp_rel`.`idgroup`";
						query+= " where `potentials`.`deleted` = 0";
						query+= whereClause;
					
					app.models.leads
					.query(query, function(err, prospectCount) {
						if (err) return autoCallback(err);
						return autoCallback(null, prospectCount);
					});
				},
			  
				// get the records
				getRecords: ['recordCount', function(result, autoCallback) {
					// if record count is 0 then no need to execute the query to get the data
					var prospectCount = (_.isArray(result.recordCount)) ? result.recordCount[0].tot : result.recordCount.tot;
					if (prospectCount === 0) return autoCallback();

					var query = " select `potentials`.`idpotentials` as id, `potentials`.*,";
						query+= " `potentials_custom_fld`.*,";
						query+= " `pot_to_grp_rel`.`idgroup`,";
						query+= " `potentials_related_to`.idmodule as `potentials_related_to_idmodule`,";
						query+= " `potentials_related_to`.related_to,";
						query+= " case when (`user`.`user_name` not like '')";
						query+= " then";
						query+= " `user`.`user_name`";
						query+= " else";
						query+= " `group`.`group_name`";
						query+= " end";
						query+= " as `assigned_to`,";
						query+= " case";
						query+= " when potentials_related_to.related_to not like ''";
						query+= " then";
						query+= " (";
						query+= " case";
						query+= " when sqorg.organization_name not like '' then sqorg.organization_name";
						query+= " when concat(sqcnt.firstname,' ',sqcnt.lastname) not like '' then concat(sqcnt.firstname,' ',sqcnt.lastname)";
						query+= " end";
						query+= " )";
						query+= " else ''";
						query+= " end";
						query+= " as `potentials_related_to_value`";
						query+= " from `potentials`";
						query+= " inner join `potentials_custom_fld` on `potentials_custom_fld`.`idpotentials` = `potentials`.`idpotentials`";
						query+= " left join `user` on `user`.`iduser` = `potentials`.`iduser`";
						query+= " left join `pot_to_grp_rel` on `pot_to_grp_rel`.`idpotentials` = `potentials`.`idpotentials`";
						query+= " left join `group` on `group`.`idgroup` = `pot_to_grp_rel`.`idgroup`";
						query+= " left join `potentials_related_to` on `potentials_related_to`.`idpotentials` = `potentials`.`idpotentials`";
						query+= " left join `contacts` as sqcnt on sqcnt.idcontacts = `potentials_related_to`.`related_to` and `potentials_related_to`.`idmodule` = 4";
						query+= " left join organization as sqorg on sqorg.idorganization = `potentials_related_to`.`related_to` and `potentials_related_to`.`idmodule` = 6";
						query+= " where `potentials`.`deleted` = 0";
						query+= whereClause;
						query+= " order by `potentials`.`idpotentials`";
						query+= " limit "+page+" , "+limit;
					
					app.models.prospects
					.query(query, function(err, prospects) {
						if (err) return autoCallback(err);
						return autoCallback(null, prospects);
					});
				}]
			},
			function(err, results) {
				if (err) return next(err);
				var prospects = _.map(results.getRecords, function(prospectsData) {
					// add the related module name in the response data 
					if (prospectsData.potentials_related_to_idmodule === 4) {
						prospectsData.related_module = 'Contacts';
					} else if (prospectsData.potentials_related_to_idmodule === 6) {
						prospectsData.related_module = 'Organization';
					} else {
						prospectsData.related_module = null;
					}
					return prospectsData;
				});
				
				var prospectCount = (_.isArray(results.recordCount)) ? results.recordCount[0].tot : results.recordCount.tot;
				var pagingLinks = pagination.pagingLinks(req, prospectCount, apiEndpoint);
				
				res.locals.JSONAPIOptions = {
					resourceType: resourceType,
					topLevelLinks: pagingLinks,
					attributes:modulesConfig.moduleAttributes.Potentials.default,
					dataLinks: {
						self: function (prospects,prospect) {
							return apiEndpoint + prospect.id;
						}
					}
				};
				res.locals.meta = {totalRecords: prospectCount};
				res.body = prospects;
				return next(); 
			});
		}	
	};
};
