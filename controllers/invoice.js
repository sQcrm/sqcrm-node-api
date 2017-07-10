var _ = require('lodash'),
	crmPrivileges = require('../utils/crm_privileges'),
	modulesConfig = require('../config/modules_config'),
	async = require('async'),
	pagination = require('../utils/pagination'),
	common = require('../utils/common');
/**
 * @swagger
 * resourcePath: /invoices
 * description: sQcrm Invoice 
 */
module.exports = function(app, config) {
	var apiNamespace = config.apiNamespace,
		resourceType = 'invoices';
	
	// Public Methods
	return {
		/**
		* @swagger
		* path: /api/v1/invoices
		* operations:
		*   -  httpMethod: GET
		*      summary: Get all the invoices
		*      notes: Return all the invoices associated with the token
		*      responseClass: invoices
		*      nickname: invoices
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

			crmPrivileges.userWhereCondition(req, 15, 'invoice', 'invoice_to_grp_rel', true, function(err, whereCond) {
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
					var query = " select count(*) as tot from `invoice`";
						query+= " inner join `invoice_address` on `invoice_address`.`idinvoice` = `invoice`.`idinvoice`";
						query+= " inner join `invoice_custom_fld` on `invoice_custom_fld`.`idinvoice` = `invoice`.`idinvoice`";
						query+= " left join `user` on `user`.`iduser` = `invoice`.`iduser`";
						query+= " left join `invoice_to_grp_rel` on `invoice_to_grp_rel`.`idinvoice` = `invoice`.`idinvoice`";
						query+= " left join `group` on `group`.`idgroup` = `invoice_to_grp_rel`.`idgroup`";
						query+= " where `invoice`.`deleted` = 0";
						query+= whereClause;
					
					app.models.invoice
					.query(query, function(err, invCount) {
						if (err) return autoCallback(err);
						
						return autoCallback(null, invCount);
					});
				},
				// get the Invoice prifix
				getInvoicePrifix: ['recordCount', function(result, autoCallback) {
					var invCount = (_.isArray(result.recordCount)) ? result.recordCount[0].tot : result.recordCount.tot;
					if (invCount === 0) return autoCallback();
					
					app.models.global_settings
					.findOne({settingName:'invoice_num_prefix'})
					.exec(function(err,globalSetting) {
						if (err) return autoCallback(err);
						  
						return autoCallback(null,globalSetting);
					});
				}],
				// get the records
				getRecords: ['recordCount', function(result, autoCallback) {
					// if record count is 0 then no need to execute the query to get the data
					var invCount = (_.isArray(result.recordCount)) ? result.recordCount[0].tot : result.recordCount.tot;
					if (invCount === 0) return autoCallback();

					var query = " select `invoice`.`idinvoice` as `id`,`invoice`.*,";
						query+= " `invoice_custom_fld`.*,";
						query+= " `invoice_address`.*,";
						query+= " `organization`.`organization_name`,";
						query+= " concat(`contacts`.`firstname`,' ',`contacts`.`lastname`) as `contact_name`,";
						query+= " `potentials`.`potential_name`,";
						query+= " `sales_order`.`subject` as `salesorder_subject`,";
						query+= " `invoice_to_grp_rel`.`idgroup`,";
						query+= " case when (`user`.`user_name` not like '')";
						query+= " then";
						query+= " `user`.`user_name`";
						query+= " else";
						query+= " `group`.`group_name` end";
						query+= " as `assigned_to`";
						query+= " from `invoice`";
						query+= " inner join `invoice_address` on `invoice_address`.`idinvoice` = `invoice`.`idinvoice`";
						query+= " inner join `invoice_custom_fld` on `invoice_custom_fld`.`idinvoice` = `invoice`.`idinvoice`";
						query+= " left join `user` on `user`.`iduser` = `invoice`.`iduser`";
						query+= " left join `invoice_to_grp_rel` on `invoice_to_grp_rel`.`idinvoice` = `invoice`.`idinvoice`";
						query+= " left join `organization` on `organization`.`idorganization` = `invoice`.`idorganization`";
						query+= " left join `group` on `group`.`idgroup` = `invoice_to_grp_rel`.`idgroup`";
						query+= " left join `potentials` on `potentials`.`idpotentials` = `invoice`.`idpotentials`";
						query+= " left join `sales_order` on `sales_order`.`idsales_order` = `invoice`.`idsales_order`";
						query+= " left join `contacts` on `contacts`.`idcontacts` = `invoice`.`idcontacts`";
						query+= " where `invoice`.`deleted` = 0";
						query+= whereClause;
						query+= " order by `invoice`.`idinvoice`";
						query+= " limit "+startIndex+" , "+limit;
					
					app.models.invoice
					.query(query, function(err, invoice) {
						if (err) return autoCallback(err);
						   
						return autoCallback(null, invoice);
					});
				}]
			},
			function(err, results) {
				if (err) return next(err);
				var invoices = {},
					invoicePrefix = results.getInvoicePrifix;
				
				async.forEachOf(results.getRecords, function(invoice, key, eachCallBack) {
					var addressInfo = {};
					
					async.auto({
						// set the address
						setAddress: function(modifiedCallBack) {
							modulesConfig.moduleAttributes.Invoice.address.forEach( function(attr) {
								addressInfo[attr]= invoice[attr];
							});
							invoice.address = addressInfo;
							return modifiedCallBack();
						},
						// set the tax and invoice number
						setTaxAndInvNumValues: function(modifiedCallBack) {
							_.map(invoice, function(v, k) {
								// making sure that the tax_values and shipping_handling_tax_values are parsed into proper format
								if (k === 'tax_values' || k === 'shipping_handling_tax_values') {
									v = common.parseTaxData(v);
									invoice[k] = v;
								}
								// prefixing the invoice number with the invoice prefix from setting
								if (invoicePrefix && invoicePrefix.settingData && k === 'invoice_number') {
									v= invoicePrefix.settingData+''+v;
									invoice[k] = v;
								}
							});
							return modifiedCallBack();
						},
						// set the line items which is one-to-many relation with invoice
						setLineItems: function(modifiedCallBack) {
							app.models.lineitems 
							.find({recordid:invoice.id,moduleId:15})
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
								invoice.line_items = lineitem;
								invoices[key] = invoice;
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
					invoices = _.map(invoices, function(invData) {
						return invData;
					});
					var invCount = (_.isArray(results.recordCount)) ? results.recordCount[0].tot : results.recordCount.tot;
					var pagingLinks = pagination.pagingLinks(req, invCount, apiEndpoint);
					
					res.locals.JSONAPIOptions = {
						resourceType: resourceType,
						topLevelLinks: pagingLinks,
						attributes:modulesConfig.moduleAttributes.Invoice.default,
						dataLinks: {
							self: function (invoices,inv) {
								return apiEndpoint + inv.id;
							}
						}
					};
					res.locals.meta = {totalRecords: invCount};
					res.body = invoices;
					return next(); 
				});
			});
		}	
	};
};
