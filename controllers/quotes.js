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
		resourceType = 'quotes';
	
	// Public Methods
	return {
		/**
		* @swagger
		* path: /api/v1/quotes
		* operations:
		*   -  httpMethod: GET
		*      summary: Get all the quotes
		*      notes: Return all the quotes associated with the token
		*      responseClass: quotes
		*      nickname: quotes
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

			crmPrivileges.userWhereCondition(req, 13, 'quotes', 'quotes_to_grp_rel', true, function(err, whereCond) {
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
					var query = " select count(*) as tot from `quotes`";
						query+= " inner join `quotes_address` on `quotes_address`.`idquotes` = `quotes`.`idquotes`";
						query+= " inner join `quotes_custom_fld` on `quotes_custom_fld`.`idquotes` = `quotes`.`idquotes`";
						query+= " left join `user` on `user`.`iduser` = `quotes`.`iduser`";
						query+= " left join `quotes_to_grp_rel` on `quotes_to_grp_rel`.`idquotes` = `quotes`.`idquotes`";
						query+= " left join `group` on `group`.`idgroup` = `quotes_to_grp_rel`.`idgroup`";
						query+= " where `quotes`.`deleted` = 0";
						query+= whereClause;
					
					app.models.quotes
					.query(query, function(err, quotesCount) {
						if (err) return autoCallback(err);
						
						return autoCallback(null, quotesCount);
					});
				},
				// get the quote prifix
				getQuotePrifix: ['recordCount', function(result, autoCallback) {
					var quotesCount = (_.isArray(result.recordCount)) ? result.recordCount[0].tot : result.recordCount.tot;
					if (quotesCount === 0) return autoCallback();
					
					app.models.global_settings
					.findOne({settingName:'quote_num_prefix'})
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

					var query = " select `quotes`.`idquotes` as `id`,`quotes`.*,";
						query+= " `quotes_custom_fld`.*,";
						query+= " `quotes_address`.*,";
						query+= " `organization`.`organization_name` as `organization_name`,";
						query+= " `potentials`.`potential_name`,";
						query+= " `quotes_to_grp_rel`.`idgroup`,";
						query+= " case when (`user`.`user_name` not like '')";
						query+= " then";
						query+= " `user`.`user_name`";
						query+= " else";
						query+= " `group`.`group_name` end";
						query+= " as `assigned_to`";
						query+= " from `quotes`";
						query+= " inner join `quotes_address` on `quotes_address`.`idquotes` = `quotes`.`idquotes`";
						query+= " inner join `quotes_custom_fld` on `quotes_custom_fld`.`idquotes` = `quotes`.`idquotes`";
						query+= " left join `user` on `user`.`iduser` = `quotes`.`iduser`";
						query+= " left join `quotes_to_grp_rel` on `quotes_to_grp_rel`.`idquotes` = `quotes`.`idquotes`";
						query+= " left join `organization` on `organization`.`idorganization` = `quotes`.`idorganization`";
						query+= " left join `group` on `group`.`idgroup` = `quotes_to_grp_rel`.`idgroup`";
						query+= " left join `potentials` on `potentials`.`idpotentials` = `quotes`.`idpotentials`";
						query+= " where `quotes`.`deleted` = 0";
						query+= whereClause;
						query+= " order by `quotes`.`idquotes`";
						query+= " limit "+startIndex+" , "+limit;
					
					app.models.quotes
					.query(query, function(err, quotes) {
						if (err) return autoCallback(err);
						   
						return autoCallback(null, quotes);
					});
				}]
			},
			function(err, results) {
				if (err) return next(err);
				var quotes = {},
					quotePrefix = results.getQuotePrifix;
				
				async.forEachOf(results.getRecords, function(quote, key, eachCallBack) {
					var addressInfo = {};
					
					async.auto({
						// set the quote address
						setAddress: function(modifiedCallBack) {
							modulesConfig.moduleAttributes.Quotes.address.forEach( function(attr) {
								addressInfo[attr]= quote[attr];
							});
							quote.address = addressInfo;
							return modifiedCallBack();
						},
						// set the tax and quote number
						setTaxAndQuoteNumValues: function(modifiedCallBack) {
							_.map(quote, function(v, k) {
								// making sure that the tax_values and shipping_handling_tax_values are parsed into proper format
								if (k === 'tax_values' || k === 'shipping_handling_tax_values') {
									v = common.parseTaxData(v);
									quote[k] = v;
								}
								// prefixing the quote number with the quote prefix from setting
								if (quotePrefix && quotePrefix.settingData && k === 'quote_number') {
									v= quotePrefix.settingData+''+v;
									quote[k] = v;
								}
							});
							return modifiedCallBack();
						},
						// set the line items which is one-to-many relation with quote
						setLineItems: function(modifiedCallBack) {
							app.models.lineitems 
							.find({recordid:quote.id,moduleId:13})
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
								quote.line_items = lineitem;
								quotes[key] = quote;
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
					quotes = _.map(quotes, function(quotesData) {
						return quotesData;
					});
					var quotesCount = (_.isArray(results.recordCount)) ? results.recordCount[0].tot : results.recordCount.tot;
					var pagingLinks = pagination.pagingLinks(req, quotesCount, apiEndpoint);
					
					res.locals.JSONAPIOptions = {
						resourceType: resourceType,
						topLevelLinks: pagingLinks,
						attributes:modulesConfig.moduleAttributes.Quotes.default,
						dataLinks: {
							self: function (quotes,quote) {
								return apiEndpoint + quote.id;
							}
						}
					};
					res.locals.meta = {totalRecords: quotesCount};
					res.body = quotes;
					return next(); 
				});
			});
		}	
	};
};
