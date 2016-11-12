var _ = require('lodash'),
	crmPrivileges = require('../utils/crm_privileges'),
	modulesConfig = require('../config/modules_config'),
	async = require('async'),
	pagination = require('../utils/pagination'),
	common = require('../utils/common');
/**
 * @swagger
 * resourcePath: /salesorders
 * description: sQcrm SalesOrder 
 */
module.exports = function(app, config) {
	var apiNamespace = config.apiNamespace,
		resourceType = 'salesorders';
	
	// Public Methods
	return {
		/**
		* @swagger
		* path: /api/v1/salesorders
		* operations:
		*   -  httpMethod: GET
		*      summary: Get all the salesorders
		*      notes: Return all the salesorders associated with the token
		*      responseClass: salesorders
		*      nickname: salesorders
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

			crmPrivileges.userWhereCondition(req, 14, 'sales_order', 'sales_order_to_grp_rel', true, function(err, whereCond) {
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
					var query = " select count(*) as tot from `sales_order`";
						query+= " inner join `sales_order_address` on `sales_order_address`.`idsales_order` = `sales_order`.`idsales_order`";
						query+= " inner join `sales_order_custom_fld` on `sales_order_custom_fld`.`idsales_order` = `sales_order`.`idsales_order`";
						query+= " left join `user` on `user`.`iduser` = `sales_order`.`iduser`";
						query+= " left join `sales_order_to_grp_rel` on `sales_order_to_grp_rel`.`idsales_order` = `sales_order`.`idsales_order`";
						query+= " left join `group` on `group`.`idgroup` = `sales_order_to_grp_rel`.`idgroup`";
						query+= " where `sales_order`.`deleted` = 0";
						query+= whereClause;
					
					app.models.salesorder
					.query(query, function(err, soCount) {
						if (err) return autoCallback(err);
						
						return autoCallback(null, soCount);
					});
				},
				// get the quote prifix
				getSOPrifix: ['recordCount', function(result, autoCallback) {
					var soCount = (_.isArray(result.recordCount)) ? result.recordCount[0].tot : result.recordCount.tot;
					if (soCount === 0) return autoCallback();
					
					app.models.global_settings
					.findOne({settingName:'salesorder_num_prefix'})
					.exec(function(err,globalSetting) {
						if (err) return autoCallback(err);
						  
						return autoCallback(null,globalSetting);
					});
				}],
				// get the records
				getRecords: ['recordCount', function(result, autoCallback) {
					// if record count is 0 then no need to execute the query to get the data
					var quotesCount = (_.isArray(result.recordCount)) ? result.recordCount[0].tot : result.recordCount.tot;
					if (quotesCount === 0) return autoCallback();

					var query = " select `sales_order`.`idsales_order` as `id`,`sales_order`.*,";
						query+= " `sales_order_custom_fld`.*,";
						query+= " `sales_order_address`.*,";
						query+= " `organization`.`organization_name`,";
						query+= " concat(`contacts`.`firstname`,' ',`contacts`.`lastname`) as `contact_name`,";
						query+= " `potentials`.`potential_name`,";
						query+= " `quotes`.`subject` as `quote_subject`,";
						query+= " `sales_order_to_grp_rel`.`idgroup`,";
						query+= " case when (`user`.`user_name` not like '')";
						query+= " then";
						query+= " `user`.`user_name`";
						query+= " else";
						query+= " `group`.`group_name` end";
						query+= " as `assigned_to`";
						query+= " from `sales_order`";
						query+= " inner join `sales_order_address` on `sales_order_address`.`idsales_order` = `sales_order`.`idsales_order`";
						query+= " inner join `sales_order_custom_fld` on `sales_order_custom_fld`.`idsales_order` = `sales_order`.`idsales_order`";
						query+= " left join `user` on `user`.`iduser` = `sales_order`.`iduser`";
						query+= " left join `sales_order_to_grp_rel` on `sales_order_to_grp_rel`.`idsales_order` = `sales_order`.`idsales_order`";
						query+= " left join `organization` on `organization`.`idorganization` = `sales_order`.`idorganization`";
						query+= " left join `group` on `group`.`idgroup` = `sales_order_to_grp_rel`.`idgroup`";
						query+= " left join `potentials` on `potentials`.`idpotentials` = `sales_order`.`idpotentials`";
						query+= " left join `quotes` on `quotes`.`idquotes` = `sales_order`.`idquotes`";
						query+= " left join `contacts` on `contacts`.`idcontacts` = `sales_order`.`idcontacts`";
						query+= " where `sales_order`.`deleted` = 0";
						query+= whereClause;
						query+= " order by `sales_order`.`idsales_order`";
						query+= " limit "+page+" , "+limit;
					console.log(query);
					app.models.salesorder
					.query(query, function(err, salesorder) {
						if (err) return autoCallback(err);
						   
						return autoCallback(null, salesorder);
					});
				}]
			},
			function(err, results) {
				if (err) return next(err);
				var salesOrders = {},
					soPrefix = results.getSOPrifix;
				
				async.forEachOf(results.getRecords, function(salesOrder, key, eachCallBack) {
					var addressInfo = {};
					
					async.auto({
						// set the address
						setAddress: function(modifiedCallBack) {
							modulesConfig.moduleAttributes.SalesOrder.address.forEach( function(attr) {
								addressInfo[attr]= salesOrder[attr];
							});
							salesOrder.address = addressInfo;
							return modifiedCallBack();
						},
						// set the tax and invoice number
						setTaxAndInvNumValues: function(modifiedCallBack) {
							_.map(salesOrder, function(v, k) {
								// making sure that the tax_values and shipping_handling_tax_values are parsed into proper format
								if (k === 'tax_values' || k === 'shipping_handling_tax_values') {
									v = common.parseTaxData(v);
									salesOrder[k] = v;
								}
								// prefixing the SO number with the SO prefix from setting
								if (soPrefix && soPrefix.settingData && k === 'sales_order_number') {
									v= soPrefix.settingData+''+v;
									salesOrder[k] = v;
								}
							});
							return modifiedCallBack();
						},
						// set the line items which is one-to-many relation with quote
						setLineItems: function(modifiedCallBack) {
							app.models.lineitems 
							.find({recordid:salesOrder.id,moduleId:14})
							.exec(function(err,lineitem) {
								if (err) return modifiedCallBack(err);
								if (lineitem) {
									lineitem = _.map(lineitem, function(value,key) {
										_.map(value, function(v,k) {
											// making sure that the taxValues are parsed in to proper format
											if (k === 'taxValues') {
												v = common.parseTaxData(v);
												value[k] = v;
											}
										});
										return value;
									});
								}
								salesOrder.line_items = lineitem;
								salesOrders[key] = salesOrder;
								return modifiedCallBack();
							});
						}
					},
					function(err) {
						if (err) return eachCallBack(err);
						
						return eachCallBack();
					});
				}, function(err) {
					if (err) return next(err);
					salesOrders = _.map(salesOrders, function(soData) {
						return soData;
					});
					var soCount = (_.isArray(results.recordCount)) ? results.recordCount[0].tot : results.recordCount.tot;
					var pagingLinks = pagination.pagingLinks(req, soCount, apiEndpoint);
					
					res.locals.JSONAPIOptions = {
						resourceType: resourceType,
						topLevelLinks: pagingLinks,
						attributes:modulesConfig.moduleAttributes.Quotes.default,
						dataLinks: {
							self: function (salesOrders,so) {
								return apiEndpoint + so.id;
							}
						}
					};
					res.locals.meta = {totalRecords: soCount};
					res.body = salesOrders;
					return next(); 
				});
			});
		}	
	};
};
