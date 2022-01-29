// ================ < Main > ==================== //

class Main {
	constructor() {
		this.isPlaying = true;

		this.roundResultParser = new RoundResultParser();
		setInterval(this.updateState.bind(this), 1000);

		this.transmitPresence();
	}

	updateState() {
		const pageContainsResult = this.pageContainResult();

		console.log(pageContainsResult);

		// console.log(pageContainsResult + "  " + this.isPlaying);

		if (this.isPlaying) {
			if (pageContainsResult) {
				var gameStatusElements = document.querySelectorAll('[class^="status_inner"]');
				var scoreBarLabelElements = document.querySelectorAll('[class^="round-result_score"]');

				if (scoreBarLabelElements.length > 0 && gameStatusElements.length > 0) {
					const scoreBarLabelElement = scoreBarLabelElements[0];
					const gameStatusElement = gameStatusElements[0];

					var challengeId = this.roundResultParser.parseChallengeId();

					var roundOrder = this.roundResultParser.parseRoundOrder(gameStatusElement);
					var roundScore = this.roundResultParser.parseRoundScore(scoreBarLabelElement);

					var totalScore = this.roundResultParser.parseTotalScore(gameStatusElement);

					console.log(challengeId + "  " + roundOrder + "  " + roundScore + "  " + totalScore);

					this.transmitRound(challengeId, roundOrder, roundScore, totalScore);

					this.isPlaying = false;
				}
			}
		} else {
			if (!pageContainsResult) {
				this.isPlaying = true;
			}
		}
	}

	pageContainResult() {
		return document.querySelectorAll('[class^="container_content"]').length > 0;
	}

	transmitPresence() {
		var presenceData = {
			type: "POST_PRESENCE",
			payload: true,
		};

		chrome.runtime.sendMessage(presenceData);
	}

	transmitRound(challengeId, roundOrder, roundScore, totalScore) {
		var roundResultData = {
			type: "POST_ROUND_RESULT",
			payload: {
				challenge_id: challengeId,
				round_order: roundOrder,
				round_score: roundScore,
				total_score: totalScore,
			},
		};

		chrome.runtime.sendMessage(roundResultData);
	}
}

// ================ < RoundResultParser > ==================== //

class RoundResultParser {
	parseChallengeId() {
		var currentUrl = new URL(location.href);
		var currentPathName = currentUrl.pathname;

		var pathNameTokens = currentPathName.split("/");

		if (pathNameTokens.length > 0) {
			return pathNameTokens[pathNameTokens.length - 1];
		} else {
			return null;
		}
	}

	parseRoundOrder(gameStatusElement) {
		var roundNumberElement = this.findGameSectionElement("round-number", gameStatusElement);

		if (roundNumberElement) {
			var gameStatusBobyElements = roundNumberElement.querySelectorAll('[class^="status_value"]');

			if (gameStatusBobyElements.length >= 1) {
				var scoreTextTokens = gameStatusBobyElements[0].innerText.split(" / ");
				var roundOrder = parseInt(scoreTextTokens[0]);

				if (!isNaN(roundOrder)) {
					return roundOrder;
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

	parseRoundScore(scoreBarLabelElement) {
		var scoreContentText = scoreBarLabelElement.innerText.toLowerCase();

		if (this.isNoPointText(scoreContentText)) {
			return 0;
		} else {
			if (this.isOnePointText(scoreContentText)) {
				return 1;
			} else {
				var isReadingScore = false;
				var scoreText = "";

				var numberRegex = new RegExp("^\\d+$");

				scoreContentText = scoreContentText.replace(",", "");

				for (
					let i = 0;
					i < scoreContentText.length && (isReadingScore || (!isReadingScore && scoreText.length == 0));
					i++
				) {
					const scoreContentChar = scoreContentText.charAt(i);

					if (numberRegex.test(scoreContentChar)) {
						isReadingScore = true;
						scoreText += scoreContentChar;
					} else {
						if (scoreContentChar.trim().length > 0) {
							isReadingScore = false;
						}
					}
				}

				if (scoreText.length > 0) {
					var score = parseInt(scoreText);

					if (!isNaN(score)) {
						return score;
					} else {
						return -1;
					}
				} else {
					if (scoreContentText.includes("another")) {
						return 1;
					} else {
						return -1;
					}
				}
			}
		}
	}

	isNoPointText(scoreContentText) {
		return scoreContentText.includes("didn't get any point");
	}

	isOnePointText(scoreContentText) {
		return scoreContentText.includes("a point") || scoreContentText.includes("another point");
	}

	parseTotalScore(gameStatusElement) {
		var scoreElement = this.findGameSectionElement("score", gameStatusElement);

		if (scoreElement) {
			var gameStatusValueElements = scoreElement.querySelectorAll('[class^="status_value"]');

			if (gameStatusValueElements.length >= 1) {
				var gameStatusValueElement = gameStatusValueElements[0];
				
				var scoreText = gameStatusValueElement.innerText.replace(/[, ]+/g, "");
				var score = parseInt(scoreText);
				
				console.log(gameStatusValueElement.innerText + "  " + scoreText);

				if (!isNaN(score)) {
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

	findGameSectionElement(elementType, gameStatusElement) {
		var matchingElement = null;

		for (var i = 0; i < gameStatusElement.childNodes.length && !matchingElement; i++) {
			var gameSectionElement = gameStatusElement.childNodes[i];
			var dataQaAttribute = gameSectionElement.getAttribute("data-qa");

			if (dataQaAttribute == elementType) {
				matchingElement = gameSectionElement;
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
