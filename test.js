class Test {
	constructor() {
		this.isPlaying = true;
		setInterval(this.updateState.bind(this), 1000);

		var value = "DrawRunner";
		var value2 = "DrawRunner2";

		chrome.storage.local.set({ geoMerding: value }, () => {
			console.log('Value has been set to ' + value);
		});

		chrome.storage.local.set({ geoMerding2: value2 }, () => {
			console.log('Value has been set to ' + value);
		});

		chrome.storage.local.get("geoMerding2", (theValue) => {
			console.log(theValue);
		});
	}

	updateState() {
		var scoreBarLabels = document.getElementsByClassName('score-bar__label');
		var gameStatus = document.getElementsByClassName('game-status');

		if(this.isPlaying) {
			if(scoreBarLabels && gameStatus) {
				var roundId = this.parseChallengeId();
				var roundScore = this.parseScore(scoreBarLabels);
				var roundNumber = this.parseRoundNumber(gameStatus)

				console.log(roundId + "  " + roundScore + "  " + roundNumber);

				this.isPlaying = false;
			}
		} else {
			if(!scoreBarLabels) {
				this.isPlaying = true;
			}
		}
	}

	parseChallengeId() {
		var currentUrl = new URL(location.href);
		var currentPathName = currentUrl.pathname;

		var pathNameTokens = currentPathName.split("/");

		if(pathNameTokens.length > 0) {
			return pathNameTokens[pathNameTokens.length - 1];
		} else {
			return null;
		}
	}

	parseScore(scoreBarLabels) {
		if(scoreBarLabels.length >= 1) {
			var scoreContent = scoreBarLabels[0].innerText;

			var isReadingScore = false;
			var scoreValue = "";

			var numberRegex = new RegExp('^\\d+$');

			for (let i = 0; i < scoreContent.length && (isReadingScore || (!isReadingScore && scoreValue.length == 0)); i++) {
				const scoreContentChar = scoreContent.charAt(i);
				
				if(numberRegex.test(scoreContentChar)) {
					isReadingScore = true;
					scoreValue += scoreContentChar;
				} else {
					if(scoreContentChar.trim().length > 0) {
						isReadingScore = false;
					}
				}
			}

			if(scoreValue.length > 0) {
				return parseInt(scoreValue);
			} else {
				return -1;
			}
		} else {
			return -1;
		}
	}

	parseRoundNumber(gameStatus) {
		var roundNumberElement = this.findRoundNumberElement(gameStatus);

		if(roundNumberElement) {
			var gameStatusBodies = roundNumberElement.getElementsByClassName('game-status__body');

			if(gameStatusBodies.length >= 1) {
				var scoreTextTokens = gameStatusBodies[0].innerText.split(' / ');
				
				if(scoreTextTokens.length >= 2) {
					return parseInt(scoreTextTokens[0]);
				} else {
					return -1;
				}
			} else {
				return -1;
			}
		} else {
			return -1;
		}
	}

	findRoundNumberElement(gameStatus) {
		var roundNumberElement = null;

		for (var i = 0; i < gameStatus.length && !roundNumberElement; i++) {
			var currentGameStatus = gameStatus[i];
			var dataQaAttribute = currentGameStatus.getAttribute("data-qa")

			if(dataQaAttribute == "round-number") {
				roundNumberElement = currentGameStatus;
			}
		}

		return roundNumberElement;
	}
}

var test = new Test();