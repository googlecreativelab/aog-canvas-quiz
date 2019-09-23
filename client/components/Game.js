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

import { LitElement, html, css, unsafeCSS } from 'lit-element';
import * as config from '../config';
import './Home';
import './Question';
import './Results';
import './GameOver';
import './Nav';
import { sharedStyles } from '../shared-styles';

/**
 * Game Element - controls the state of the game.
 * It sends data to various components
 * and handles transitioning between states.
 */
export class Game extends LitElement {
	static get properties() {
		return {
			stateName: { type: String }
		};
	}

	constructor() {
		super();
		this.stateName = 'welcome';
	}

	firstUpdated() {
		this.$container = this.shadowRoot.querySelector('.container');
		this.$home = this.shadowRoot.querySelector('home-element');
		this.$question = this.shadowRoot.querySelector('question-element');
		this.$results = this.shadowRoot.querySelector('results-element');
		this.$gameOver = this.shadowRoot.querySelector('game-over');
		this.$nav = this.shadowRoot.querySelector('nav-element');

		this.$question.getAnswerColor = color => {
			this.getAnswerColor(color);
		};

		this.setHeaderHeight();

		// Set min-height on init and on orientation change
		this.setMinHeight();
		window.addEventListener('resize', () => {
			this.setMinHeight();
		});
	}

	setMinHeight() {
		this.$container.style.minHeight = '0';
		setTimeout(() => {
			this.$container.style.minHeight = `${
				this.$container.offsetHeight
			}px`;
		}, 10);
	}

	// Interactive Canvas has a dynamic header height.
	// This method looks at the current device's Interactive Canvas header,
	// and adds top margin to account for it.
	async setHeaderHeight() {
		const elements = this.shadowRoot.querySelectorAll(
			'.container > *:not(nav-element)'
		);

		// Wait for interactiveCanvas
		while (!!!interactiveCanvas) {
			await new Promise(r => setTimeout(r, 100));
		}

		const height = await interactiveCanvas.getHeaderHeightPx();

		// Set padding for container and height for components
		this.$container.style.paddingTop = `${height}px`;
		elements.forEach(el => {
			el.style.height = `calc(100% - ${height}px)`;
		});
	}

	/**
	 * Updates state based on newState given by AoG
	 * @param {Number(?)} requestId id sent from AoG
	 * @param {Object} newState new state sent from AoG
	 */
	async sendAction(newState) {
		// console.log(requestId, newState);
		// console.log(JSON.stringify(newState));
		// If it's fallback, don't do anything. Just the audio will play.
		if (newState.screenType === 'fallback') {
			console.log('is fallback');
			return;
		}

		if (newState && newState.screenType) {
			this.stateName = newState.screenType;
		} else {
			if (newState.result) {
				this.stateName = 'single-result';
			} else if (typeof newState.qNum === 'number') {
				// On transition from Home to Question
				if (this.stateName === 'welcome') {
					let animateWait = await this.$home.animateOut();
				}
				this.stateName = 'question';
			} else {
				this.stateName = 'prompt';
			}
		}

		// Reset nav overlay on state change
		this.$nav.animateOverlayOut();

		switch (this.stateName) {
			case 'welcome':
				this.$home.state = newState;
				// You can set an alternate layout for returning users
				if (newState.returning) {
					this.$home.animateIn();
				} else {
					this.$home.animateIn();
				}
				this.$home.resetSelectedChoices();
				break;
			case 'question':
				this.$question.resetSelectedChoices();
				this.$question.state = newState;
				break;
			case 'single-result':
				this.$results.animateReset();
				this.$results.state = newState;

				// Show next overlay only on single results
				// screen when answer card is displayed
				this.$nav.next = !(
					newState &&
					newState.options &&
					newState.result === 'incorrect'
				);

				setTimeout(this.animateResults.bind(this), 1);
				break;
			case 'results':
				this.$gameOver.state = newState;
				this.$gameOver.resetSelectedChoices();
				break;
		}

		// These conditions update the navigation properties:
		// the number of questions, current question number,
		// and next button text
		if (newState && newState.totalQs) {
			this.$nav.totalQs = newState.totalQs;
		}
		if (newState && typeof newState.qNum === 'number') {
			this.$nav.qNum = newState.qNum;
		}
		if (newState && newState.nextBtn) {
			this.$nav.nextBtnText = newState.nextBtn;
		}
	}

	async animateResults() {
		// Animate results (i.e. overlay, card clip path effect)
		await this.$results.animateIn();
		// Animate nav bar next question overlay
		this.$nav.animateOverlayIn();
	}

	getAnswerColor(color) {
		this.$results.cardColor = color;
	}

	render() {
		return html`
			${sharedStyles}
			<div class="container ${this.stateName}">
				<home-element></home-element>
				<question-element></question-element>
				<results-element></results-element>
				<game-over></game-over>
				<nav-element></nav-element>
			</div>
		`;
	}

	static get styles() {
		return css`
			:host {
				background-color: ${unsafeCSS(
					config.style.main.backgroundColor
				)};
				display: block;
				height: 100%;
				width: 100%;
				position: relative;
			}

			.container {
				position: relative;
				height: 100%;
				width: 100%;
			}

			home-element,
			question-element,
			results-element,
			game-over {
				position: absolute;
				height: 100%;
				width: 100%;
			}

			home-element,
			results-element,
			game-over {
				transition: transform 0.5s ease-out;
			}

			home-element {
				transform: translateX(-100vw);
			}
			question-element {
				transform: translateX(0vw);
			}
			results-element {
				transform: translateY(100vh);
			}
			game-over {
				transform: translateY(100vh);
			}
			.container.welcome home-element {
				transform: translateX(0vw);
			}
			.container.welcome question-element {
				transform: translateX(100vw);
			}
			.container.single-result results-element {
				transform: translateY(0);
			}
			.container.results game-over {
				transform: translateY(0);
			}

			nav-element {
				position: absolute;
				bottom: 0;
				left: 0;
				z-index: 1;
			}

			.container.welcome nav-element,
			.container.results nav-element {
				display: none;
			}
		`;
	}
}

customElements.define('game-element', Game);
