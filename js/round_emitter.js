chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if(request.type == 'ROUND' && request.payload) {
		var requestPayload = request.payload;

		const targetUrl = "https://squad-guessr.herokuapp.com/";
		// const targetUrl = "http://localhost:3000/";

		var cookieDetails = {
			url: targetUrl
		};

		chrome.cookies.getAll(cookieDetails, (geoMerdingCookies) => {
			geoMerdingCookies.forEach((geoMerdingCookie) => {
				var lobbyAddress = geoMerdingCookie.name;
				var jwt = geoMerdingCookie.value;

				var roundParams = '';
				roundParams += 'lobby_address=' + lobbyAddress;
				roundParams += '&challenge_address=' + requestPayload.challenge_id;
				roundParams += '&round_order=' + requestPayload.round_order;
				roundParams += '&round_score=' + requestPayload.round_score;
				roundParams += '&total_challenge_score=' + requestPayload.total_score;
				
				var roundRequest = new XMLHttpRequest();
				roundRequest.open('POST', targetUrl + "round", true);
				roundRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				roundRequest.setRequestHeader("Authorization", jwt);
				roundRequest.send(roundParams);
				
				// => Envoyer JWT par header
				// chrome.cookies.getAll({}, (cookies) => {
				// 	console.log(cookies);
				// });
			});
		});
	}
});