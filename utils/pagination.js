exports.parsePagingRequest = function(req, callback) {
	var page = parseInt(req.query.page) || 1,
		limit = parseInt(req.query.limit) || 50;
	
	if (limit > 100) {
		return callback({
			title:'Pagination request out of bound',
			details:'Data limit is more than the permitted value which is 100'
		});
	} else {
		var data = {
			page : page,
			limit: limit
		};
		return callback(null,data);
	}
};

exports.pagingLinks = function(req, recordCount, baseUrl) {
	var page = parseInt(req.query.page) || 1,
		limit = parseInt(req.query.limit) || 50,
		lastPage,currPageLink,firstPageLink,lastPageLink,nextPageLink,prevPageLink,prevPage,nextPage;
	
	baseUrl = baseUrl || '';
	lastPage      = Math.ceil(recordCount/limit);
	prevPage      = page-1;
	nextPage      = page+1;
	currPageLink  = baseUrl+'?page='+page+'&limit='+limit;
	firstPageLink = (page === 1 ? null : baseUrl+'?page=1&limit='+limit);
	lastPageLink  = (lastPage === page ? null : baseUrl+'?page='+lastPage+'&limit='+limit);
	nextPageLink  = (page+1 <= lastPage ? baseUrl+'?page='+nextPage+'&limit='+limit : null);
	prevPageLink  = (page-1 > 0 ? baseUrl+'?page='+prevPage+'&limit='+limit : null);
	
	return {
		firstPageLink: firstPageLink,
		prevPageLink:  prevPageLink,
		currPageLink:  currPageLink,
		nextPageLink:  nextPageLink,
		lastPageLink:  lastPageLink
	};
};