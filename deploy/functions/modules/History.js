/** 
* Copyright 2019 Google LLC
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* 
*     https://www.apache.org/licenses/LICENSE-2.0
* 
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License. 
**/

/**
 * Tracks questions the user has seen and retrieves questions
 * ordered by what the user got correct/incorrect.
 */
module.exports = class History {
	constructor(conv) {
		this.conv = conv;

		this.config = {
			allowStorage: true
		};

		this.history = [];

		this.lastUse;

		if (!this.conv.user.storage.history) {
			this.conv.user.storage.history = {
				config: this.config,
				history: [],
				misc: {}
			};
		}

		this.conv.user.storage.history.lastUse;
	}

	setLastUsed(ms) {
		this.conv.user.storage.history.lastUse = ms;
	}

	getLastUsed() {
		return this.conv.user.storage.history.lastUse;
	}

	getHistory() {
		return this.conv.user.storage.history.history;
	}

	/**
	 * Gets arbitrary value from history misc object
	 * @param {String} key
	 */
	getValue(key) {
		if (!this.conv.user.storage.history.misc) {
			return false;
		}
		return this.conv.user.storage.history.misc[key];
	}

	/**
	 * Sets arbitrary value in history misc object
	 * @param {string} key
	 * @param {string} value
	 */
	setValue(key, value) {
		if (!this.conv.user.storage.history.misc) {
			this.conv.user.storage.history.misc = {};
		}
		this.conv.user.storage.history.misc[key] = value;
	}

	/**
	 * Returns questions that haven't been seen
	 */
	getUnseen() {
		let unseen = [];
		for (let question of this.conv.user.storage.history.history) {
			if (!question || !question.seenCount || question.seenCount === 0) {
				unseen.push(question.questionNumber);
			}
		}
		return unseen;
	}

	/**
	 * Returns questions that user has seen
	 */
	getSeen() {
		let seen = [];
		for (let question of this.conv.user.storage.history.history) {
			if (question && question.seenCount > 0) {
				seen.push(question.questionNumber);
			}
		}
		return seen;
	}
	/**
	 * Returns questions user has gotten correct
	 * @param {Number} passingPct Minimum percentage of times user got this
	 * question correct to count as correct.
	 */
	getCorrect(passingPct = 1) {
		let correct = [];
		for (let question of this.conv.user.storage.history.history) {
			if (question && question.correctCount > 0 && 
				(question.correctCount / question.seenCount) >= passingPct) {
				correct.push(question.questionNumber);
			}
		}
		return correct;
	}

	/**
	 * Returns questions user has gotten incorrect
	 * @param {Number} passingPct Minimum percentage of times user got this
	 * question correct to count as correct.
	 */
	getWrong(passingPct = 1) {
		let wrong = [];
		for (let question of this.conv.user.storage.history.history) {
			if (question && question.seenCount > 0 && 
				(question.correctCount / question.seenCount) < passingPct) {
				wrong.push(question.questionNumber);
			}
		}
		return wrong;
	}

	/**
	 * Save that a user has seen a question
	 * @param {Number} questionNumber
	 * @param {Boolean} isCorrect
	 */
	logQuestion(questionNumber, isCorrect) {
		if (!this.config.allowStorage) {
			return false;
		}

		if (!this.conv.user.storage.history.history[questionNumber]) {
			this.conv.user.storage.history.history[questionNumber] = {
				questionNumber: questionNumber,
				seenCount: 0,
				correctCount: 0
			};
		}

		this.conv.user.storage.history.history[questionNumber].seenCount++;

		if (isCorrect) {
			this.conv.user.storage.history.history[questionNumber]
				.correctCount++;
		}

		for (let [
			index,
			question
		] of this.conv.user.storage.history.history.entries()) {
			if (!question) {
				this.conv.user.storage.history.history[index] = {
					questionNumber: index,
					seenCount: 0,
					correctCount: 0
				};
			}
		}
	}

	/**
	 * Clears out storage
	 */
	deleteAll() {
		this.conv.user.storage = {};
		console.log(this.conv.user.storage.history);
		console.log('deleted');
	}
};
