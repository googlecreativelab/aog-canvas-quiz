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

const config = {
	style: {},
	mode: {}
};

config.style.h1 = {
	color: '#202124',
	fontSize: 36,
	fontWeight: 700,
	fontFamily: "'Titillium Web', sans-serif",
	fontStyle: null,
	lineHeight: 1.08,
	textAlign: 'center',
	textDecoration: null
};

config.style.h2 = {
	color: '#202124',
	fontSize: 24,
	fontWeight: 700,
	fontFamily: "'Titillium Web', sans-serif",
	fontStyle: null,
	lineHeight: 1.08,
	textAlign: 'center',
	textDecoration: null
};

config.style.h3 = {
	color: '#202124',
	fontSize: 20,
	fontWeight: 700,
	fontFamily: "'Titillium Web', sans-serif",
	fontStyle: null,
	lineHeight: 1.08,
	textAlign: 'center',
	textDecoration: null
};

config.style.paragraph = {
	color: '#202124',
	fontSize: 18,
	fontWeight: 400,
	fontFamily: "'Titillium Web', sans-serif",
	fontStyle: null,
	lineHeight: 1.08,
	textAlign: 'center',
	textDecoration: null
};

config.style.main = {
	backgroundColor: '#BDC1C6'
};

config.style.home = {
	backgroundColor: '#DADCE0',
	h1: {
		color: null,
		fontSize: [36, 48],
		fontWeight: null,
		fontFamily: "'Titillium Web', sans-serif",
		fontStyle: null,
		lineHeight: null,
		textAlign: null,
		textDecoration: null
	}
};

config.style.question = {
	backgroundColor: '#DADCE0',
	h1: {
		color: null,
		fontSize: [26, 30, 34],
		fontWeight: null,
		fontFamily: null,
		fontStyle: null,
		lineHeight: null,
		textAlign: null,
		textDecoration: null
	}
};

config.style.results = {
	color: '#202124',
	backgroundColor: {
		correct: '#DADCE0',
		incorrect: '#BDC1C6',
		overlay: '#BDC1C6'
	},
	statusBtns: {
		padding: '20px 30px',
		color: '#202124',
		backgroundColor: 'transparent',
		backgroundColorSelected: '#BDC1C6',
		fontSize: 18,
		fontWeight: 400,
		fontFamily: "'Titillium Web', sans-serif",
		shadow: null,
		border: '1px solid #202124',
		borderRadius: 30
	},
	infoBubble: {
		backgroundColor: '#FFF',
		borderRadius: 30,
		shadow: 'drop-shadow(rgba(0, 0, 0, 0.3) 5px 5px 15px)',
		// Override styles
		h3: {
			color: null,
			fontSize: null,
			fontWeight: null,
			fontFamily: null,
			fontStyle: null,
			lineHeight: null,
			textAlign: null,
			textDecoration: null
		},
		paragraph: {
			color: '#000',
			fontSize: null,
			fontWeight: null,
			fontFamily: null,
			fontStyle: null,
			lineHeight: null,
			textAlign: 'left',
			textDecoration: null
		}
	}
};

config.style.answerBtns = {
	padding: '0 10px',
	backgroundColor: '#FFF',
	backgroundColorSelected: '#d2d2d2',
	shadow: 'rgba(0, 0, 0, 0.3) 5px 5px 15px',
	borderRadius: 30,
	h3: {
		color: ['#4394E0', '#319E82', '#EA5454'],
		fontSize: 20,
		fontWeight: 700,
		fontFamily: "'Titillium Web', sans-serif",
		fontStyle: null,
		lineHeight: null,
		textAlign: null,
		textDecoration: null
	}
};

config.style.nav = {
	overlayBackground: '#FFFFFF',
	activeBackground: '#BDC1C6',
	icons: {
		arrow: '#202124'
	},
	// Override styles
	h3: {
		color: '#202124',
		fontSize: null,
		fontWeight: null,
		fontFamily: null,
		fontStyle: null,
		lineHeight: null,
		textAlign: null,
		textDecoration: null
	},
	paragraph: {
		color: null,
		fontSize: null,
		fontWeight: null,
		fontFamily: "'Titillium Web', sans-serif",
		fontStyle: null,
		lineHeight: null,
		textAlign: null,
		textDecoration: null
	}
};

config.style.gameOver = {
	backgroundColor: '#BDC1C6',
	color: '#202124',
	icons: {
		correct: '#319E82',
		incorrect: '#EA5454',
		arrow: '#202124'
	},
	h1: {
		color: null,
		fontSize: null,
		fontWeight: null,
		fontFamily: null,
		fontStyle: null,
		lineHeight: null,
		textAlign: null,
		textDecoration: null
	},
	h3: {
		color: null,
		fontSize: null,
		fontWeight: null,
		fontFamily: null,
		fontStyle: null,
		lineHeight: 1.34,
		textAlign: null,
		textDecoration: null
	},
	paragraph: {
		question: {
			color: null,
			fontSize: null,
			fontWeight: 700,
			fontFamily: null,
			fontStyle: null,
			lineHeight: 1.34,
			textAlign: 'left',
			textDecoration: null
		},
		header: {
			color: null,
			fontSize: null,
			fontWeight: 700,
			fontFamily: null,
			fontStyle: 'italic',
			lineHeight: 1.34,
			textAlign: 'left',
			textDecoration: null
		},
		answer: {
			correct: {
				color: null,
				fontSize: null,
				fontWeight: null,
				fontFamily: null,
				fontStyle: null,
				lineHeight: 1.34,
				textAlign: 'left',
				textDecoration: null
			},
			incorrect: {
				color: null,
				fontSize: null,
				fontWeight: null,
				fontFamily: null,
				fontStyle: null,
				lineHeight: 1.34,
				textAlign: 'left',
				textDecoration: 'line-through'
			}
		}
	}
};

module.exports = config;
