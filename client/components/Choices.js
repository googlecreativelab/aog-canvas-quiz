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
import { sharedStyles } from '../shared-styles';
import { TweenMax } from 'gsap';
import * as config from '../config';
/**
 * This is a group of choice buttons
 */
export class Choices extends LitElement {
	static get properties() {
		return {
			answers: { type: Array },
			mustHave: { type: Number },
			optionsStart: { type: Boolean },
			optionsGameOver: { type: Boolean },
			getAnswerColor: { type: Function }
		};
	}

	constructor() {
		super();
		this.answers = [];
		this.mustHave = 1;
		this.optionsStart = false;
		this.optionsGameOver = false;
		this.getAnswerColor = null;
		this.selectedChoices = [];
		this.answerColors = config.style.answerBtns.h3.color;
	}

	firstUpdated() {
		this.$prompt = this.shadowRoot.querySelector('.multiple-prompt');
		this.$promptAmount = this.shadowRoot.querySelector('.prompt-amount');
		this.$promptType = this.shadowRoot.querySelector('.prompt-type');
	}

	updated() {
		this.$buttons = this.shadowRoot.querySelectorAll('button.choice-btn');
		this.updatePrompt();
	}

	// Unstaggered animation by default
	animateIn(stagger = false) {
		if (stagger) {
			TweenMax.staggerFromTo(
				this.$buttons,
				0.5,
				{ scale: 0, transformOrigin: 'center center' },
				{
					scale: 1,
					transformOrigin: 'right top',
					ease: Power4.easeOut
				},
				0.2
			);
		} else {
			TweenMax.fromTo(
				this.$buttons,
				0.25,
				{ scale: 0, transformOrigin: 'center center' },
				{
					scale: 1,
					transformOrigin: 'center center',
					ease: Power4.easeOut
				}
			);
		}
	}

	animateHide() {
		TweenMax.to(this.$buttons, 0, {
			scale: 0
		});
	}

	animateClick(target) {
		TweenMax.to(target, 0.3, {
			scale: 0.85,
			transformOrigin: 'center center',
			ease: Back.easeInOut.config(1.1),
			repeat: 1,
			yoyo: true
		});
	}

	choiceSelectedHandler(e) {
		let choice = e.currentTarget;

		let choiceText = choice.getAttribute('aria-label');

		// Sends color of selected button text to
		// style header color in Results component
		// unless Choices is being used from Home or
		// Game Over components or function is not
		// provided
		if (
			!(this.optionsStart || this.optionsGameOver) &&
			this.getAnswerColor
		) {
			let choiceColor = choice.style.color;
			this.getAnswerColor(choiceColor);
		}

		// Already selected, unselect choice
		if (this.selectedChoices.includes(choiceText)) {
			this.animateClick(choice);
			choice.classList.remove('selected');
			this.selectedChoices = this.selectedChoices.filter(
				a => a !== choiceText
			);
		}
		// Select an additional choice
		else if (this.selectedChoices.length < this.mustHave) {
			this.animateClick(choice);
			choice.classList.add('selected');
			this.selectedChoices.push(e.currentTarget.innerText);
		}
		// Otherwise, do nothing
		else {
			return;
		}

		this.updatePrompt();

		let submitDelay = this.mustHave === 1 ? 0 : this.mustHave * 500;
		if (this.selectedChoices.length === this.mustHave) {
			setTimeout(this.submitAnswer.bind(this), submitDelay);
		}
	}

	submitAnswer() {
		// Check again in case an answer was unselected
		if (this.selectedChoices.length === this.mustHave) {
			assistantCanvas.sendTextQuery(this.selectedChoices.join(' AND '));
		}
	}

	resetSelectedChoices() {
		// Reset selected choices array
		this.selectedChoices = [];
		// Remove selected class
		this.$buttons.forEach(button => {
			if (button && button.classList) {
				button.classList.remove('selected');
			}
		});
	}

	getTitle(title) {
		// Format difficulty buttons
		let mainTitle = this.optionsStart
			? title.substr(0, title.indexOf(' '))
			: title;
		let subTitle = this.optionsStart
			? title.substr(title.indexOf(' ') + 1)
			: '';

		return html`
			<h3 class="choice__title">
				${mainTitle}
			</h3>
			${subTitle
				? html`
						<p class="choice__subtitle">${subTitle}</p>
				  `
				: ``}
		`;
	}

	animatePrompt(show) {
		TweenMax.to(this.$prompt, 0.15, {
			autoAlpha: show ? 1 : 0,
			delay: show ? 0.6 : 0,
			ease: Power3.easeInOut
		});
	}

	updatePrompt() {
		// Update prompt unless component is
		// for start options or game over
		if (!this.optionsStart && !this.optionsGameOver) {
			let remaining = this.mustHave - this.selectedChoices.length;
			if (this.mustHave > 1 && remaining > 0) {
				this.animatePrompt(true);
				this.$promptAmount.innerText = this.formatPrompt(remaining);
				this.$promptType.innerText =
					remaining === this.mustHave ? 'choices' : 'more';
			} else {
				this.animatePrompt(false);
			}
		}
	}

	formatPrompt(num) {
		if (num == null) {
			return 'one';
		}

		switch (num) {
			case 1:
				return 'one';
			case 2:
				return 'two';
			case 3:
				return 'three';
			case 4:
				return 'four';
			case 5:
				return 'five';
			case 6:
				return 'six';
			default:
				return num;
		}
	}

	initEventListeners() {
		this.$buttons = this.shadowRoot.querySelectorAll('button.choice-btn');

		this.$buttons.forEach(button => {
			button.addEventListener('focusin', e => {
				e.target.classList.add('selected');
			});

			button.addEventListener('focusout', e => {
				// Remove highlight unless it is already selected
				if (!this.selectedChoices.includes(e.target.innerText)) {
					e.target.classList.remove('selected');
				}
			});
		});
	}

	render() {
		setTimeout(this.initEventListeners.bind(this), 1);

		let listClass;

		if (this.optionsStart) {
			listClass = 'choices--opt';
		} else if (this.optionsGameOver) {
			listClass = 'choices--game-over';
		} else if (this.answers.length > 4) {
			listClass = 'choices--gt4';
		} else {
			listClass = 'choices--lte4';
		}

		return html`
			${sharedStyles}
			<div
				class="choices-container ${this.optionsGameOver
					? 'choices-container--game-over'
					: ''}"
			>
				${!this.optionsStart && !this.optionsGameOver
					? html`
							<p class="multiple-prompt multiple-prompt--hidden">
								<span>Select</span>
								<span class="prompt-amount"> </span>
								<span class="prompt-type">
									choices
								</span>
							</p>
					  `
					: ''}
				<ul id="choices" class="${listClass}">
					${this.answers.map((choice, i) => {
						let textColor = this.optionsStart
							? '#14af8c'
							: this.answerColors[i % this.answerColors.length];
						return html`
							<li>
								<button
									class="choice-btn"
									@click=${this.choiceSelectedHandler}
									aria-label=${choice.title}
									style="color: ${textColor}"
								>
									${this.getTitle(choice.title)}
								</button>
							</li>
						`;
					})}
				</ul>
			</div>
		`;
	}

	static get styles() {
		return css`
			.choices-container {
				height: 100%;
				display: flex;
				flex-direction: column;
			}

			.choices-container--game-over {
				height: auto;
			}

			.multiple-prompt {
				font-style: italic;
				text-align: center;
				color: ${unsafeCSS(config.style.h1.color)};
				margin: 10px 0px 15px;
				transition: all 0.5s linear;
				opacity: 0;
			}

			ul {
				flex: 1 1 0;
				display: flex;
				flex-flow: row wrap;
			}

			ul.choices--game-over {
				flex-flow: column nowrap;
				max-height: none;
			}

			li {
				display: block;
			}

			ul.choices--opt > li {
				flex: 1 1 50%;
			}

			ul.choices--game-over > li {
				height: 75px;
			}

			button.choice-btn {
				width: 100%;
				height: 100%;
				border: 5px solid
					${unsafeCSS(config.style.answerBtns.backgroundColor)};
				border-radius: ${unsafeCSS(
					config.style.answerBtns.borderRadius
				)}px;
				background-color: ${unsafeCSS(
					config.style.answerBtns.backgroundColor
				)};
				box-shadow: ${unsafeCSS(config.style.answerBtns.shadow)};
				padding: ${unsafeCSS(config.style.answerBtns.padding)};
				text-align: center;
				transition: 0.1s background-color ease;
				transform: scale(0);
			}

			button.choice-btn h3 {
				color: inherit;
				${unsafeCSS(
					!!config.style.answerBtns.h3.fontSize
						? `font-size: ${config.style.answerBtns.h3.fontSize}px`
						: ''
				)};
				${unsafeCSS(
					!!config.style.answerBtns.h3.fontWeight
						? `font-weight: ${
								config.style.answerBtns.h3.fontWeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.answerBtns.h3.fontFamily
						? `font-family: ${
								config.style.answerBtns.h3.fontFamily
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.answerBtns.h3.fontStyle
						? `font-style: ${config.style.answerBtns.h3.fontStyle}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.answerBtns.h3.lineHeight
						? `line-height: ${
								config.style.answerBtns.h3.lineHeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.answerBtns.h3.textAlign
						? `text-align: ${config.style.answerBtns.h3.textAlign}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.answerBtns.h3.textDecoration
						? `text-decoration: ${
								config.style.answerBtns.h3.textDecoration
						  }`
						: ''
				)};
			}

			button.choice-btn.selected {
				background-color: ${unsafeCSS(
					config.style.answerBtns.backgroundColorSelected
				)};
			}

			.choice__title,
			.choice__subtitle {
				margin: 0;
			}

			.choice__subtitle {
				color: ${unsafeCSS(config.style.h1.color)};
			}

			@media all and (orientation: portrait) {
				ul {
					align-items: stretch;
					flex: 1 1 0;
					margin: -10px;
				}

				ul.choices--lte4 {
					flex-flow: column nowrap;
				}

				ul.choices--gt4 {
					max-height: 300px;
				}

				li {
					height: 100%;
					max-height: 75px;
					margin: 10px;
				}

				ul.choices--lte4 > li {
					flex: 1 1 calc(100% - 20px);
				}

				ul.choices--gt4 > li {
					flex: 0 1 calc(50% - 20px);
				}

				ul.choices--opt > li {
					flex: 0 1 calc(50% - 20px);
					height: 75px;
				}
			}

			@media all and (orientation: landscape) {
				ul {
					justify-content: center;
					margin: auto -5px;
					max-height: 160px;
				}

				li {
					max-height: 70px;
					margin: 5px;
				}

				ul.choices--opt {
					width: 100%;
					max-width: 550px;
					margin: 0 auto;
				}

				ul.choices--lte4 > li {
					flex: 0 1 calc(50% - 10px);
				}

				ul.choices--gt4 > li {
					flex: 0 1 calc(33% - 10px);
				}

				ul.choices--opt > li {
					max-width: 160px;
					height: 60px;
				}
			}

			@media all and (orientation: portrait) and (max-width: 330px),
				all and (orientation: landscape) and (max-height: 390px) {
				.multiple-prompt {
					margin: 5px 0;
				}

				ul.choices--game-over > li {
					height: 50px;
				}
			}
		`;
	}
}

customElements.define('choices-element', Choices);
