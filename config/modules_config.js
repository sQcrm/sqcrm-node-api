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
		}
	}
}; 