var _ = require('lodash'),
	crmPrivileges = require('../utils/crm_privileges'),
	modulesConfig = require('../config/modules_config'),
	async = require('async'),
	pagination = require('../utils/pagination');
/**
 * @swagger
 * resourcePath: /calendarevents
 * description: sQcrm Calendar Events 
 */
module.exports = function(app, config) {
	var apiNamespace = config.apiNamespace,
		resourceType = 'calendarevents';
	
	// Public Methods
	return {
		/**
		* @swagger
		* path: /api/v1/calendarevents
		* operations:
		*   -  httpMethod: GET
		*      summary: Get all the calendarevents
		*      notes: Return all the calendarevents associated with the token
		*      responseClass: calendarevents
		*      nickname: calendarevents
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

			crmPrivileges.userWhereCondition(req, 2, 'events', 'events_to_grp_rel', true, function(err, whereCond) {
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
					var query = " select count(*) as tot from `events`";
						query+= " inner join `events_custom_fld` on `events_custom_fld`.`idevents` = `events`.`idevents`";
						query+= " left join `user` on `user`.`iduser` = `events`.`iduser`";
						query+= " left join `events_to_grp_rel` on `events_to_grp_rel`.`idevents` = `events`.`idevents`";
						query+= " left join `group` on `group`.`idgroup` = `events_to_grp_rel`.`idgroup`";
						query+= " where `events`.`deleted` = 0";
						query+= whereClause;
					
					app.models.events
					.query(query, function(err, eventsCount) {
						if (err) return autoCallback(err);
						return autoCallback(null, eventsCount);
					});
				},
			  
				// get the records
				getRecords: ['recordCount', function(result, autoCallback) {
					// if record count is 0 then no need to execute the query to get the data
					var eventsCount = (_.isArray(result.recordCount)) ? result.recordCount[0].tot : result.recordCount.tot;
					if (eventsCount === 0) return autoCallback();

					var query = " select `events`.`idevents` as `id`,`events`.*,";
						query+= " `events_custom_fld`.*,";
						query+= " `events_to_grp_rel`.`idgroup`,";
						query+= " `events_related_to`.idmodule as `events_related_to_idmodule`,";
						query+= " `events_related_to`.`related_to`,";
						query+= " `events_reminder`.*,";
						query+= " case when (`user`.`user_name` not like '')";
						query+= " then";
						query+= " `user`.`user_name`";
						query+= " else";
						query+= " `group`.`group_name`";
						query+= " end";
						query+= " as `assigned_to`,";
						query+= " case";
						query+= " when `events_related_to`.`related_to` not like ''";
						query+= " Then";
						query+= " (";
						query+= " case";
						query+= " when sqorg.organization_name not like '' then sqorg.organization_name";
						query+= " when concat(sqcnt.firstname,' ',sqcnt.lastname) not like '' then concat(sqcnt.firstname,' ',sqcnt.lastname)";
						query+= " when concat(sqleads.firstname,' ',sqleads.lastname) not like '' then concat(sqleads.firstname,' ',sqleads.lastname)";
						query+= " when sqpot.potential_name not like '' then sqpot.potential_name";
						query+= " end";
						query+= " )";
						query+= " else ''";
						query+= " end";
						query+= " as `events_related_to_value`";
						query+= " from `events`";
						query+= " inner join `events_custom_fld` on `events_custom_fld`.`idevents` = `events`.`idevents`";
						query+= " left join `user` on `user`.`iduser` = `events`.`iduser`";
						query+= " left join `events_to_grp_rel` on `events_to_grp_rel`.`idevents` = `events`.`idevents`";
						query+= " left join `group` on `group`.`idgroup` = `events_to_grp_rel`.`idgroup`";
						query+= " left join `events_related_to` on `events_related_to`.`idevents` = `events`.`idevents`";
						query+= " left join `leads` as sqleads on sqleads.idleads = `events_related_to`.`related_to` and  `events_related_to`.`idmodule` =3";
						query+= " left join `contacts` as sqcnt on sqcnt.idcontacts = `events_related_to`.`related_to` and `events_related_to`.`idmodule` = 4";
						query+= " left join `organization` as sqorg on sqorg.idorganization = `events_related_to`.`related_to` and `events_related_to`.`idmodule` = 6";
						query+= " left join `potentials` as sqpot on sqpot.idpotentials = `events_related_to`.`related_to` and `events_related_to`.`idmodule` = 5";
						query+= " left join `events_reminder` on `events_reminder`.`idevents` = `events`.`idevents`";
						query+= " where `events`.`deleted` = 0";
						query+= whereClause;
						query+= " order by `events`.`idevents`";
						query+= " limit "+startIndex+" , "+limit;
					
					app.models.events
					.query(query, function(err, events) {
						if (err) return autoCallback(err);
						return autoCallback(null, events);
					});
				}]
			},
			function(err, results) {
				if (err) return next(err);
				var events = _.map(results.getRecords, function(eventsData) {
					var relatedToInfo = {},
						reminderInfo = {};
					relatedToInfo.related_to_id = eventsData.related_to;
					relatedToInfo.related_to_value = eventsData.events_related_to_value;
					relatedToInfo.moduleId = eventsData.events_related_to_idmodule;
					// add the related module name in the response data 
					if (eventsData.events_related_to_idmodule === 4) {
						relatedToInfo.module_name = 'Contacts';
					} else if (eventsData.events_related_to_idmodule === 6) {
						relatedToInfo.module_name = 'Organization';
					} else if (eventsData.events_related_to_idmodule === 3) {
						relatedToInfo.module_name = 'Leads';
					} else if (eventsData.events_related_to_idmodule === 5) { 
						relatedToInfo.module_name = 'Prospects';
					} else {
						relatedToInfo.module_name = null;
					}
					eventsData.related_to = relatedToInfo;
					
					// add the events reminder info 
					modulesConfig.moduleAttributes.CalendarEvents.eventsReminder.forEach( function(attr) {
						reminderInfo[attr]= eventsData[attr];
					}); 
					eventsData.events_reminder = reminderInfo;
					return eventsData;
				});
				
				var eventsCount = (_.isArray(results.recordCount)) ? results.recordCount[0].tot : results.recordCount.tot;
				var pagingLinks = pagination.pagingLinks(req, eventsCount, apiEndpoint);
				
				res.locals.JSONAPIOptions = {
					resourceType: resourceType,
					topLevelLinks: pagingLinks,
					attributes:modulesConfig.moduleAttributes.CalendarEvents.default,
					dataLinks: {
						self: function (events,event) {
							return apiEndpoint + event.id;
						}
					}
				};
				res.locals.meta = {totalRecords: eventsCount};
				res.body = events;
				return next(); 
			});
		}	
	};
};
