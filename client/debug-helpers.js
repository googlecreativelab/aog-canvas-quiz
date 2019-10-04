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

function start() {
	window.game.sendAction({
		qType: 'Easy',
		answerOptions: {
			title: 'How do you want to study?',
			list: [
				{ key: 'Easy', title: 'Easy (Multiple choice)' },
				{ title: 'Hard (Free answer)', key: 'Hard' }
			]
		},
		headline: 'How do you want to study?',
		screenType: 'welcome'
	});
}
function showQuestionMultiple() {
	window.game.sendAction({
		headline: 'This is a question with two answers',
		qType: 'Easy',
		mustHave: '2',
		answerOptions: {
			list: [
				{
					title: 'Option One',
					key: 'Option One',
					card: {
						title: 'Option One',
						text:
							'A card about option one.'
					}
				},
				{
					title: 'Option Two',
					key: 'Option Two',
					correct: true,
					card: {
						moreTitles: ['Option Three']
					}
				},
				{
					title: 'Option Three',
					key: 'Option Three',
					correct: true,
					card: {
						moreTitles: ['Option Two']
					}
				},
				{
					title: 'Option Four',
					key: 'Option Four'
				}
			]
		},
		qNum: 8,
		totalQs: 10,
		score: 0
	});
}
function showQuestion() {
	window.game.sendAction({
		totalQs: 10,
		score: 0,
		qNum: 0,
		headline: 'This is a question',
		answerOptions: {
			list: [
				{
					title: 'Option One',
					key: 'Option One',
					correct: true
				},
				{
					title: 'Option Two',
					key: 'Option Two'
				},
				{ key: 'Option Three', title: 'Option Three' }
			]
		},
		qType: 'Easy'
	});
}
function threeAnswers() {
	window.game.sendAction({
		totalQs: 10,
		score: 0,
		qNum: 0,
		mustHave: '3',
		headline: 'This is a question with three answers',
		answerOptions: {
			list: [
				{
					title: 'One',
					key: 'One'
				},
				{
					title: 'Two',
					key: 'Two'
				},
				{
					key: 'Three',
					title: 'Three'
				},
				{
					title: 'Four',
					key: 'Four'
				},
				{
					title: 'Five',
					key: 'Five'
				},
				{
					title: 'Six',
					key: 'Six'
				}
			]
		},
		qType: 'Easy'
	});
}

function showLongQuestion() {
	window.game.sendAction({
		totalQs: 10,
		score: 0,
		qNum: 0,
		headline:
			"This is a question that is very long. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
		answerOptions: {
			list: [
				{
					title: 'One',
					key: 'One',
					correct: true
				},
				{
					title: 'Two',
					key: 'Two'
				},
				{ key: 'Three', title: 'Three' }
			]
		},
		qType: 'Easy'
	});
}

function correct() {
	window.game.sendAction({
		list: {
			list: [false, false, false, false],
			title: 'Possible answers:'
		},
		result: 'correct',
		nextBtn: 'Next Question',
		score: 1,
		totalQs: 10,
		suggestions: ['Next question'],
		qNum: 0,
		headline: "That's right!",
		correctAnswers: [
			'Answer one',
			'Answer two',
			'Answer three',
			'Answer four'
		]
	});
}
function incorrect() {
	window.game.sendAction( {
		result: 'incorrect',
		nextBtn: 'Next Question',
		score: 1,
		totalQs: 10,
		type: 'retry',
		suggestions: ['Guess again'],
		qNum: 1,
		headline: 'Not quite.',
		options: ['Try again', 'Show me the answer'],
		prompt: 'Not quite. Try again?',
		correctAnswers: ['Answer one', 'answer two', 'answer three']
	});
}
function correctWithMoreAnswers() {
	window.game.sendAction({
		headline: "That's right!",
		qNum: 2,
		correctAnswers: [
			'Answer one',
			'Answer two',
			'Answer three'
		],
		list: {
			list: [
				false,
				false,
				{
					title: 'Answer three',
					text: 'info about answer three'
				}
			],
			title: 'Possible answers:'
		},
		result: 'correct',
		nextBtn: 'Next Question',
		totalQs: 10,
		score: 2,
		suggestions: ['Next question']
	});
}
function showMeTheAnswer() {
	window.game.sendAction({
		result: 'incorrect',
		nextBtn: 'Next Question',
		totalQs: 10,
		score: 2,
		suggestions: ['Next question'],
		qNum: 3,
		headline: 'Not quite.',
		correctAnswers: ['answer one'],
		card: {
			title: 'Answer one',
			text: 'info about answer one'
		}
	});
}

function lastResults() {
	window.game.sendAction( {
		correctAnswers: [
			'Answer one'
		],
		headline: "That's right!",
		result: 'correct',
		nextBtn: 'See My Score',
		card: {
			title: 'Answer one',
			text:
				'Info about answer one.'
		},
		suggestions: ['Yes'],
		qNum: 9,
		totalQs: 10,
		score: 2
	});
}

function hardMode() {
	window.game.sendAction({
		headline: 'This is a free answer question',
		qType: 'Hard',
		answerOptions: {
			list: [
				{
					title: 'Answer one',
					key: 'Answer one'
				},
				{
					title: 'Answer two',
					key: 'Answer two',
					correct: true
				},
				{
					title: 'Answer three',
					key: 'Answer three'
				}
			]
		},
		qNum: 0,
		totalQs: 10,
		score: 0
	});
}

function gameOver() {
	window.game.sendAction({
		answerOptions: {
			title: '',
			list: [
				{ title: 'Try another round', key: 'Try another round' },
				{ title: "I'm done", key: "I'm done" }
			]
		},
		qType: 'Easy',
		results: [
			{
				question: 'Question one',
				userAnswers: [],
				correct: false,
				correctAnswers: ['Answer one']
			},
			{
				question: 'Question two',
				userAnswers: [],
				correct: false,
				correctAnswers: [
					'Answer one',
					'Answer two',
					'Answer three'
				]
			},
			{
				question:
					'Question three',
				userAnswers: [],
				correct: false,
				correctAnswers: [
					'Answer one',
					'Answer two',
					'Answer three'
				]
			},
			{
				correctAnswers: ['Answer one'],
				question: 'Question four',
				userAnswers: [],
				correct: false
			},
			{
				question: 'Question five',
				userAnswers: [],
				correct: false,
				correctAnswers: ['Answer one']
			},
			{
				correct: false,
				correctAnswers: [
					'Answer one'
				],
				question:
					'Question six',
				userAnswers: []
			},
			{
				correct: false,
				correctAnswers: ['Answer one'],
				question: 'Question seven',
				userAnswers: []
			},
			{
				correctAnswers: ['Answer one'],
				question:
					'Question eight',
				userAnswers: [],
				correct: false
			},
			{
				question:
					'Question nine',
				userAnswers: [],
				correct: false,
				correctAnswers: ['Answer one', 'Answer two']
			},
			{
				correctAnswers: ['Answer one'],
				question:
					'Question ten',
				userAnswers: [],
				correct: false
			}
		],
		screenType: 'results',
		score: 8,
		totalQs: 10,
		suggestions: ['Yes'],
		qNum: 10,
		headline: 'You scored 8 out of 10'
	});
}

window.start = start;
window.showQuestion = showQuestion;
window.threeAnswers = threeAnswers;
window.showLongQuestion = showLongQuestion;
window.correct = correct;
window.incorrect = incorrect;
window.correctWithMoreAnswers = correctWithMoreAnswers;
window.showMeTheAnswer = showMeTheAnswer;
window.gameOver = gameOver;
window.showQuestionMultiple = showQuestionMultiple;
window.lastResults = lastResults;
window.hardMode = hardMode;
console.log([
	'start()',
	'showQuestion()',
	'correct()',
	'incorrect()',
	'correctWithMoreAnswers()',
	'showMeTheAnswer()',
	'gameOver()',
	'showQuestionMultiple()',
	'threeAnswers()',
	'lastResults()',
	'hardMode()',
	'showLongQuestion()'
]);
