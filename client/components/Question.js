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
import './Choices';
import { sharedStyles } from '../shared-styles';
import { TimelineMax } from 'gsap';
import * as config from '../config';

/**
 * This is a group of choice buttons
 */
export class Question extends LitElement {
	static get properties() {
		return {
			state: { type: Object },
			title: { type: String },
			getAnswerColor: { type: Function }
		};
	}

	constructor() {
		super();
		this.answers = [];
		this.qType = '';
		this.mustHave = '';
		this.tlQuestion = new TimelineMax();
	}

	updated() {
		this.$choices = this.shadowRoot.querySelector('choices-element');
		this.$titleSpans = this.shadowRoot.querySelectorAll('h1.question span');
		this.animateIn();

		this.$choices.getAnswerColor = color => {
			this.getAnswerColor(color);
		};
	}

	animateIn() {
		this.tlQuestion
			.call(() => {
				this.$choices.animateHide(true);
			})
			.staggerFromTo(
				this.$titleSpans,
				0.8,
				{
					scale: 0
				},
				{
					scale: 1,
					ease: Elastic.easeOut.config(1, 0.8)
				},
				0.1
			)
			.call(() => {
				this.$choices.animateIn(true);
			});
	}

	set state(state) {
		this.$choices = this.shadowRoot.querySelector('choices-element');
		this._state = state;
		this.qType = this._state.qType;

		if (
			this._state.answerOptions &&
			this._state.answerOptions.list &&
			this.qType === 'Easy'
		) {
			this.answers = this._state.answerOptions.list;
			this.$choices.answers = this.answers;
		}
		if (this._state.mustHave) {
			this.mustHave = this._state.mustHave;
			this.$choices.mustHave = parseInt(this.mustHave);
		} else {
			this.mustHave = 1;
			this.$choices.mustHave = this.mustHave;
		}
		if (this._state.headline) {
			this.title = this._state.headline;
		}
	}

	get state() {
		return this._state;
	}

	// Wraps each word with spans
	formatTitle(title) {
		if (title) {
			return title.split(' ').map(
				word =>
					html`
						<span>${word}</span>
					`
			);
		}
	}

	resetSelectedChoices() {
		this.$choices.resetSelectedChoices();
	}

	render() {
		return html`
			${sharedStyles}
			<div
				class="component-container questions-container--${this.qType ===
				'Easy'
					? 'top'
					: 'center'}"
			>
				<h1 class="question">${this.formatTitle(this.title)}</h1>
				<div
					class="choices-container"
					style="display: ${this.qType === 'Easy' ? 'block' : 'none'}"
				>
					<choices-element></choices-element>
				</div>
			</div>
		`;
	}

	static get styles() {
		return css`
			:host {
				background-color: ${unsafeCSS(
					config.style.question.backgroundColor
				)};
				padding: 0 20px;
			}

			.questions-container--top {
				display: flex;
				flex-direction: column;
				padding-top: 55px;
				padding-bottom: 70px;
			}

			.questions-container--center {
				display: flex;
				justify-content: center;
				align-items: center;
			}

			h1.question {
				margin: 0;
				padding: 0 15px;

				${unsafeCSS(
					!!config.style.question.h1.color
						? `color: ${config.style.question.h1.color}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.question.h1.fontFamily
						? `font-family: ${config.style.question.h1.fontFamily}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.question.h1.fontWeight
						? `font-weight: ${config.style.question.h1.fontWeight}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.question.h1.fontStyle
						? `font-style: ${config.style.question.h1.fontStyle}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.question.h1.lineHeight
						? `line-height: ${config.style.question.h1.lineHeight}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.question.h1.textAlign
						? `text-align: ${config.style.question.h1.textAlign}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.question.h1.textDecoration
						? `text-decoration: ${
								config.style.question.h1.textDecoration
						  }`
						: ''
				)};
			}

			h1.question span {
				display: inline-block;
			}

			.choices-container {
				flex: 1 1 0;
			}

			@media all and (orientation: portrait) {
				h1.question {
					${unsafeCSS(
						!!config.style.question.h1.fontSize[1]
							? `font-size: ${
									config.style.question.h1.fontSize[1]
							  }px`
							: ''
					)};
				}
			}

			@media all and (orientation: landscape) {
				h1.question {
					${unsafeCSS(
						!!config.style.question.h1.fontSize[2]
							? `font-size: ${
									config.style.question.h1.fontSize[2]
							  }px`
							: ''
					)};
				}
			}

			@media all and (orientation: portrait) and (max-width: 410px),
				all and (orientation: landscape) and (max-height: 500px) {
				.questions-container--top {
					padding-top: 35px;
				}

				h1.question {
					${unsafeCSS(
						!!config.style.question.h1.fontSize[1]
							? `font-size: ${
									config.style.question.h1.fontSize[1]
							  }px`
							: ''
					)};
				}
			}

			@media all and (orientation: portrait) and (max-width: 330px),
				all and (orientation: landscape) and (max-height: 390px) {
				.questions-container--top {
					padding-top: 15px;
				}

				h1.question {
					${unsafeCSS(
						!!config.style.question.h1.fontSize[0]
							? `font-size: ${
									config.style.question.h1.fontSize[0]
							  }px`
							: ''
					)};
				}
			}
		`;
	}
}

customElements.define('question-element', Question);
