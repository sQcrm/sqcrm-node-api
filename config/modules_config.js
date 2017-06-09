module.exports = {
	moduleMapping: {
		Home:1,
		Calendar:2,
		Leads:3,
		Contacts:4,
		Potentials:5,
		Organization:6,
		Notes:8,
		Vendor:11,
		Products: 12,
		Quotes: 13,
		SalesOrder:14,
		Invoice:15,
		PurchaseOrder: 16
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
				'portal_user','support_start_date','support_end_date','last_modified','added_on',
				'contact_orgranization','idorganization','address'
			],
			address: [
				'cnt_mail_street','cnt_other_street','cnt_mail_pobox','cnt_other_pobox','cnt_mailing_city',
				'cnt_other_city','cnt_mailing_state','cnt_other_state','cnt_mailing_postalcode',
				'cnt_other_postalcode','cnt_mailing_country','cnt_other_country'
			]
				
		},
		Vendor: {
			default: [
				'vendor_name','email','phone','website','description','assigned_to','added_on',
				'last_modified','address'
			],
			address: [
				'vendor_street','vendor_city','vendor_postal_code','vendor_po_box','vendor_state',
				'vendor_country'
			]
		},
		Products: {
			default: [
					'product_name','is_active','product_category','manufacturer','idvendor','vendor_name',
					'website','description','assigned_to','added_on','last_modified','price_information',
					'tax_value','quantity','price_information'
				],
			quantity: [
					'unit_quantity','quantity_in_stock','quantity_in_demand'
				],
			price_information: [
					'product_price','commission_rate'
				]
		},
		Quotes: {
			default: [
				'quote_number','subject','quote_stage','idorganization','organization_name',
				'idpotentials','potential_name','valid_till','assigned_to','description',
				'added_on','last_modified','net_total','discount_type','discount_value',
				'discounted_amount','tax_values','taxed_amount','shipping_handling_charge',
				'shipping_handling_tax_values','shipping_handling_taxed_amount','final_adjustment_type',
				'final_adjustment_amount','grand_total','terms_condition','address','line_items'
			],
			address: [
				'q_billing_address','q_shipping_address','q_billing_po_box','q_shipping_po_box',
				'q_billing_po_code','q_shipping_po_code','q_billing_city','q_shipping_city',
				'q_billing_state','q_shipping_state','q_billing_country','q_shipping_country'
			]
		},
		SalesOrder: {
			default: [
				'sales_order_number','subject','sales_order_status','idorganization','organization_name',
				'idpotentials','potential_name','idcontacts','contact_name','idquotes','quote_subject',
				'due_date','assigned_to','description','added_on','last_modified','net_total','discount_type',
				'discount_value','discounted_amount','tax_values','taxed_amount','shipping_handling_charge',
				'shipping_handling_tax_values','shipping_handling_taxed_amount','final_adjustment_type',
				'final_adjustment_amount','grand_total','address','line_items'
			],
			address: [
				'so_billing_address','so_shipping_address','so_billing_po_box','so_shipping_po_box',
				'so_billing_po_code','so_shipping_po_code','so_billing_city','so_shipping_city',
				'so_billing_state','so_shipping_state','so_billing_country','so_shipping_country'
			]
		},
		Invoice: {
			default: [
				'invoice_number','subject','invoice_status','idorganization','organization_name',
				'idpotentials','potential_name','idcontacts','contact_name','idsales_order',
				'salesorder_subject','due_date','assigned_to','description','added_on','last_modified',
				'net_total','discount_type','discount_value','discounted_amount','tax_values','taxed_amount',
				'shipping_handling_charge','shipping_handling_tax_values','shipping_handling_taxed_amount',
				'final_adjustment_type','final_adjustment_amount','grand_total','address','line_items'
			],
			address: [
				'inv_billing_address','inv_shipping_address','inv_billing_po_box','inv_shipping_po_box',
				'inv_billing_po_code','inv_shipping_po_code','inv_billing_city','inv_shipping_city',
				'inv_billing_state','inv_shipping_state','inv_billing_country','inv_shipping_country'
			]
		},
		PurchaseOrder: {
			default: [
					'po_subject','description','terms_condition','po_status','due_date','po_number',
					'po_key','net_total','discount_type','discount_value','discounted_amount','tax_values',
					'taxed_amount','shipping_handling_charge','shipping_handling_tax_values','shipping_handling_taxed_amount',
					'final_adjustment_type','final_adjustment_amount','grand_total','added_on','last_modified','last_modified_by',
					'address'
				],
				address: [
					'po_billing_address','po_billing_po_box','po_billing_po_code','po_billing_city','po_billing_state',
					'po_billing_country','po_shipping_address','po_shipping_po_box','po_shipping_po_code','po_shipping_city',
					'po_shipping_state','po_shipping_country'
				]
			
		}
	}
}; 