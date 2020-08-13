chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch(request.type) {
	case 'POST_PRESENCE':
		postPresenceCookie(request);
		break;
	case 'POST_ROUND_RESULT':
		postRoundResult(request);
		break;
	}
});

function postPresenceCookie() {
	// WARNING : Do not change it to httpS !!!
	chrome.cookies.set({ url: "http://squad-guessr.herokuapp.com/", name: "is_geo-sync_installed", value: "true" });
}

function postRoundResult(requestPayload) {
	const targetUrl = "https://squad-guessr.herokuapp.com/";
	// const targetUrl = "http://localhost:3000/";

	var cookieDetails = {
		url: targetUrl
	};

	chrome.cookies.getAll(cookieDetails, (squadGuessrCookies) => {
		squadGuessrCookies.forEach((squadGuessrCookie) => {
			var lobbyAddress = squadGuessrCookie.name;
			var jwt = squadGuessrCookie.value;

			if(lobbyAddress && requestPayload.challenge_id
			&& requestPayload.round_order && requestPayload.round_score
			&& requestPayload.total_score) {
				var roundParams = '';
				roundParams += 'lobby_address=' + lobbyAddress;
				roundParams += '&challenge_address=' + requestPayload.challenge_id;
				roundParams += '&round_order=' + requestPayload.round_order;
				roundParams += '&round_score=' + requestPayload.round_score;
				roundParams += '&total_challenge_score=' + requestPayload.total_score;
				
				var roundRequest = new XMLHttpRequest();
				roundRequest.open('POST', targetUrl + "round", true);

				console.log(roundRequest);

				roundRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				roundRequest.setRequestHeader("Authorization", jwt);
				roundRequest.send(roundParams);
			}
		});
	});
}