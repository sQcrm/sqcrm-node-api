module.exports = {
	moduleMapping: {
		Home:1,
		Calendar:2,
		Leads:3,
		Contacts:4,
		Potentials:5,
		Organization:6,
		Notes:8
	},
	moduleAttributes: {
		Leads: {
			default: [
				'firstname', 'lastname','assigned_to','email','phone',
				'mobile','title','fax','leadsource','industry', 'organization',
				'website','lead_status','anual_revenue','rating','description',
				'added_on','last_modified','converted','address'
			],
			address: ['street','po_box','postal_code','country','city','state']
		},
		Organization: {
			default: [
				'organization_name','website','phone','fax','member_of','organization_member_of',
				'num_employes','ticker_symbol','industry','rating','annual_revenue','assigned_to',
				'industry_type','email_opt_out','description','added_on','last_modified','address'
			],
			address: [
				'org_bill_address','org_ship_address','org_bill_pobox','org_ship_pobox','org_bill_city',
				'org_ship_city','org_bill_state','org_ship_state','org_bill_postalcode','org_ship_postalcode',
				'org_bill_country','org_ship_country'
			]
		},
		Potentials: {
			default: [
				'potential_name','potential_type','related_to','expected_closing_date','leadsource',
				'sales_stage','probability','assigned_to','description','amount','lost_reason',
				'competitor_name','added_on','last_modified'
			],
			relatedTo: [
				'module_name','moduleId','related_to_id','related_to_value'
			]
		},
		CalendarEvents: {
			default: [
				'event_type','subject','description','location','priority','start_date','start_time',
				'end_date','end_time','event_status','assigned_to','added_on','last_modified','related_to',
				'events_reminder'
			],
			relatedTo: [
				'module_name','moduleId','related_to_id','related_to_value'
			],
			eventsReminder: [
				'days','hours','minutes','email_ids','reminder_send'
			]
		},
                Contacts: {
                        default: [
                                'firstname','lastname','office_phone','mobile_num','leadsource','home_phone',
                                'title','other_phone','department','email','fax','date_of_birth','assistant','assistant_phone',
                                'reports_to','secondary_email','email_opt_out','do_not_call','description','contact_avatar',
                                'portal_user','support_start_date','support_end_date','last_modified','last_modified_by',
                                'added_on'
                        ],
                        address: [
                                'cnt_mail_street','cnt_other_street','cnt_mail_pobox','cnt_other_pobox','cnt_mailing_city',
                                'cnt_other_city','cnt_mailing_state','cnt_other_state','cnt_mailing_postalcode',
                                'cnt_other_postalcode','cnt_mailing_country','cnt_other_country'
                        ]
                }
	}
}; 