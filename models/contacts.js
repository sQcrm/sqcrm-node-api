var Waterline = require('waterline');

var contacts = Waterline.Collection.extend({

	identity: 'contacts',
	connection: 'sqcrmMysql',
	tableName: 'contacts',
	autoCreatedAt: false,
	autoUpdatedAt: false,
	autoPK: false,

	attributes: {
		id: {
			type: 'integer',
			columnName: 'idcontacts',
			primaryKey: true
		},

		firstname: {
			type: 'string',
			columnName: 'firstname'
		},

		lastname: {
			type: 'string',
			columnName: 'lastname'
		},

		officePhone: {
			type: 'string',
			columnName: 'office_phone'
		},
		
		mobile: {
			type: 'string',
			columnName: 'mobile_num'
		},
		
		leadsource: {
			type: 'string',
			columnName: 'leadsource'
		},
		
		homePhone: {
			type: 'string',
			columnName: 'home_phone'
		},
		
		title: {
			type: 'string',
			columnName: 'title'
		},
		
		otherPhone: {
			type: 'string',
			columnName: 'other_phone'
		},
		
		department: {
			type: 'string',
			columnName: 'department'
		},
		
		email: {
			type: 'string',
			columnName: 'email'
		},
		
		fax: {
			type: 'string',
			columnName: 'fax'
		},
		
		birthDate: {
			type: 'string',
			columnName: 'date_of_birth'
		},
		
		assistantPhone: {
			type: 'string',
			columnName: 'assistant_phone'
		},
		
		reportsTo: {
			type: 'string',
			columnName: 'reports_to'
		},
		
		secondaryEmail: {
			type: 'string',
			columnName: 'secondary_email'
		},
		
		emailOptOut: {
			type: 'string',
			columnName: 'email_opt_out'
		},

		doNotCall: {
			type: 'string',
			columnName: 'do_not_call'
		},
		
		description: {
			type: 'string',
			columnName: 'description'
		},
		
		contactAvatar: {
			type: 'string',
			columnName: 'contact_avatar'
		},
		
		portalUser: {
			type: 'string',
			columnName: 'portal_user'
		},
		
		supportStartDate: {
			type: 'string',
			columnName: 'support_start_date'
		},

                supportEndDate: {
			type: 'string',
			columnName: 'support_end_date'
		},

		lastModified: {
			type: 'string',
			columnName: 'last_modified'
		},
		
		lastModifiedBy: {
			type: 'string',
			columnName: 'last_modified_by'
		},
                
                addedOn: {
			type: 'string',
			columnName: 'added_on'
		},
                
                organizationName: {
                        type: 'string',
                        columnName: 'organization_name'
                    
                },
                
                memberOf: {
                        type: 'string',
                        columnName: 'member_of'
                },
                
                numEmployes: {
                        type: 'string',
                        columnName: 'num_employes'
                },
                
                sisCode: {
                        type: 'string',
                        columnName: 'sis_code'
                },

                tickerSymbol: {
                        type: 'string',
                        columnName: 'ticker_symbol'
                },
                
                industry: {
                        type: 'string',
                        columnName: 'industry'
                },                
                
                rating: {
                    type: 'string',
                    columnName: 'rating'
                },
                
                annualRevenue: {
                        type: 'string',
                        columnName: 'annual_revenue'
                },
                
                industryType: {
                        type: 'string',
                        columnName: 'industry_type'
                },
                
                street: {
                    type: 'string',
                    columnName: 'cnt_mail_street'
                },
                
                otherStreet: {
                    type: 'string',
                    columnName: 'cnt_other_street'
                },
                
                pobox: {
                  type: 'string',
                  columnName: 'cnt_mail_pobox'
                },
                
                otherPobox: {
                    type: 'string',
                    columnName: 'cnt_other_pobox'
                },
                
                city: {
                    type: 'string',
                    columnName: 'cnt_mailing_city'
                },
                
                otherCity: {
                      type: 'string',
                      columnName: 'cnt_other_city'
                },
                
                state: {
                    type: 'string',
                    columnName: 'cnt_mailing_state'
                },
                
                otherStreet: {
                        type: 'string',
                        columnName: 'cnt_other_state'
                },
                
                postalCode: {
                     type : 'string',
                     columnName: 'cnt_mailing_postalcode'
                },
                
                otherPostalcode: {
                    type: 'string',
                    columnName: 'cnt_other_postalcode'
                },
                
                country:{
                    type: 'string',
                    columnName: 'cnt_mailing_country'
                },
                
                otherCountry: {
                    type: 'string',
                    columnName: 'cnt_mailing_country'
                },
                
                deleted: {
			type: 'integer'
		},
		
		toJSON: function() {
			var obj = this.toObject();
			return obj;
		}
	}
});

module.exports = contacts;
