var _ = require('lodash'),
	crmPrivileges = require('../utils/crm_privileges'),
	modulesConfig = require('../config/modules_config'),
	async = require('async'),
	pagination = require('../utils/pagination'),
	common = require('../utils/common');
/**
 * @swagger
 * resourcePath: /quotes
 * description: sQcrm Quotes 
 */
module.exports = function(app, config) {
	var apiNamespace = config.apiNamespace,
		resourceType = 'purchaseorders';
	
	// Public Methods
	return {
		/**
		* @swagger
		* path: /api/v1/purchaseorders
		* operations:
		*   -  httpMethod: GET
		*      summary: Get all the purchaseorders
		*      notes: Return all the purchaseorders associated with the token
		*      responseClass: purchaseorder
		*      nickname: purchaseorder
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

			crmPrivileges.userWhereCondition(req, 16, 'PurchaseOrder', 'purchase_order_custom_fld', true, function(err, whereCond) {
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
					var query = " select count(*) as tot from `purchase_order`";
						query+= " inner join `purchase_order_address` on `purchase_order_address`.`idpurchase_order` = `purchase_order`.`idpurchase_order`";
						query+= " inner join `purchase_order_custom_fld` on `purchase_order_custom_fld`.`idpurchase_order` = `purchase_order`.`idpurchase_order`";
						query+= " left join `user` on `user`.`iduser` = `purchase_order`.`iduser`";
						query+= " left join `purchase_order_to_grp_rel` on `purchase_order_to_grp_rel`.`idpurchase_order` = `purchase_order`.`idpurchase_order`";
						query+= " left join `group` on `group`.`idgroup` = `purchase_order_to_grp_rel`.`idgroup`";
						query+= " where `purchase_order`.`deleted` = 0";
						query+= whereClause;
					
					app.models.purchaseorder
					.query(query, function(err, quotesCount) {
						if (err) return autoCallback(err);
						
						return autoCallback(null, quotesCount);
					});
				},
				// get the purchase order prifix
				getPurchaseOrderPrifix: ['recordCount', function(result, autoCallback) {
					var purchaseorderCount = (_.isArray(result.recordCount)) ? result.recordCount[0].tot : result.recordCount.tot;
					if (purchaseorderCount === 0) return autoCallback();
					
					app.models.global_settings
					.findOne({settingName:'purchaseorder_num_prefix'})
					.exec(function(err,globalSetting) {
						if (err) return autoCallback(err);
						  
						return autoCallback(null,globalSetting);
					});
				}],
				// get the records
				getRecords: ['recordCount', function(result, autoCallback) {
					// if record count is 0 then no need to execute the query to get the data
					var purchaseorderCount = (_.isArray(result.recordCount)) ? result.recordCount[0].tot : result.recordCount.tot;
					if (purchaseorderCount === 0) return autoCallback();

					var query = " select `purchase_order`.`idpurchase_order` as `id`,`purchase_order`.*,";
						query+= " `purchase_order_custom_fld`.*,";
						query+= " `purchase_order_address`.*,";
						query+= " `vendor`.`vendor_name`,";
						query+= " concat(`contacts`.`firstname`,' ',`contacts`.`lastname`) as `contact_name`,";
						query+= " `purchase_order_to_grp_rel`.`idgroup`,";
						query+= " case when (`user`.`user_name` not like '')";
						query+= " then";
						query+= " `user`.`user_name`";
						query+= " else";
						query+= " `group`.`group_name` end";
						query+= " as `assigned_to`";
						query+= " from `purchase_order`";
						query+= " inner join `purchase_order_address` on `purchase_order_address`.`idpurchase_order` = `purchase_order`.`idpurchase_order`";
						query+= " inner join `purchase_order_custom_fld` on `purchase_order_custom_fld`.`idpurchase_order` = `purchase_order`.`idpurchase_order`";
						query+= " left join `user` on `user`.`iduser` = `purchase_order`.`iduser`";
						query+= " left join `purchase_order_to_grp_rel` on `purchase_order_to_grp_rel`.`idpurchase_order` = `purchase_order`.`idpurchase_order`";
						query+= " left join `vendor` on `vendor`.`idvendor` = `purchase_order`.`idvendor`";
						query+= " left join `group` on `group`.`idgroup` = `purchase_order_to_grp_rel`.`idgroup`";
						query+= " left join `contacts` on `contacts`.`idcontacts` = `purchase_order`.`idcontacts`";
						query+= " where `purchase_order`.`deleted` = 0";
						query+= whereClause;
						query+= " order by `purchase_order`.`idpurchase_order`";
						query+= " limit "+page+" , "+limit;
					
					app.models.purchaseorder
					.query(query, function(err, purchaseorder) {
						if (err) return autoCallback(err);
						   
						return autoCallback(null, purchaseorder);
					});
				}]
			},
			function(err, results) {
				if (err) return next(err);
				var purchaseorders = {},
					purchseorderPrefix = results.getPurchaseOrderPrifix;
				
				async.forEachOf(results.getRecords, function(purchaseorder, key, eachCallBack) {
					var addressInfo = {};
					
					async.auto({
						// set the quote address
						setAddress: function(modifiedCallBack) {
							modulesConfig.moduleAttributes.PurchaseOrder.address.forEach( function(attr) {
								addressInfo[attr]= purchaseorder[attr];
							});
							purchaseorder.address = addressInfo;
							return modifiedCallBack();
						},
						// set the tax and quote number
						setTaxAndPurchaseOrderNumValues: function(modifiedCallBack) {
							_.map(purchaseorder, function(v, k) {
								// making sure that the tax_values and shipping_handling_tax_values are parsed into proper format
								if (k === 'tax_values' || k === 'shipping_handling_tax_values') {
									v = common.parseTaxData(v);
									purchaseorder[k] = v;
								}
								// prefixing the quote number with the quote prefix from setting
								if (purchaseorderPrefix && purchaseorderPrefix.settingData && k === 'po_number') {
									v= purchaseorderPrefix.settingData+''+v;
									purchaseorder[k] = v;
								}
							});
							return modifiedCallBack();
						},
						// set the line items which is one-to-many relation with quote
						setLineItems: function(modifiedCallBack) {
							app.models.lineitems 
							.find({recordid:purchase_order.id,moduleId:16})
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
								purchaseorder.line_items = lineitem;
								purchaseorders[key] = purchaseorder;
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
					purchaseorders = _.map(purchaseorders, function(purchaseorderData) {
						return purchaseorderData;
					});
					var purchaseorderCount = (_.isArray(results.recordCount)) ? results.recordCount[0].tot : results.recordCount.tot;
					var pagingLinks = pagination.pagingLinks(req, purchaseorderCount, apiEndpoint);
					
					res.locals.JSONAPIOptions = {
						resourceType: resourceType,
						topLevelLinks: pagingLinks,
						attributes:modulesConfig.moduleAttributes.PurchaseOrder.default,
						dataLinks: {
							self: function (purchaseorders,purchaseorder) {
								return apiEndpoint + purchase_order.id;
							}
						}
					};
					res.locals.meta = {totalRecords: purchaseorderCount};
					res.body = purchaseorders;
					return next(); 
				});
			});
		}	
	};
};
