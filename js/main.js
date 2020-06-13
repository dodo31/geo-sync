// ================ < Main > ==================== //

class Main {
	constructor() {
		this.isPlaying = true;

		this.roundResultParser = new RoundResultParser();
		setInterval(this.updateState.bind(this), 1000);
		
		this.testStorage();
	}

	testStorage() {
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
		var pageContainsResult = this.roundResultParser.containsElement('result');

		console.log(pageContainsResult + "  " + this.isPlaying);

		if(this.isPlaying) {
			if(pageContainsResult) {
				var scoreBarLabelElements = document.getElementsByClassName('score-bar__label');
				var gameStatusElements = document.getElementsByClassName('game-status');

				if(scoreBarLabelElements.length > 0 && gameStatusElements.length > 0) {
					var roundId = this.roundResultParser.parseChallengeId();

					var roundNumber = this.roundResultParser.parseRoundNumber(gameStatusElements);
					var roundScore = this.roundResultParser.parseRoundScore(scoreBarLabelElements);

					var totalScore = this.roundResultParser.parseTotalScore(gameStatusElements);

					console.log(roundId + "  " + roundNumber + "  " + roundScore + "  " + totalScore);

					console.log("ok");

					this.isPlaying = false;
				}
			}
		} else {
			if(!pageContainsResult) {
				this.isPlaying = true;
			}
		}
	}
}


// ================ < RoundResultParser > ==================== //

class RoundResultParser {
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

	parseRoundNumber(gameStatusElements) {
		var roundNumberElement = this.findGameStatusElement("round-number", gameStatusElements);

		if(roundNumberElement) {
			var gameStatusBobyElements = roundNumberElement.getElementsByClassName('game-status__body');

			if(gameStatusBobyElements.length >= 1) {
				var scoreTextTokens = gameStatusBobyElements[0].innerText.split(' / ');
				var roundNumber = parseInt(scoreTextTokens[0]);

				if(!isNaN(roundNumber)) {
					return roundNumber;
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

	parseRoundScore(scoreBarLabelElements) {
		if(scoreBarLabelElements.length >= 1) {
			var scoreContentText = scoreBarLabelElements[0].innerText.toLowerCase();

			if(this.isNoPointText(scoreContentText)) {
				return 0;
			} else {
				if(this.isOnePointText(scoreContentText)) {
					return 1;
				} else {
					var isReadingScore = false;
					var scoreText = "";

					var numberRegex = new RegExp('^\\d+$');

					for (let i = 0; i < scoreContentText.length && (isReadingScore || (!isReadingScore && scoreText.length == 0)); i++) {
						const scoreContentChar = scoreContentText.charAt(i);
						
						if(numberRegex.test(scoreContentChar)) {
							isReadingScore = true;
							scoreText += scoreContentChar;
						} else {
							if(scoreContentChar.trim().length > 0) {
								isReadingScore = false;
							}
						}
					}
	
					if(scoreText.length > 0) {
						var score = parseInt(scoreText);

						if(!isNaN(score)) {
							return score;
						} else {
							return -1;
						}
					} else {
						if(scoreContentText.includes('another')) {
							return 1;
						} else {
							return -1;
						}
					}
				}
			}
		} else {
			return -1;
		}
	}

	isNoPointText(scoreContentText) {
		return scoreContentText.includes("didn't get any point");
	}

	isOnePointText(scoreContentText) {
		return scoreContentText.includes("a point")
			|| scoreContentText.includes("another point");
	}

	parseTotalScore(gameStatusElements) {
		var scoreElement = this.findGameStatusElement("score", gameStatusElements);

		if(scoreElement) {
			var gameStatusBodyElements = scoreElement.getElementsByClassName('game-status__body');

			if(gameStatusBodyElements.length >= 1) {
				var scoreText = gameStatusBodyElements[0].innerText.replace(/\s/g, '');
				var score = parseInt(scoreText);

				if(!isNaN(score)) {
					return score;
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

	findGameStatusElement(elementType, gameStatusElements) {
		var matchingElement = null;

		for (var i = 0; i < gameStatusElements.length && !matchingElement; i++) {
			var gameStatusElement = gameStatusElements[i];
			var dataQaAttribute = gameStatusElement.getAttribute("data-qa")

			if(dataQaAttribute == elementType) {
				matchingElement = gameStatusElement;
			}
		}

		return matchingElement;
	}

	containsElement(elementClass) {
		var elements = document.getElementsByClassName(elementClass);
		return elements.length > 0;
	}
}


// ================ < Start > ==================== //

var main = new Main();