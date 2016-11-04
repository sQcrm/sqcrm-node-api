var _ = require('lodash'),
	crmPrivileges = require('../utils/crm_privileges'),
	modulesConfig = require('../config/modules_config'),
	async = require('async'),
	pagination = require('../utils/pagination');
/**
 * @swagger
 * resourcePath: /contacts
 * description: sQcrm contacts 
 */
module.exports = function(app, config) {
	var apiNamespace = config.apiNamespace,
		resourceType = 'contacts';
	
	// Public Methods
	return {
		/**
		* @swagger
		* path: /api/v1/contacts
		* operations:
		*   -  httpMethod: GET
		*      summary: Get all the contacts
		*      notes: Return all the contacts associated with the token
		*      responseClass: contacts
		*      nickname: contacts
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

			crmPrivileges.userWhereCondition(req, 4, 'contacts', 'cnt_to_grp_rel', true, function(err, whereCond) {
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
					var query = " select count(*) as tot from `contacts`";
						query+= " inner join `contacts_address` on `contacts_address`.`idcontacts` = `contacts`.`idcontacts`";
						query+= " inner join `contacts_custom_fld` on `contacts_custom_fld`.`idcontacts` = `contacts`.`idcontacts`";
						query+= " left join `user` on `user`.`iduser` = `contacts`.`iduser`";
						query+= " left join `cnt_to_grp_rel` on `cnt_to_grp_rel`.`idcontacts` = `contacts`.`idcontacts`";
						query+= " left join `group` on `group`.`idgroup` = `cnt_to_grp_rel`.`idgroup`";
						query+= " where `contacts`.`deleted` = 0";
						query+= whereClause;
					
					app.models.contacts
					.query(query, function(err, contactCount) {
						if (err) return autoCallback(err);
						return autoCallback(null, contactCount);
					});
				},
			  
				// get the records
				getRecords: ['recordCount', function(result, autoCallback) {
					// if record count is 0 then no need to execute the query to get the data
					var contactCount = (_.isArray(result.recordCount)) ? result.recordCount[0].tot : result.recordCount.tot;
					if (contactCount === 0) return autoCallback();

					var query = " select `contacts`.`idcontacts` as `id`,`contacts`.*,";
						query+= " `contacts_address`.*,";
						query+= " `contacts_custom_fld`.*,";
						query+= " `cnt_to_grp_rel`.`idgroup`,";
						query+= " `organization`.`organization_name` as `contact_orgranization`,";
						query+= " concat(`cnt2`.firstname,' ',`cnt2`.lastname) as `contact_report_to`,";
						query+= " case when (`user`.`user_name` not like '')";
						query+= " then";
						query+= " `user`.`user_name`";
						query+= " else";
						query+= " `group`.`group_name` end";
						query+= " as `assigned_to`";
						query+= " from `contacts`";
						query+= " inner join `contacts_address` on `contacts_address`.`idcontacts` = `contacts`.`idcontacts`";
						query+= " inner join `contacts_custom_fld` on `contacts_custom_fld`.`idcontacts` = `contacts`.`idcontacts`";
						query+= " left join `user` on `user`.`iduser` = `contacts`.`iduser`";
						query+= " left join `cnt_to_grp_rel` on `cnt_to_grp_rel`.`idcontacts` = `contacts`.`idcontacts`";
						query+= " left join `group` on `group`.`idgroup` = `cnt_to_grp_rel`.`idgroup`";
						query+= " left join `organization` on `organization`.`idorganization` = `contacts`.`idorganization`";
						query+= " left join contacts as `cnt2` on `contacts`.`reports_to` = `cnt2`.`idcontacts` AND `contacts`.`reports_to` <> 0";
						query+= " where `contacts`.`deleted` = 0";
						query+= whereClause;
						query+= " order by `contacts`.`idcontacts`";
						query+= " limit "+page+" , "+limit;
				
					app.models.contacts
					.query(query, function(err, cont) {
						if (err) return autoCallback(err);
						return autoCallback(null, cont);
					});
				}]
			},
			function(err, results) {
				if (err) return next(err);
				var contacts = _.map(results.getRecords, function(contactData) {
					// add the address info in the response data 
					var addressInfo = {};
					modulesConfig.moduleAttributes.Contacts.address.forEach( function(attr) {
						addressInfo[attr]= contactData[attr];
					}); 
					contactData.address = addressInfo;
					return contactData;
				});
				
				var contactCount = (_.isArray(results.recordCount)) ? results.recordCount[0].tot : results.recordCount.tot;
				var pagingLinks = pagination.pagingLinks(req, contactCount, apiEndpoint);
				
				res.locals.JSONAPIOptions = {
					resourceType: resourceType,
					topLevelLinks: pagingLinks,
					attributes:modulesConfig.moduleAttributes.Contacts.default,
					dataLinks: {
						self: function (contacts,cont) {
							return apiEndpoint + cont.id;
						}
					}
				};
				res.locals.meta = {totalRecords: contactCount};
				res.body = contacts;
				return next(); 
			});
		}	
	};
};
