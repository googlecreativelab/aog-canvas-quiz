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
		headline: 'What are two rights in the Declaration of Independence?',
		qType: 'Easy',
		mustHave: '2',
		answerOptions: {
			list: [
				{
					title: 'The Right to Bear Arms',
					key: 'The Right to Bear Arms',
					card: {
						title: 'The right to bear arms',
						text:
							'The Second Amendment to the United States Constitution protects an individual right to keep and bear arms.',
						link: {
							title: 'Search on Google',
							url:
								'https://www.google.com/search?q=second+amendment'
						}
					}
				},
				{
					title: 'Life',
					key: 'Life',
					correct: true,
					card: {
						moreTitles: ['Liberty', 'The pursuit of happiness']
					}
				},
				{
					title: 'Liberty',
					key: 'Liberty',
					correct: true,
					card: {
						moreTitles: ['Life', 'The pursuit of happiness']
					}
				},
				{
					title: 'Press',
					key: 'Press'
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
		headline: 'Name one war fought by the United States in the 1800s.',
		answerOptions: {
			list: [
				{
					title: 'Spanish-American War',
					key: 'Spanish-American War',
					correct: true,
					card: {
						moreTitles: [
							'Mexican-American War',
							'Civil War',
							'War of 1812'
						]
					}
				},
				{
					title: 'The Revolutionary War',
					key: 'the Revolutionary War'
				},
				{ key: 'World War I', title: 'World War I' }
			]
		},
		qType: 'Easy'
	});
}
function showQuestion6() {
	window.game.sendAction({
		totalQs: 10,
		score: 0,
		qNum: 0,
		mustHave: '3',
		headline: 'Name three of the original thirteen colonies:',
		answerOptions: {
			list: [
				{
					title: 'Texas',
					key: 'Texas'
				},
				{
					title: 'New Jersey',
					key: 'New Jersey'
				},
				{
					key: 'West Virginia',
					title: 'West Virginia'
				},
				{
					title: 'Ohio',
					key: 'Ohio'
				},
				{
					title: 'Rhode Island',
					key: 'Rhode Island'
				},
				{
					title: 'Georgia',
					key: 'Georgia'
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
			"Lorem Ipsum is simply dummy text. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
		answerOptions: {
			list: [
				{
					title: 'Spanish-American War',
					key: 'Spanish-American War',
					correct: true,
					card: {
						moreTitles: [
							'Mexican-American War',
							'Civil War',
							'War of 1812'
						]
					}
				},
				{
					title: 'The Revolutionary War',
					key: 'the Revolutionary War'
				},
				{ key: 'World War I', title: 'World War I' }
			]
		},
		qType: 'Easy'
	});
}

function showQuestionWithTallImage() {
	window.game.sendAction({
		totalQs: 10,
		score: 1,
		suggestions: ['Next question'],
		headline: "That's right!",
		qNum: 0,
		card: {
			title: 'The Constitution',
			image:
				'https://civicstest-dev.firebaseapp.com/images/constitution.jpeg',
			text:
				'The United States Constitution is the supreme law of the United States.',
			link: {
				url:
					'https://www.google.com/search?q=United+States+Constitution',
				title: 'Search on Google'
			}
		},
		correctAnswers: ['The Constitution'],
		result: 'correct',
		nextBtn: 'Next Question'
	});
}

function showQuestionWithShortImage() {
	window.game.sendAction({
		card: {
			title: 'We the people',
			image:
				'https://upload.wikimedia.org/wikipedia/commons/0/0d/Constitution_We_the_People.jpg',
			text:
				'"We the people" are the first three words of the United States Constitution.',
			link: {
				url:
					'https://www.google.com/search?q=United+States+Constitution',
				title: 'Search on Google'
			}
		},
		correctAnswers: ['We the people'],
		result: 'correct',
		nextBtn: 'Next Question',
		totalQs: 10,
		score: 3,
		suggestions: ['Next question'],
		qNum: 2,
		headline: "That's right!"
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
			'Spanish-American War',
			'Mexican-American War',
			'Civil War',
			'War of 1812'
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
		correctAnswers: ['slavery', 'economic reasons', 'states’ rights']
	});
}
function correctWithMoreAnswers() {
	window.game.sendAction({
		headline: "That's right!",
		qNum: 2,
		correctAnswers: [
			'saved the Union',
			'led the United States during the Civil War',
			'freed the slaves'
		],
		list: {
			list: [
				false,
				false,
				{
					link: {
						url: 'https://google.com/search?q=Freed the slaves',
						title: 'Search on Google'
					},
					title: 'Freed the slaves',
					text: 'info about emancipation proclamation'
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
		correctAnswers: ['freed the slaves'],
		card: {
			link: {
				url: 'https://google.com/search?q=Freed the slaves',
				title: 'Search on Google'
			},
			title: 'Freed the slaves',
			text: 'info about emancipation proclamation'
		}
	});
}

function lastResults() {
	window.game.sendAction( {
		correctAnswers: [
			'You can practice any religion, or not practice a religion'
		],
		headline: "That's right!",
		result: 'correct',
		nextBtn: 'See My Score',
		card: {
			title: 'You can practice any religion, or not practice a religion',
			text:
				'Freedom of religion means you can practice any religion, or not practice a religion.',
			link: {
				title: 'Search on Google',
				url:
					'https://www.google.com/search?ei=Xzh0XNH7Hqbb5gLZ77HAAw&q=freedom+of+religon'
			}
		},
		suggestions: ['Yes'],
		qNum: 9,
		totalQs: 10,
		score: 2
	});
}

function hardMode() {
	window.game.sendAction({
		headline: 'What is the supreme law of the land?',
		qType: 'Hard',
		answerOptions: {
			list: [
				{
					title: 'The Declaration of Independence',
					key: 'The Declaration of Independence'
				},
				{
					title: 'The Constitution',
					key: 'The Constitution',
					card: {
						title: 'The Constitution',
						image:
							'https://civicstest-dev.firebaseapp.com/images/constitution.jpeg',
						image_alt:
							'https://civicstest-dev.firebaseapp.com/images/alt_image_here',
						text:
							'The United States Constitution is the supreme law of the United States.',
						link: {
							title: 'Search on Google',
							url:
								'https://www.google.com/search?q=United+States+Constitution'
						}
					},
					correct: true
				},
				{
					title: 'The Bill of Rights',
					key: 'The Bill of Rights',
					card: {
						title: 'The Bill of Rights',
						image:
							'https://t1.gstatic.com/images?q=tbn:ANd9GcQbUwnk99-0EsYdWBUTjR_0zoE6ZD7vlW3ZvFY72nPmoJlfTKFv',
						text:
							'The Bill of Rights in the United States is the first ten amendments to the United States Constitution.',
						link: {
							title: 'Search on Google',
							url:
								'https://www.google.com/search?ei=Ljh0XI6ME9G05gLP3YrQBg&q=the+bill+of+rights'
						}
					}
				}
			]
		},
		terms: [
			{
				term: 'Supreme law',
				definition:
					'Supreme law means the laws that are the most powerful in a country. They overule state and local laws.',
				url: 'https://www.google.com/search?q=undefined'
			}
		],
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
				question: 'Name the U.S. war between the North and the South.',
				userAnswers: [],
				correct: false,
				correctAnswers: ['The Civil War']
			},
			{
				question: 'Name one problem that led to the Civil War.',
				userAnswers: [],
				correct: false,
				correctAnswers: [
					'slavery',
					'economic reasons',
					'states’ rights'
				]
			},
			{
				question:
					'What was one important thing that Abraham Lincoln did?',
				userAnswers: [],
				correct: false,
				correctAnswers: [
					'freed the slaves',
					'saved the Union',
					'led the United States during the Civil War'
				]
			},
			{
				correctAnswers: ['freed the slaves'],
				question: 'What did the Emancipation Proclamation do?',
				userAnswers: [],
				correct: false
			},
			{
				question: 'What did Susan B. Anthony do?',
				userAnswers: [],
				correct: false,
				correctAnswers: ['fought for women’s rights']
			},
			{
				correct: false,
				correctAnswers: [
					'World War I',
					'World War II',
					'Korean War',
					'Vietnam War',
					'Gulf War'
				],
				question:
					'Name one war fought by the United States in the 1900s.',
				userAnswers: []
			},
			{
				correct: false,
				correctAnswers: ['Woodrow Wilson'],
				question: 'Who was President during World War I?',
				userAnswers: []
			},
			{
				correctAnswers: ['Franklin Roosevelt'],
				question:
					'Who was President during the Great Depression and World War II?',
				userAnswers: [],
				correct: false
			},
			{
				question:
					'Who did the United States fight in World War II? Pick three.',
				userAnswers: [],
				correct: false,
				correctAnswers: ['Japan', 'Germany', 'Italy']
			},
			{
				correctAnswers: ['World War II'],
				question:
					'Before he was President, Eisenhower was a general. What war was he in?',
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
window.showQuestion6 = showQuestion6;
window.showLongQuestion = showLongQuestion;
window.correct = correct;
window.incorrect = incorrect;
window.correctWithMoreAnswers = correctWithMoreAnswers;
window.showMeTheAnswer = showMeTheAnswer;
window.gameOver = gameOver;
window.showQuestionWithShortImage = showQuestionWithShortImage;
window.showQuestionWithTallImage = showQuestionWithTallImage;
window.showQuestionMultiple = showQuestionMultiple;
window.lastResults = lastResults;
window.hardMode = hardMode;
console.log([
	'start()',
	'showQuestion()',
	'showQuestion6()',
	'showQuestionWithTallImage()',
	'showQuestionWithShortImage()',
	'correct()',
	'incorrect()',
	'correctWithMoreAnswers()',
	'showMeTheAnswer()',
	'gameOver()',
	'showQuestionMultiple()',
	'lastResults()',
	'hardMode()',
	'showLongQuestion()'
]);
