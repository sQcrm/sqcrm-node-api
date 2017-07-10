var _ = require('lodash'),
	crmPrivileges = require('../utils/crm_privileges'),
	modulesConfig = require('../config/modules_config'),
	async = require('async'),
	pagination = require('../utils/pagination');
/**
 * @swagger
 * resourcePath: /vendors
 * description: sQcrm Vendors 
 */
module.exports = function(app, config) {
	var apiNamespace = config.apiNamespace,
		resourceType = 'vendors';
	
	// Public Methods
	return {
		/**
		* @swagger
		* path: /api/v1/vendors
		* operations:
		*   -  httpMethod: GET
		*      summary: Get all the vendors
		*      notes: Return all the vendors associated with the token
		*      responseClass: vendors
		*      nickname: vendors
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
				startIndex,
				limit;

			crmPrivileges.userWhereCondition(req, 11, 'vendor', 'vendor_to_grp_rel', true, function(err, whereCond) {
				if (err) return next(err);
				whereClause = whereCond;
			});
			
			pagination.parsePagingRequest(req, function(err, pagingReq) {
				if (err) return next(err);
				
				limit = pagingReq.limit;
				startIndex = pagingReq.start;
			});
			
			
			async.auto({
				// get the record count
				recordCount: function(autoCallback) {
					var query = " select count(*) as tot from `vendor`";
						query+= " inner join `vendor_address` on `vendor_address`.`idvendor` = `vendor`.`idvendor`";
						query+= " inner join `vendor_custom_fld` on `vendor_custom_fld`.`idvendor` = `vendor`.`idvendor`";
						query+= " left join `user` on `user`.`iduser` = `vendor`.`iduser`";
						query+= " left join `vendor_to_grp_rel` on `vendor_to_grp_rel`.`idvendor` = `vendor`.`idvendor`";
						query+= " left join `group` on `group`.`idgroup` = `vendor_to_grp_rel`.`idgroup`";
						query+= " where `vendor`.`deleted` = 0";
						query+= whereClause;
					
					app.models.vendor
					.query(query, function(err, vendorCount) {
						if (err) return autoCallback(err);
						return autoCallback(null, vendorCount);
					});
				},
			  
				// get the records
				getRecords: ['recordCount', function(result, autoCallback) {
					// if record count is 0 then no need to execute the query to get the data
					var vendorCount = (_.isArray(result.recordCount)) ? result.recordCount[0].tot : result.recordCount.tot;
					if (vendorCount === 0) return autoCallback();

					var query = " select `vendor`.`idvendor` as `id`, `vendor`.*,";
						query+= " `vendor_address`.*,";
						query+= " `vendor_custom_fld`.*,";
						query+= " `vendor_to_grp_rel`.`idgroup`,";
						query+= " case when (`user`.`user_name` not like '')";
						query+= " then";
						query+= " `user`.`user_name`";
						query+= " else";
						query+= " `group`.`group_name` end";
						query+= " as `assigned_to`";
						query+= " from `vendor`";
						query+= " inner join `vendor_address` on `vendor_address`.`idvendor` = `vendor`.`idvendor`";
						query+= " inner join `vendor_custom_fld` on `vendor_custom_fld`.`idvendor` = `vendor`.`idvendor`";
						query+= " left join `user` on `user`.`iduser` = `vendor`.`iduser`";
						query+= " left join `vendor_to_grp_rel` on `vendor_to_grp_rel`.`idvendor` = `vendor`.`idvendor`";
						query+= " left join `group` on `group`.`idgroup` = `vendor_to_grp_rel`.`idgroup`";
						query+= " where `vendor`.`deleted` = 0";
						query+= whereClause;
						query+= " order by `vendor`.`idvendor`";
						query+= " limit "+startIndex+" , "+limit;
					
					app.models.vendor
					.query(query, function(err, vendors) {
						if (err) return autoCallback(err);
						return autoCallback(null, vendors);
					});
				}]
			},
			function(err, results) {
				if (err) return next(err);
				var vendors = _.map(results.getRecords, function(vendorData) {
					// add the address info in the response data 
					var addressInfo = {};
					modulesConfig.moduleAttributes.Vendor.address.forEach( function(attr) {
						addressInfo[attr]= vendorData[attr];
					}); 
					vendorData.address = addressInfo;
					return vendorData;
				});
				
				var vendorCount = (_.isArray(results.recordCount)) ? results.recordCount[0].tot : results.recordCount.tot;
				var pagingLinks = pagination.pagingLinks(req, vendorCount, apiEndpoint);
				
				res.locals.JSONAPIOptions = {
					resourceType: resourceType,
					topLevelLinks: pagingLinks,
					attributes:modulesConfig.moduleAttributes.Vendor.default,
					dataLinks: {
						self: function (vendors,vendor) {
							return apiEndpoint + vendor.id;
						}
					}
				};
				res.locals.meta = {totalRecords: vendorCount};
				res.body = vendors;
				return next(); 
			});
		}	
	};
};
