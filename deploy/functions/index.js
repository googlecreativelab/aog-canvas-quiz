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

const functions = require('firebase-functions');
const { dialogflow } = require('actions-on-google');
const config = require('./modules/config.js');
const DataManager = require('./modules/DataManager.js');
const Replier = require('./modules/Replier.js');
const History = require('./modules/History.js');
// DataManager handles all the quiz data. It exists globally to persist the
// data in memory so it can be shared across sessions.
dataManager = new DataManager();

// Set debug to true to get console logs for all requests and responses
const app = dialogflow({ debug: true }).middleware(async conv => {
	// quizData holds all questions, answers, etc.
	// Don't change it. It's global and will edit for all users.
	conv.quizData = await dataManager.getQuizData();
	// Replier handles replies for all surfaces (audio-only, canvas, 
	// screen without canvas)
	conv.replier = new Replier(conv);
	// History tracks what questions they've seen and what they've missed.
	conv.history = new History(conv);
});

/******************************
 * Dialogflow intent handlers *
 ******************************/

app.intent('welcome', conv => {
	return welcome(conv);
});

app.intent('start over', conv => {
	return welcome(conv);
});

app.intent('another round', conv => {
	conv.replier.addReply(dataManager.getMisc('another round'));
	return startQuiz(conv, conv.data.quizType);
});

app.intent('reject another round', conv => {
	conv.close("Goodbye");
});

app.intent('next question', conv => {
	return askNextQuestion(conv, dataManager.getMisc('next question').text);
});

app.intent('previous question', conv => {
	return askPreviousQuestion(conv);
});

app.intent('give answer', (conv, params) => {
	return checkAnswer(conv, params);
});

app.intent('give answer on retry', (conv, params) => {
	setContext(conv, config.contexts.RETRYING);
	return checkAnswer(conv, params);
});

app.intent('confirm next question', (conv, params) => {
	return askNextQuestion(conv);
});

app.intent('confirm see score', (conv, params) => {
	deleteContext(conv, config.contexts.WAS_ASKED_TO_SEE_SCORE);
	return askNextQuestion(conv);
});

app.intent('confirm retry', (conv, params) => {
	setContext(conv, config.contexts.RETRYING);
	return retryCurrentQuestion(conv);
});

app.intent('reject next question', (conv, params) => {
	setContext(conv, config.contexts.WAS_ASKED_TO_START_OVER);
	conv.replier.addCanvasUpdate({
		screenType: config.canvasScreenTypes.FALLBACK
	});
	return conv.replier.send(dataManager.getMisc('not ready for next'));
});

app.intent('reject retry', (conv, params) => {
	conv.replier.addReply(dataManager.getMisc('skip retry'));
	return skipToAnswer(conv);
});

app.intent("i don't know", (conv, params) => {
	conv.replier.addReply(dataManager.getMisc('dont know'));
	return skipToAnswer(conv);
});

app.intent('option selected', (conv, params, option) => {
	if (getContext(conv, config.contexts.WAS_ASKED_QUIZ_TYPE)) {
		deleteContext(conv, config.contexts.WAS_ASKED_QUIZ_TYPE);
		return startQuiz(conv, option);
	} else if (getContext(conv, config.contexts.QUIZ_ENDED)) {
		if (option.toLowerCase() === 
			dataManager.getMisc('next round button').text.toLowerCase()) {
			conv.replier.addReply(dataManager.getMisc('another round').text);
			return startQuiz(conv, conv.data.quizType);
		} else {
			return conv.close("Goodbye");
		}
	} else if (getContext(conv, config.contexts.ASKED_QUESTION)) {
		params.answer = [option];
		return checkAnswer(conv, params);
	} else {
		return conv.replier.send('Unhandled option selected: ' + option);
	}
});

// TODO: Next four intents use pretty much identical code
app.intent('take practice test', (conv, params) => {
	if (!conv.data.quizType) {
		conv.replier.addReply(dataManager.getMisc('start free'));
	} else {
		conv.replier.addReply(dataManager.getMisc('restart free'));
	}
	return startQuiz(conv, config.quizTypes.FREE);
});

app.intent('take multiple choice', (conv, params) => {
	if (!conv.data.quizType) {
		conv.replier.addReply(dataManager.getMisc('start mc'));
	} else {
		conv.replier.addReply(dataManager.getMisc('restart mc'));
	}
	return startQuiz(conv, config.quizTypes.MC);
});

app.intent('show about', (conv, params) => {
	return showAbout(conv, params);

})

app.intent('hide about', (conv, params) => {
	return hideAbout(conv, params);

})

//! For debugging
app.intent('debug delete history', (conv, params) => {
	conv.history.deleteAll();
	conv.replier.send('History deleted');
});

//! For debugging
app.intent('debug go to question', (conv, params) => {
	if (params.number) {
		return goToQuestion(conv, params.number);
	} else {
		conv.replier.send(
			"Sorry, I don't know what question you want to go to."
		);
	}
});

//! For debugging
app.intent('debug set order linear', (conv, params) => {
	conv.data.customConfig = {
		ORDERING: {
			USE_SELECTED_QUESTIONS: false,
			RANDOMIZE_ORDER: false,
			PRIORITIZE_UNSEEN: true,
			PRIORITIZE_WRONG: false
		}
	}
	conv.replier.addCanvasUpdate({
		screenType: config.canvasScreenTypes.FALLBACK
	});
	conv.replier.send('Debug linear order set.');
})

app.intent('fallback', (conv, params) => {
	return handleFallback(conv, params);
});

/*************************************
 * End of Dialogflow intent handlers *
 *************************************/

exports.quiz = functions.https.onRequest(app);

/**
 * Gives welcome message and gives users options of quiz types.
 * @param {Object} conv Dialogflow conversation
 * @param {Object} params Dialogflow params
 */
function welcome(conv, params) {

	let previousUseMs = 0;
	if (conv.history.getLastUsed()) {
		let d = new Date(conv.history.getLastUsed());
		previousUseMs = d.getTime();
	}

	if (previousUseMs > Date.now() - config.WELCOME_BACK_MAX_TIME * 1000) {
		//User has opened app recently.
		conv.replier.addReply(dataManager.getMisc('intro welcome back'));
		conv.replier.addCanvasUpdate({ returning: true });
	} else {
		// User has never opened the app, or hasn't done it in a while.
		conv.replier.addReply(dataManager.getMisc('intro'));
		conv.replier.addCanvasUpdate({ returning: false });
	}

	conv.history.setLastUsed(Date.now());

	setContext(conv, config.contexts.WAS_ASKED_QUIZ_TYPE);

	conv.replier.addCanvasUpdate({
		screenType: config.canvasScreenTypes.WELCOME,
		headline: dataManager.getMisc('homeHeadline').text,
		qType: config.quizTypes.MC
	});

	// Give users options to do multiple choice or free answer
	conv.replier.addReply({
		type: config.replyTypes.ANSWER_CHOICES,
		content: {
			title: dataManager.getMisc('homeHeadline').text,
			list: [
				{
					key: config.quizTypes.MC,
					title: dataManager.getMisc('mcBtn').text
				},
				{
					key: config.quizTypes.FREE,
					title: dataManager.getMisc('freeBtn').text
				}
			]
		}
	});

	return conv.replier.send();
}
/**
 * Shows about content
 * @param {Object} conv 
 * @param {Object} params 
 */
function showAbout(conv, params) {
	conv.replier.addReply(dataManager.getMisc('about body'));
	conv.replier.addCanvasUpdate({
		screenType: config.canvasScreenTypes.ABOUT,
		headline: dataManager.getMisc('about headline').text,
		body: dataManager.getMisc('about body').text
	});
	if (conv.replier.hasCanvas) {
		setContext(conv, config.contexts.ABOUT_SCREEN, 1);
	}
	conv.replier.send();
}

function hideAbout(conv, params) {
	deleteContext(conv, config.contexts.ABOUT_SCREEN);
	conv.repier.addCanvasUpdate({
		screenType: config.canvasScreenTypes.ABOUT_CLOSE
	})
}

/**
 * Handles input that doesn't match a Dialogflow intent
 * @param {Object} conv
 * @param {Object} params
 */
function handleFallback(conv, params) {
	if (conv.contexts.get(config.contexts.ASKED_QUESTION)) {
		// User is trying to give an answer
		return checkAnswer(conv, params);
	} else if (getContext(conv, config.WAS_ASKED_QUIZ_TYPE)) {
		// User is trying to pick which quiz type to take from the home screen
		conv.replier.send(dataManager.getMisc('quiz type fallback'));
	} else {
		// Unsure what user wants. Do fallback.
		conv.replier.addCanvasUpdate({
			screenType: config.canvasScreenTypes.FALLBACK
		});
		conv.replier.send(dataManager.getMisc('fallback'));
	}
}

/**
 * Replaces a question at a given index with another question.
 * @param {Object} conv 
 * @param {Number} queueIndexToReplace Index in the queue to replace
 */
function replaceQuestion(conv, queueIndexToReplace) {
	const oldQuestionNum = conv.data.queue[queueIndexToReplace];
	conv.data.queue.splice(queueIndexToReplace, 1);
	let questionAlreadyInQueue = true;
	let newQuestionNum;
	// Full queue is every possible question, ordered by history
	const fullQueue = getFullQueue(conv);
	let fullQueueIndex = 0;
	// Loop through the full queue and take the first question found that's
	// not already in the active queue.
	while (questionAlreadyInQueue) {
		newQuestionNum = fullQueue[fullQueueIndex];
		if (!conv.data.queue.includes(newQuestionNum) &&
			oldQuestionNum !== newQuestionNum) {
			questionAlreadyInQueue = false;
		}
		fullQueueIndex++;
		if (fullQueueIndex >= fullQueue.length) {
			console.error("Can't find a question to replace in the queue that"
				+ "isn't already in it");
			break;
		}
	}
	conv.data.queue.push(newQuestionNum);
}

/**
 * Asks the next question in the queue
 * @param {Object} conv
 * @param {String} sayBefore Text that should be prefixed to the response
 */
async function askNextQuestion(conv, sayBefore) {
	deleteContext(conv, config.contexts.WAS_ASKED_TO_CONTINUE);
	conv.data.qNum++;
	if (conv.data.qNum >= conv.data.queue.length) {
		// User reached end of this set of questions
		return endQuiz(conv);
	} else {
		if (sayBefore) {
			conv.replier.addReply(sayBefore);
			return askQuestion(
				conv,
				conv.quizData.questions[conv.data.queue[conv.data.qNum]]
			);
		} else {
			return askQuestion(
				conv,
				conv.quizData.questions[conv.data.queue[conv.data.qNum]]
			);
		}
	}
}

/**
 * Asks the previous question in the queue
 * @param {Object} conv 
 */
function askPreviousQuestion(conv) {
	deleteContext(conv, config.contexts.WAS_ASKED_TO_CONTINUE);
	conv.data.qNum--;
	if (conv.data.qNum < 0) {
		// User is already at first question
		conv.data.qNum = 0;
	} else {
		conv.replier.addReply(dataManager.getMisc('previous question'));
	}
	return askQuestion(
		conv,
		conv.quizData.questions[conv.data.queue[conv.data.qNum]]
	);
}

/**
 * Jumps to a question.
 * ! This is for debugging
 * @param {Object} conv
 * @param {Number} num
 * @param {Boolean} skipNotice Whether to have the app tell 
 * 								you what question you're going to.
 */
function goToQuestion(conv, num, skipNotice) {
	if (!skipNotice) {
		conv.replier.addReply('Going to question ' + num);
	}
	return askQuestion(conv, conv.quizData.questions[num]);
}

/**
 * Retries current question
 * @param {Object} conv
 */
function retryCurrentQuestion(conv) {
	deleteContext(conv, config.contexts.WAS_ASKED_TO_RETRY);
	setContext(conv, config.contexts.RETRYING);
	return askQuestion(conv, conv.data.curQ);
}

/**
 * Asks the current question again. This doesn't count as a retry, of which
 * a user gets a limited amount.
 * @param {Object} conv
 */
function reaskQuestion(conv) {
	return askQuestion(conv, conv.data.curQ);
}

/**
 * Asks the user a question
 * @param {Object} conv
 * @param {Object} question Question object as constructed by DataManager
 */
async function askQuestion(conv, question) {
	conv.contexts.set(config.contexts.ASKED_QUESTION, 5);
	// curQ holds the data about the current question for convenience
	// Avoid editing it, as it may edit it for all users.
	conv.data.curQ = question;
	// qState tracks the user's current state with the question
	conv.data.qState = {};
	// Skip questions with multiple answers on devices with screens that don't
	// support canvas (iOS). This is because there is no multiselect.
	if (!conv.replier.hasCanvas && conv.replier.hasScreen && question.mustHave > 1) {
		replaceQuestion(conv, conv.data.qNum);
		conv.data.qNum--;
		return askNextQuestion(conv);
	}

	// Add question text to be asked
	conv.replier.addReply(conv.data.curQ.question);
	// Add question text to be displayed in canvas
	conv.replier.addCanvasUpdate({ headline: conv.data.curQ.question });
	// Add the quiz type so frontend knows what mode to display
	if (conv.data.quizType === config.quizTypes.FREE) {
		conv.replier.addCanvasUpdate({ qType: config.quizTypes.FREE });
		return conv.replier.send();
	} else {
		conv.replier.addCanvasUpdate({ qType: config.quizTypes.MC });
	}
	// Minimum number of wrong answers to show
	let numOfWrongs = 2;
	// Minimum number of correct answers to show
	let numOfCorrects = 1;
	// Questions with multiple answers
	if (conv.data.curQ.mustHave > 1) {
		numOfCorrects = conv.data.curQ.mustHave;
		conv.replier.addCanvasUpdate({ mustHave: conv.data.curQ.mustHave });
	}
	// Show more wrong answers if there are 3 correct answers
	if (conv.data.curQ.mustHave >= 3) {
		numOfWrongs = 3;
	}

	var choices = [];
	if (conv.data.curQ.wrongAnswers) {
		// Shuffle and select the wrong answers
		choices = shuffle(conv.data.curQ.wrongAnswers).slice(0, numOfWrongs);
	}
	let i = 1;
	// If there aren't enough wrong answers, add placeholders
	while (choices.length < 2) {
		choices.push('Placholder wrong answer ' + i);
		i++;
	}
	let answers = conv.data.curQ.answers;
	// Check if there are answers to override the original answers
	// Used in the case of answers that change dynamically 
	if (conv.data.qState.answers) {
		answers = conv.data.qState.answers;
	}
	// Shuffle and select the right answers
	choices = choices.concat(shuffle(answers).slice(0, numOfCorrects));
	// Shuffle all the choices to be shown
	choices = shuffle(choices);
	var listItems = [];
	for (var choice of choices) {
		let item = {
			// Title is displayed to the user
			title: choice,
			// Key is the text sent when the user selects it
			key: choice
		};
		listItems.push(item);
	}

	conv.replier.addReply({
		type: config.replyTypes.ANSWER_CHOICES,
		content: {
			list: listItems
		}
	});

	conv.replier.send();
}

/**
 * Checks answer to see if it's correct
 * @param {Object} conv
 * @param {Object} params
 */
function checkAnswer(conv, params) {
	deleteContext(conv, config.contexts.ASKED_QUESTION);
	let correctAnswers = [];
	let incorrectAnswers = [];

	let answers = conv.data.curQ.answers;
	if (conv.data.qState.answers) {
		answers = conv.data.qState.answers;
	}

	// Loop through all possible correct answers
	for (const quizAnswer of answers) {
		let thisAnswerIsCorrect = false;
		if (params.answer && params.answer.length > 0) {
			// Loop through answer entities in user's response
			for (const userAnswer of params.answer) {
				if (userAnswer.toLowerCase() === quizAnswer.toLowerCase()) {
					// Answer entity matches correct answer
					correctAnswers.push(userAnswer);
					thisAnswerIsCorrect = true;
					break;
				}
			}
		}

		// If this correct answer hasn't been found yet, search for it as a 
		// substring in raw input. This is handy for edge cases where 
		// Dialogflow gets confused.
		if (!thisAnswerIsCorrect) {
			let allPossibleAnswers = [quizAnswer];
			const entity = getEntity(conv, quizAnswer, false);
			if (entity && entity.synonyms) {
				allPossibleAnswers = allPossibleAnswers.concat(entity.synonyms);
			}
			for (const possibleAnswer of allPossibleAnswers) {
				if (conv.input.raw.toLowerCase().indexOf(possibleAnswer.toLowerCase()) > -1) {
					let matchesIncorrectAnswer = false;
					// Check if the user's answer is one of the incorrect answers
					for (const incorrect of conv.data.curQ.wrongAnswers) {
						if (
							// Matches exactly
							(incorrect.toLowerCase() === conv.input.raw.toLowerCase())
							||
							// The incorrect answer is longer, so just look for it in the string
							(incorrect.length > possibleAnswer.length &&
								conv.input.raw.toLowerCase().indexOf(incorrect.toLowerCase() - 1) > -1)
						) {
							matchesIncorrectAnswer = true;
							break;
						}
					}
					if (!matchesIncorrectAnswer) {
						correctAnswers.push(quizAnswer);
						thisAnswerIsCorrect = true;
						break;
					}
				}
			}
		}
	}

	// Check for incorrect answers in user's response. Prevents them from saying
	// all possible answers and getting it correct.
	for (const incorrect of conv.data.curQ.wrongAnswers) {
		if (conv.input.raw.toLowerCase().indexOf(incorrect.toLowerCase()) > -1) {
			let isPartOfCorrectAnswer = false;
			for (const possibleAnswer of answers) {
				if (possibleAnswer.toLowerCase().indexOf(incorrect.toLowerCase()) > -1) {
					isPartOfCorrectAnswer = true;
				}
			}
			if (!isPartOfCorrectAnswer) {
				incorrectAnswers.push(incorrect);
			}
		}
	}

	// If we haven't found any correct answers or any incorrect answer entities,
	// save the whole raw input as an incorrect answer.
	if (correctAnswers.length === 0 && incorrectAnswers.length === 0) {
		incorrectAnswers.push(conv.input.raw);
	}

	// Check how many correct answers this question needs to be correct
	// For example, the question "Name two of the original American colonies?"
	let minCorrectAnswers = 1;
	if (conv.data.curQ.mustHave) {
		minCorrectAnswers = conv.data.curQ.mustHave;
	}

	if (correctAnswers.length >= minCorrectAnswers 
			&& incorrectAnswers.length === 0) {
		// User has enough correct answers to pass the question.
		conv.data.qState.correct = true;
		conv.data.score++;

		conv.data.roundHistory[conv.data.qNum] = {
			correct: true,
			userAnswers: correctAnswers
		};
	} else {
		// User doesn't have enough correct answers to pass.
		conv.data.roundHistory[conv.data.qNum] = {
			correct: false,
			userAnswers: correctAnswers.concat(incorrectAnswers)
		};
	}
	showAnswer(conv);
}

/**
 * Reveals answer. Used if user gives up.
 * @param {Object} conv
 */
function skipToAnswer(conv) {
	return showAnswer(conv, true);
}

/**
 * Reveals correct answer
 * @param {Object} conv
 * @param {Boolean} skipRetry Whether to give user option to retry
 */
function showAnswer(conv, skipRetry) {
	deleteContext(conv, config.contexts.ASKED_QUESTION);
	deleteContext(conv, config.contexts.RETRYING);
	deleteContext(conv, config.contexts.WAS_ASKED_TO_CONTINUE);
	deleteContext(conv, config.contexts.WAS_ASKED_TO_RETRY);

	let answers = conv.data.curQ.answers;
	if (conv.data.qState.answers) {
		answers = conv.data.qState.answers;
	}
	conv.replier.addCanvasUpdate({ correctAnswers: answers });

	// Add appropriate content based on whether the user got it right or wrong
	if (conv.data.qState.correct) {
		// User got it correct

		const reply = dataManager.getMisc('correct');
		conv.replier.addCanvasUpdate({
			headline: reply.text,
			result: 'correct'
		});
		conv.replier.addReply(dataManager.getMisc('correct sfx'));
		conv.replier.addReply(reply);
		if (answers.length > 1) {
			// If multiple answers, show a list of them.
			conv.replier.addReply(
				dataManager.getMisc('moreinfo multiple'),
				'screen'
			);
		} else {
			if (getEntity(conv, answers[0])) {
				conv.replier.addReply(
					dataManager.getMisc('moreinfo single'),
					'screen'
				);
			}
		}
		conv.history.logQuestion(
			conv.data.curQ.index,
			conv.data.qState.correct
		);
	} else {
		// User got it wrong	
		const reply = dataManager.getMisc('incorrect headline');
		conv.replier.addCanvasUpdate({
			headline: reply.text,
			result: 'incorrect'
		});
		//let replyStr = '';
		if (!skipRetry) {
			conv.replier.addReply(dataManager.getMisc('incorrect sfx'));
			conv.replier.addReply(reply);
		}

		if (
			getContext(conv, config.contexts.RETRYING) ||
			skipRetry ||
			!config.ALLOW_RETRY
		) {
			// Give them the answer. Don't ask for retry.
			conv.replier.addReply(buildCorrectResponse(conv.data.curQ, answers));
			conv.history.logQuestion(
				conv.data.curQ.index,
				conv.data.curQ.correct
			);
		} else {
			// Ask for retry
			setContext(conv, config.contexts.WAS_ASKED_TO_RETRY);
			conv.replier.addCanvasUpdate({
				type: 'retry'
			});
			conv.replier.addReply(dataManager.getMisc('retry ask'));
			const options = ['Try again', 'Show me the answer'];
			conv.replier.addCanvasUpdate({
				prompt: dataManager.getMisc('incorrect headline retry').text,
				options: options
			});
			conv.replier.addSuggestions(options);
			return conv.replier.send();
		}
	}

	// Show the correct answer
	if (conv.data.curQ.answers.length > 1) {
		// Multiple answers
		conv.replier.addReply({
			type: config.replyTypes.EXTRA_INFO,
			content: { title: "Possible answers", list: answers }
		});
	} else {
		// One answer
		conv.replier.addReply({
			type: config.replyTypes.EXTRA_INFO,
			content: getCardForEntity(conv, conv.data.curQ.answers[0])
		});
	}

	if (conv.data.qNum >= conv.data.queue.length - 1) {
		// Quiz is over
		conv.replier.addReply(dataManager.getMisc('quiz done'));
		conv.replier.addSuggestions(
			[dataManager.getMisc('see score button').text]
		);
		conv.replier.addCanvasUpdate({ 
			nextBtn: dataManager.getMisc('see score button').text 
		});
		setContext(conv, config.contexts.WAS_ASKED_TO_SEE_SCORE);
	} else {
		// Prompt to continue
		conv.replier.addReply(dataManager.getMisc('continue prompt'));
		conv.replier.addSuggestions(['Next question']);
		conv.replier.addCanvasUpdate({ 
			nextBtn: dataManager.getMisc('next button').text 
		});

	}

	setContext(conv, config.contexts.WAS_ASKED_TO_CONTINUE);

	conv.replier.send();
}

/**
 * Resets all tracking and starts the quiz
 * @param {Object} conv
 * @param {String} quizType Free answer or multiple choice
 */
function startQuiz(conv, quizType) {
	deleteAllContexts(conv);

	conv.data.qNum = -1;
	conv.data.score = 0;
	conv.data.queue = [];
	conv.data.quizType = quizType;
	conv.data.roundHistory = [];

	var sayBefore;

	let orderingConfig;
	if (conv.data.customConfig && conv.data.customConfig.ORDERING) {
		orderingConfig = conv.data.customConfig.ORDERING;
	} else {
		orderingConfig = config.ORDERING;
	}
	if (orderingConfig.USE_SELECTED_QUESTIONS) {
		// Check if num questions is larger than the selected questions array
		if (orderingConfig.NUM_QUESTIONS > orderingConfig.SELECTED_QUESTIONS.length) {
			// Set num questions to selected questions length
			orderingConfig.NUM_QUESTIONS = orderingConfig.SELECTED_QUESTIONS.length;
		}
	}
	conv.data.queue = getFullQueue(conv).slice(0, config.NUM_QUESTIONS)
	return askNextQuestion(conv, sayBefore);
}

function getFullQueue(conv) {
	let queue = [];
	let selectedQuestions = [];

	let orderingConfig;
	if (conv.data.customConfig && conv.data.customConfig.ORDERING) {
		orderingConfig = conv.data.customConfig.ORDERING;
	} else {
		orderingConfig = config.ORDERING;
	}

	// Check if there's a hardcoded list of questions to include
	if (orderingConfig.USE_SELECTED_QUESTIONS) {
		selectedQuestions = orderingConfig.SELECTED_QUESTIONS;
	} else {
		// Push all questions to the selected queue
		for (let i = 0; i < conv.quizData.questions.length; i++) {
			selectedQuestions.push(i);
		}
	}

	// Check if we're prioritizing based on what the user has seen or gotten wrong
	if (orderingConfig.PRIORITIZE_UNSEEN || orderingConfig.PRIORITIZE_WRONG) {
		let subsets = [];
		let seen = conv.history.getSeen();
		let unseen = conv.history.getUnseen();
		let wrong = conv.history.getWrong(.75);
		let correct = conv.history.getCorrect(.75);
		for (let selected of selectedQuestions) {
			if (!unseen.includes(selected) && !seen.includes(selected)) {
				unseen.push(selected);
			}
		}
		unseen.sort((a, b) => {
			return a - b;
		});

		if (orderingConfig.PRIORITIZE_UNSEEN && !orderingConfig.PRIORITIZE_WRONG) {
			// First show all seen questions, then unseen
			subsets.push(unseen, seen);
		} else if (!orderingConfig.PRIORITIZE_UNSEEN && orderingConfig.PRIORITIZE_WRONG) {
			// First show all questions the user has seen in order of getting 
			// wrong then show the unseen ones.
			subsets.push(wrong, correct, unseen);
		} else {
			// First show all the questions user hasn't seen. Then show the ones 
			// they have, in order of what they've gotten most wrong.
			subsets.push(unseen, wrong, correct);
		}
		// If randomizing, then shuffle all the subsets
		if (orderingConfig.RANDOMIZE_ORDER) {
			for (let set of subsets) {
				set = shuffle(set);
			}
		}
		let allQuestionsSorted = [];
		// Put the sets together
		for (let set of subsets) {
			for (let elem of set) {
				allQuestionsSorted.push(elem);
			}
		}

		if (selectedQuestions) {
			// If there's a hardcoded list of questions, then go through and 
			// pick out the questions specified in the list.
			for (let question of allQuestionsSorted) {
				if (selectedQuestions.includes(question)) {
					queue.push(question);
					continue;
				}
			}
		} else {
			queue = allQuestionsSorted;
		}
	} else {
		// No prioritization, so put all selected questions into the queue
		for (let i = 0; i < selectedQuestions.length; i++) {
			queue.push(selectedQuestions[i]);
		}

		if (orderingConfig.RANDOMIZE_ORDER) {
			queue = shuffle(queue);
		}
	}
	return queue;
}

/**
 * Shows final screen of quiz
 * @param {Object} conv
 */
function endQuiz(conv) {
	let results = [];
	let score = 0;
	for (const [index, qNum] of conv.data.queue.entries()) {
		let correct = false;
		let correctAnswers = conv.quizData.questions[qNum].answers;
		let userAnswers = [];
		if (conv.data.roundHistory[index]) {
			userAnswers = conv.data.roundHistory[index].userAnswers;
			if (conv.data.roundHistory[index].correct) {
				//User got this question right
				correct = true;
				score++;
			}
		} else {
			//User skipped this question
			userAnswers = ["(Question skipped)"];
		}
		results.push({
			question: conv.quizData.questions[qNum].question,
			correct: correct,
			correctAnswers: correctAnswers,
			userAnswers: userAnswers
		});
	}

	conv.replier.addCanvasUpdate({ results: results });

	deleteAllContexts(conv);
	setContext(conv, config.contexts.QUIZ_ENDED);

	// This is audio-only since it's printed big onscreen.
	conv.replier.addReply(
		'You got ' + score + ' of ' + conv.data.qNum + ' correct.',
		'audio'
	);

	// Add feedback based on how many questions user got right
	for (const threshold of config.FEEDBACK_THRESHOLDS) {
		if (score <= threshold.score) {
			conv.replier.addReply(dataManager.getMisc(threshold.reply + '-sfx'));
			conv.replier.addReply(dataManager.getMisc(threshold.reply));
			break;
		}
	}

	if (score > config.NUM_TO_PASS) {
		conv.replier.addReply(dataManager.getMisc('pass feedback'));
	} else {
		conv.replier.addReply(dataManager.getMisc('fail feedback'));
	}
	conv.replier.addReply(dataManager.getMisc('restart ask'));
	conv.replier.addSuggestions('Yes');

	conv.replier.addCanvasUpdate({
		screenType: config.canvasScreenTypes.RESULTS,
		headline: 'You scored ' + score + ' out of ' + conv.data.qNum,
		qType: config.quizTypes.MC,
		score: score
	});

	conv.replier.addReply({
		type: config.replyTypes.ANSWER_CHOICES,
		content: {
			title: '',
			list: [
				{
					key: dataManager.getMisc('next round button').text,
					title: dataManager.getMisc('next round button').text
				},
				{
					key: dataManager.getMisc('stop button').text,
					title: dataManager.getMisc('stop button').text
				}
			]
		}
	});

	conv.replier.send();
}

/**
 * Tells user what the correct answers are
 * @param {Object} question
 */
function buildCorrectResponse(question, answers) {
	if (!answers) {
		answers = question.answers;
	}
	let response = '';
	if (answers.length > 1) {
		if (question.mustHave < answers.length) {
			// Multiple answers and user doesn't have to say all of them
			response +=
				'The correct answers could be ' +
				arrayToTextList(answers, 'or') +
				'.';
		} else {
			// Multiple answers and user has to say all of them
			response +=
				'The correct answers are ' +
				arrayToTextList(answers, 'and') +
				'.';
		}
	} else {
		// One answer
		response += 'The correct answer is ' + answers[0] + '.';
	}
	return response;
}

/**
 * Joins array into a list separated by commas and a final string divider
 * ["Orange", "Apple", "Pear"] becomes "Orange, Apple, and Pear"
 * @param {Array} array Array of strings
 * @param {String} lastDivider String to put between last two items in array, 
 * most likely ("and" or "or")
 */
function arrayToTextList(array, lastDivider) {
	if (array.length === 2) {
		return array[0] + ' ' + lastDivider + ' ' + array[1];
	}

	let text = '';
	for (let i = 0; i < array.length; i++) {
		text += array[i];
		if (i < array.length - 2) {
			text += ', ';
		} else if (i === array.length - 2) {
			text += ', ' + lastDivider + ' ';
		}
	}
	return text;
}

/**
 * Gets info about an entity by name
 * @param {Object} conv
 * @param {String} name
 */
function getEntity(conv, name, needsDescription = true) {
	for (let entity of conv.quizData.answers) {
		if (entity.value.toLowerCase() === name.toLowerCase()) {
			// Only entities with descriptions should get made into cards and whatnot
			// This prevents the game from saying "here's more information" when there's not
			if (!needsDescription || entity.shortDescription) {
				return entity;
			}
		}
	}
	return false;
}

/**
 * Gets cards for all answers of a question and puts them in a list
 * @param {Object} conv
 * @param {Object} question
 */
function getListForQuestion(conv, question) {
	let cardReply = {
		list: []
	};
	for (let answer of question.answers) {
		let cardInfo = getCardForEntity(conv, answer);
		cardReply.list.push(cardInfo);
	}
	cardReply.title = 'Possible answers:';

	return cardReply;
}

/**
 * Formats an entity into card format
 * @param {Object} conv
 * @param {*} nameOrEntity string or object
 */
function getCardForEntity(conv, nameOrEntity) {
	let entity = nameOrEntity;
	// If just a name, get the entity
	if (typeof nameOrEntity === 'string') {
		entity = getEntity(conv, nameOrEntity);
	}
	if (!entity || !entity.shortDescription) {
		return false;
	}
	// If the image source doesn't look like a full URL, append the base URL
	if (
		entity.image &&
		(entity.image.indexOf('http://') !== 0 &&
			entity.image.indexOf('https://') !== 0)
	) {
		entity.image = config.IMAGE_URL + entity.image;
	}

	if (
		entity.image_alt &&
		(entity.image_alt.indexOf('http://') !== 0 &&
			entity.image_alt.indexOf('https://') !== 0)
	) {
		entity.image_alt = config.IMAGE_URL + entity.image_alt;
	}

	return {
		title: entity.value,
		image: entity.image,
		image_alt: entity.image_alt,
		text: entity.shortDescription,
	};
}

function setContext(conv, contextName, length, params) {
	if (!length) {
		length = 5;
	}
	return conv.contexts.set(contextName, length, params);
}

function getContext(conv, contextName) {
	return conv.contexts.get(contextName);
}

function deleteContext(conv, contextName) {
	conv.contexts.delete(contextName);
}

function deleteAllContexts(conv) {
	for (let context of Object.values(config.contexts)) {
		deleteContext(conv, context);
	}
}

function shuffle(a) {
	if (!a || a.length === 0) {
		return a;
	}
	var j, x, i;
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
	return a;
}
