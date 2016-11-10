var _ = require('lodash'),
	crmPrivileges = require('../utils/crm_privileges'),
	modulesConfig = require('../config/modules_config'),
	async = require('async'),
	pagination = require('../utils/pagination');
/**
 * @swagger
 * resourcePath: /products
 * description: sQcrm products 
 */
module.exports = function(app, config) {
	var apiNamespace = config.apiNamespace,
		resourceType = 'products';
	
	// Public Methods
	return {
		/**
		* @swagger
		* path: /api/v1/products
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

			crmPrivileges.userWhereCondition(req, 12, 'products', 'products_to_grp_rel', true, function(err, whereCond) {
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
					var query = " select count(*) as tot from `products`";
						query+= " inner join `products_pricing` on `products_pricing`.`idproducts` = `products`.`idproducts`";
						query+= " inner join `products_custom_fld` on `products_custom_fld`.`idproducts` = `products`.`idproducts`";
						query+= " inner join `products_stock` on `products_stock`.`idproducts` = `products`.`idproducts`";
						query+= " left join `user` on `user`.`iduser` = `products`.`iduser`";
						query+= " left join `products_to_grp_rel` on `products_to_grp_rel`.`idproducts` = `products`.`idproducts`";
						query+= " left join `group` on `group`.`idgroup` = `products_to_grp_rel`.`idgroup`";
						query+= " where `products`.`deleted` = 0";
						query+= whereClause;
					
					app.models.products
					.query(query, function(err, productsCount) {
						if (err) return autoCallback(err);
						return autoCallback(null, productsCount);
					});
				},
			  
				// get the records
				getRecords: ['recordCount', function(result, autoCallback) {
					// if record count is 0 then no need to execute the query to get the data
					var productsCount = (_.isArray(result.recordCount)) ? result.recordCount[0].tot : result.recordCount.tot;
					if (productsCount === 0) return autoCallback();

					var query = " select `products`.`idproducts` as `id`,`products`.*,";
						query+= " `products_pricing`.*,";
						query+= " `products_custom_fld`.*,";
						query+= " `products_stock`.*,";
						query+= " `products_to_grp_rel`.`idgroup`,";
						query+= " `vendor`.`vendor_name` as `vendor_name`,";
						query+= " group_concat(concat(products_tax.tax_name,'::',products_tax.tax_value)) as tax_value,";
						query+= " case when (`user`.`user_name` not like '')";
						query+= " then";
						query+= " `user`.`user_name`";
						query+= " else";
						query+= " `group`.`group_name` end";
						query+= " as `assigned_to`";
						query+= " from `products`";
						query+= " inner join `products_pricing` on `products_pricing`.`idproducts` = `products`.`idproducts`";
						query+= " inner join `products_custom_fld` on `products_custom_fld`.`idproducts` = `products`.`idproducts`";
						query+= " inner join `products_stock` on `products_stock`.`idproducts` = `products`.`idproducts`";
						query+= " left join `user` on `user`.`iduser` = `products`.`iduser`";
						query+= " left join `products_to_grp_rel` on `products_to_grp_rel`.`idproducts` = `products`.`idproducts`";
						query+= " left join `vendor` on `vendor`.`idvendor` = `products`.`idvendor`";
						query+= " left join `group` on `group`.`idgroup` = `products_to_grp_rel`.`idgroup`";
						query+= " left join `products_tax` on `products_tax`.`idproducts` = `products`.`idproducts`";
						query+= " where `products`.`deleted` = 0";
						query+= whereClause;
						query+= " group by `products`.`idproducts`";
						query+= " order by `products`.`idproducts`";
						query+= " limit "+page+" , "+limit;
				
					app.models.products
					.query(query, function(err, cont) {
						if (err) return autoCallback(err);
						return autoCallback(null, cont);
					});
				}]
			},
			function(err, results) {
				if (err) return next(err);
				var products = _.map(results.getRecords, function(productData) {
					// add the quantity info in the response data 
					var quantityInfo = {};
					modulesConfig.moduleAttributes.Products.quantity.forEach( function(attr) {
						quantityInfo[attr]= productData[attr];
					}); 
					productData.quantity = quantityInfo;
					
					//add price_information info in to response data
					var priceInformationInfo = {};
					modulesConfig.moduleAttributes.Products.price_information.forEach( function(attr) {
						priceInformationInfo[attr] = productData[attr];
					});
					productData.price_information = priceInformationInfo;
					
					return productData;
				});
				
				var productsCount= (_.isArray(results.recordCount)) ? results.recordCount[0].tot : results.recordCount.tot;
				var pagingLinks = pagination.pagingLinks(req, productsCount, apiEndpoint);
				
				res.locals.JSONAPIOptions = {
					resourceType: resourceType,
					topLevelLinks: pagingLinks,
					attributes:modulesConfig.moduleAttributes.Products.default,
					dataLinks: {
						self: function (products,cont) {
							return apiEndpoint + cont.id;
						}
					}
				};
				res.locals.meta = {totalRecords: productsCount};
				res.body = products;
				return next(); 
			});
		}	
	};
};
