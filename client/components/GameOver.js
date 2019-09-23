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
import { TimelineMax } from 'gsap';
import * as config from '../config';

/**
 * Game Over element - shows the user's score
 * and gives them a summary of all of the questions
 * that were asked.
 */
export class GameOver extends LitElement {
	static get properties() {
		return {
			state: { type: Object },
			title: { type: String },
			answers: { type: Array },
			score: { type: Number },
			totalQs: { type: Number },
			results: { type: Array }
		};
	}

	constructor() {
		super();
		this.answers = [];
		this.results = [];
	}

	set state(state) {
		this._state = state;
		if (this._state.answerOptions && this._state.answerOptions.list) {
			this.answers = this._state.answerOptions.list;
			this.score = this._state.score;
			this.totalQs = this._state.totalQs;
			this.results = this._state.results;
		}
		if (this._state.headline) {
			this.title = this._state.headline;
		}
	}

	get state() {
		return this._state;
	}

	firstUpdated() {
		this.$ctaButton = this.shadowRoot.querySelector('.cta-button');
		this.$choices = this.shadowRoot.querySelector('choices-element');
		this.$resultsContainer = this.shadowRoot.querySelector(
			'#resultsContainer'
		);
		this.$arrow = this.shadowRoot.querySelector('#arrowCTA');
		this.$resultsList = this.shadowRoot.querySelector('.review-list');

		this.tlGameOver = new TimelineMax();

		this.initScrollListener();
	}

	updated() {
		this.animateIn();
	}

	resetSelectedChoices() {
		let $choices = this.shadowRoot.querySelector(
			'choices-element'
		);
		$choices.resetSelectedChoices();
	}

	animateIn() {
		this.tlGameOver
			.add('start')
			.call(
				() => {
					this.animateReset();
				},
				null,
				null,
				'start'
			)
			.call(
				() => {
					this.$choices.animateIn();
				},
				null,
				null,
				'start+=0.4'
			)
			.fromTo(
				this.$ctaButton,
				0.5,
				{ scale: 0, transformOrigin: 'center center' },
				{
					scale: 1,
					transformOrigin: 'center center',
					ease: Elastic.easeOut.config(1, 1)
				},
				'start+=0.8'
			);
	}

	animateReset() {
		if (this.$choices) {
			this.$choices.animateHide();
		}
		if (this.$ctaButton) {
			TweenMax.to(this.$ctaButton, 0, { scale: 0 });
		}
	}

	initScrollListener() {
		if (this.$resultsContainer) {
			// How far down the user scrolls before the arrow fades out
			let fadeThreshold = 40;

			this.$resultsContainer.addEventListener('scroll', () => {
				let scrollTop = this.$resultsContainer.scrollTop;

				if (scrollTop > fadeThreshold) {
					this.$arrow.classList.add('hidden');
				} else {
					this.$arrow.classList.remove('hidden');
				}
			});
		}
	}

	scrollToReview() {
		this.$resultsContainer.scrollTo({
			top: this.$resultsList.offsetTop,
			behavior: 'smooth'
		});
	}

	renderArrow() {
		return html`
			<div id="arrowCTA" class="svg-wrap arrow-icon-wrap">
				<?xml version="1.0" encoding="utf-8"?>
				<svg
					version="1.1"
					id="Layer_1"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					x="0px"
					y="0px"
					viewBox="0 0 29 47"
					style="enable-background:new 0 0 29 47;"
					xml:space="preserve"
				>
					<polyline
						id="Path-2-Copy"
						class="st0"
						points="25,43 7,23.3 25,4 "
					/>
				</svg>
			</div>
		`;
	}

	renderStatusIcon(status) {
		return html`
			<div
				class="svg-wrap status-icon-wrap status-icon-wrap--${status
					? 'correct'
					: 'incorrect'}"
			>
				${status
					? html`
							<?xml version="1.0" encoding="utf-8"?>
							<svg
								version="1.1"
								id="Layer_1"
								xmlns="http://www.w3.org/2000/svg"
								xmlns:xlink="http://www.w3.org/1999/xlink"
								x="0px"
								y="0px"
								viewBox="0 0 68 68"
								style="enable-background:new 0 0 68 68;"
								xml:space="preserve"
							>
								<circle
									id="Oval"
									class="st0"
									cx="34"
									cy="34"
									r="34"
								/>
								<path
									id="Path-2"
									class="st1"
									d="M14,32.7c0,0,4.3,7.4,12.8,22.3l26.8-33.1l-6.2-4.7L28.7,40.7c-4.6-8.3-6.9-12.4-6.9-12.4L14,32.7z"
								/>
							</svg>
					  `
					: html`
							<?xml version="1.0" encoding="utf-8"?>
							<!-- Generator: Adobe Illustrator 23.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
							<svg
								version="1.1"
								id="Layer_1"
								xmlns="http://www.w3.org/2000/svg"
								xmlns:xlink="http://www.w3.org/1999/xlink"
								x="0px"
								y="0px"
								viewBox="0 0 68 68"
								style="enable-background:new 0 0 68 68;"
								xml:space="preserve"
							>
								<circle
									id="Oval-Copy"
									class="st0"
									cx="34"
									cy="34"
									r="34"
								/>
								<path
									id="Path-3"
									class="st1"
									d="M25.6,18L20,23.1L43.7,50c3.5-2.9,5.3-4.3,5.3-4.3S41.2,36.5,25.6,18z"
								/>
								<path
									id="Path-4"
									class="st1"
									d="M45.4,18c0,0-9.1,9.1-27.4,27.4l5.8,4.6L49,21.1C46.6,19,45.4,18,45.4,18z"
								/>
							</svg>
					  `}
			</div>
		`;
	}

	renderQuestion(result) {
		let { question, correct, correctAnswers, userAnswers } = { ...result };

		let additionalAnswers =
			correct && correctAnswers.length > userAnswers.length
				? correctAnswers.filter(answer => !userAnswers.includes(answer))
				: [];

		return html`
			<li class="review-item">
				<p class="question-text">${question}</p>
				<div class="answer-container">
					${this.renderStatusIcon(correct)}
					<div>
						${correct
							? html`
									<p class="answer-header">
										You answered correctly:
									</p>
									${userAnswers.map(
										answer => html`
											<p class="answer-text">
												${answer}
											</p>
										`
									)}
									${additionalAnswers.length > 0
										? html`
												<p
													class="answer-header answer-header--additional"
												>
													Other correct
													answer${additionalAnswers.length !==
													1
														? 's'
														: ''}:
												</p>
												${additionalAnswers.map(
													answer => {
														return html`
															<p
																class="answer-text"
															>
																${answer}
															</p>
														`;
													}
												)}
										  `
										: ``}
							  `
							: html`
									<p class="answer-header">
										Your
										answer${userAnswers.length !== 1
											? 's'
											: ''}:
									</p>
									${userAnswers.map(
										answer => html`
											<p
												class="answer-text answer-text--incorrect"
											>
												${answer}
											</p>
										`
									)}
									<p
										class="answer-header answer-header--additional"
									>
										Correct
										answer${correctAnswers.length !== 1
											? 's'
											: ''}:
									</p>
									${correctAnswers.map(
										answer => html`
											<p class="answer-text">
												${answer}
											</p>
										`
									)}
							  `}
					</div>
				</div>
			</li>
		`;
	}

	render() {
		return html`
			${sharedStyles}
			<div id="resultsContainer" class="results-container">
				<div class="above-fold">
					<h1 class="game-over-title">
						<span>You</span>
						<span>scored:</span>
						<br />
						<span>${this.score}</span>
						<span>out</span>
						<span>of</span>
						<span>${this.totalQs}</span>
					</h1>
					<div class="choices-container">
						<choices-element
							.answers=${this.answers}
							optionsGameOver=${true}
						></choices-element>
					</div>
					<button class="cta-button" @click=${this.scrollToReview}>
						<h3 class="review-cta">
							Review your questions
						</h3>
						${this.renderArrow()}
					</button>
				</div>
				<ol class="review-list">
					${this.results.map(result => this.renderQuestion(result))}
				</ol>
			</div>
		`;
	}

	static get styles() {
		return css`
			:host {
				display: block;
				background: ${unsafeCSS(config.style.gameOver.backgroundColor)};
				color: ${unsafeCSS(config.style.gameOver.color)};
			}

			.results-container {
				height: 100%;
				width: 100%;
				position: relative;
				overflow-y: auto;
			}

			.above-fold {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				height: 100%;
				padding: 20px;
				overflow: hidden;
			}

			h1.game-over-title {
				${unsafeCSS(
					!!config.style.gameOver.h1.color
						? `color: ${config.style.gameOver.h1.color}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.h1.fontSize
						? `font-size: ${config.style.gameOver.h1.fontSize}px`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.h1.fontWeight
						? `font-weight: ${config.style.gameOver.h1.fontWeight}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.h1.fontFamily
						? `font-family: ${config.style.gameOver.h1.fontFamily}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.h1.fontStyle
						? `font-style: ${config.style.gameOver.h1.fontStyle}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.h1.lineHeight
						? `line-height: ${config.style.gameOver.h1.lineHeight}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.h1.textAlign
						? `text-align: ${config.style.gameOver.h1.textAlign}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.h1.textDecoration
						? `text-decoration: ${
								config.style.gameOver.h1.textDecoration
						  }`
						: ''
				)};
			}

			h1.game-over-title span {
				display: inline-block;
			}

			.choices-container {
				position: relative;
				width: 100%;
				max-width: 500px;
				margin: 0 auto;
			}

			.cta-button {
				width: 250px;
				margin: 0 auto;
				color: inherit;
				cursor: pointer;
			}

			.arrow-icon-wrap {
				width: 15px;
				height: auto;
				margin: 0 auto;
				transform: rotate(270deg);
				transform-origin: center;
				transition: opacity 0.5s ease;
			}

			.arrow-icon-wrap > svg {
				fill: none;
				stroke: ${unsafeCSS(config.style.gameOver.icons.arrow)};
				stroke-width: 10;
			}

			h3.review-cta {
				margin-bottom: 5px;

				${unsafeCSS(
					!!config.style.gameOver.h3.color
						? `color: ${config.style.gameOver.h3.color}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.h3.fontSize
						? `font-size: ${config.style.gameOver.h3.fontSize}px`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.h3.fontWeight
						? `font-weight: ${config.style.gameOver.h3.fontWeight}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.h3.fontFamily
						? `font-family: ${config.style.gameOver.h3.fontFamily}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.h3.fontStyle
						? `font-style: ${config.style.gameOver.h3.fontStyle}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.h3.lineHeight
						? `line-height: ${config.style.gameOver.h3.lineHeight}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.h3.textAlign
						? `text-align: ${config.style.gameOver.h3.textAlign}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.h3.textDecoration
						? `text-decoration: ${
								config.style.gameOver.h3.textDecoration
						  }`
						: ''
				)};
			}

			ol.review-list {
				padding: 0 30px;
				list-style: decimal inside none;

				${unsafeCSS(
					!!config.style.gameOver.paragraph.question.color
						? `color: ${
								config.style.gameOver.paragraph.question.color
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.question.fontSize
						? `font-size: ${
								config.style.gameOver.paragraph.question
									.fontSize
						  }px`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.question.fontWeight
						? `font-weight: ${
								config.style.gameOver.paragraph.question
									.fontWeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.question.fontFamily
						? `font-family: ${
								config.style.gameOver.paragraph.question
									.fontFamily
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.question.fontStyle
						? `font-style: ${
								config.style.gameOver.paragraph.question
									.fontStyle
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.question.lineHeight
						? `line-height: ${
								config.style.gameOver.paragraph.question
									.lineHeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.question.textAlign
						? `text-align: ${
								config.style.gameOver.paragraph.question
									.textAlign
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.question.textDecoration
						? `text-decoration: ${
								config.style.gameOver.paragraph.question
									.textDecoration
						  }`
						: ''
				)};
			}

			li.review-item {
				margin: 0 auto;
				padding: 40px 0;
				text-align: left;
				border-top: 1px solid #d8d8d8;
			}

			.answer-container {
				display: flex;
				margin-top: 20px;
			}

			.status-icon-wrap {
				width: 30px;
				height: auto;
				margin-right: 15px;
			}

			.status-icon-wrap .st0,
			.status-icon-wrap .st1 {
				fill-rule: evenodd;
				clip-rule: evenodd;
			}

			.status-icon-wrap .st1 {
				fill: #ffffff;
			}

			.status-icon-wrap--correct .st0 {
				fill: ${unsafeCSS(config.style.gameOver.icons.correct)};
			}

			.status-icon-wrap--incorrect .st0 {
				fill: ${unsafeCSS(config.style.gameOver.icons.incorrect)};
			}

			p.question-text {
				display: inline;
				margin-left: 5px;

				${unsafeCSS(
					!!config.style.gameOver.paragraph.question.color
						? `color: ${
								config.style.gameOver.paragraph.question.color
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.question.fontSize
						? `font-size: ${
								config.style.gameOver.paragraph.question
									.fontSize
						  }px`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.question.fontWeight
						? `font-weight: ${
								config.style.gameOver.paragraph.question
									.fontWeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.question.fontFamily
						? `font-family: ${
								config.style.gameOver.paragraph.question
									.fontFamily
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.question.fontStyle
						? `font-style: ${
								config.style.gameOver.paragraph.question
									.fontStyle
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.question.lineHeight
						? `line-height: ${
								config.style.gameOver.paragraph.question
									.lineHeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.question.textAlign
						? `text-align: ${
								config.style.gameOver.paragraph.question
									.textAlign
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.question.textDecoration
						? `text-decoration: ${
								config.style.gameOver.paragraph.question
									.textDecoration
						  }`
						: ''
				)};
			}

			p.answer-header {
				margin-bottom: 2px;

				${unsafeCSS(
					!!config.style.gameOver.paragraph.header.color
						? `color: ${
								config.style.gameOver.paragraph.header.color
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.header.fontSize
						? `font-size: ${
								config.style.gameOver.paragraph.header.fontSize
						  }px`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.header.fontWeight
						? `font-weight: ${
								config.style.gameOver.paragraph.header
									.fontWeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.header.fontFamily
						? `font-family: ${
								config.style.gameOver.paragraph.header
									.fontFamily
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.header.fontStyle
						? `font-style: ${
								config.style.gameOver.paragraph.header.fontStyle
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.header.lineHeight
						? `line-height: ${
								config.style.gameOver.paragraph.header
									.lineHeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.header.textAlign
						? `text-align: ${
								config.style.gameOver.paragraph.header.textAlign
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.header.textDecoration
						? `text-decoration: ${
								config.style.gameOver.paragraph.header
									.textDecoration
						  }`
						: ''
				)};
			}

			p.answer-text {
				${unsafeCSS(
					!!config.style.gameOver.paragraph.answer.correct.color
						? `color: ${
								config.style.gameOver.paragraph.answer.correct
									.color
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.answer.correct.fontSize
						? `font-size: ${
								config.style.gameOver.paragraph.answer.correct
									.fontSize
						  }px`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.answer.correct.fontWeight
						? `font-weight: ${
								config.style.gameOver.paragraph.answer.correct
									.fontWeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.answer.correct.fontFamily
						? `font-family: ${
								config.style.gameOver.paragraph.answer.correct
									.fontFamily
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.answer.correct.fontStyle
						? `font-style: ${
								config.style.gameOver.paragraph.answer.correct
									.fontStyle
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.answer.correct.lineHeight
						? `line-height: ${
								config.style.gameOver.paragraph.answer.correct
									.lineHeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.answer.correct.textAlign
						? `text-align: ${
								config.style.gameOver.paragraph.answer.correct
									.textAlign
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.answer.correct
						.textDecoration
						? `text-decoration: ${
								config.style.gameOver.paragraph.answer.correct
									.textDecoration
						  }`
						: ''
				)};
			}

			p.answer-text--incorrect {
				${unsafeCSS(
					!!config.style.gameOver.paragraph.answer.incorrect.color
						? `color: ${
								config.style.gameOver.paragraph.answer.incorrect
									.color
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.answer.incorrect.fontSize
						? `font-size: ${
								config.style.gameOver.paragraph.answer.incorrect
									.fontSize
						  }px`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.answer.incorrect
						.fontWeight
						? `font-weight: ${
								config.style.gameOver.paragraph.answer.incorrect
									.fontWeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.answer.incorrect
						.fontFamily
						? `font-family: ${
								config.style.gameOver.paragraph.answer.incorrect
									.fontFamily
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.answer.incorrect.fontStyle
						? `font-style: ${
								config.style.gameOver.paragraph.answer.incorrect
									.fontStyle
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.answer.incorrect
						.lineHeight
						? `line-height: ${
								config.style.gameOver.paragraph.answer.incorrect
									.lineHeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.answer.incorrect.textAlign
						? `text-align: ${
								config.style.gameOver.paragraph.answer.incorrect
									.textAlign
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.gameOver.paragraph.answer.incorrect
						.textDecoration
						? `text-decoration: ${
								config.style.gameOver.paragraph.answer.incorrect
									.textDecoration
						  }`
						: ''
				)};
			}

			p.answer-header--additional {
				margin-top: 20px;
			}

			@media all and (orientation: landscape) {
				h1.game-over-title br {
					display: none;
				}

				.review-list {
					padding: 0 60px;
				}
			}
		`;
	}
}

customElements.define('game-over', GameOver);
