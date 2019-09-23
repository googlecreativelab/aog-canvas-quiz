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
import { TimelineMax, TweenMax } from 'gsap';
import * as config from '../config';

export class Results extends LitElement {
	static get properties() {
		return {
			state: { type: Object },
			title: { type: String },
			correctAnswers: { type: Array },
			list: { type: Array },
			card: { type: Object },
			options: { type: Array },
			result: { type: String },
			cardColor: { type: String }
		};
	}

	constructor() {
		super();
		this.correctAnswers = [];
		this.list = {};
		this.card = {};
		this.options = [];
		this.result = '';
		this.cardColor = '#000';

		this.timeline = new TimelineMax();
	}

	choiceSelectedHandler(e) {
		assistantCanvas.sendTextQuery(e.currentTarget.innerText);
	}

	set state(state) {
		this._state = state;
		if (this._state) {
			this.title = this._state.headline;
			this.card = this._state.card;
			this.correctAnswers = this._state.correctAnswers;
			this.list = this._state.list;
			this.options = this._state.options;
			this.result = this._state.result;
		}
		if (this._state.headline) {
			this.title = this._state.headline;
		}
	}

	get state() {
		return this._state;
	}

	// Returns polygon 0around card h3
	getTitlePolygon() {
		let $cardTitle = this.shadowRoot.querySelector('.card__container h3');
		if ($cardTitle) {
			let titleRect = $cardTitle.getBoundingClientRect();
			let padding = 15;

			let x1 = $cardTitle.offsetLeft - 2 * padding;
			let x2 = $cardTitle.offsetLeft + titleRect.width + 2 * padding;
			let y1 = $cardTitle.offsetTop - padding;
			let y2 = $cardTitle.offsetTop + titleRect.height + padding;

			return `polygon(${x1}px ${y1}px, ${x2}px ${y1}px, ${x2}px ${y2}px, ${x1}px ${y2}px)`;
		}
	}

	// Returns polygon around entire card
	// Tweening between percentages and px values
	// cause a weird behavior.
	getCardPolygon() {
		let $cardContainer = this.shadowRoot.querySelector('.card__container');
		if ($cardContainer) {
			let cardRect = $cardContainer.getBoundingClientRect();

			let x1 = 0;
			let x2 = cardRect.width;
			let y1 = 0;
			let y2 = cardRect.height;

			return `polygon(${x1}px ${y1}px, ${x2}px ${y1}px, ${x2}px ${y2}px, ${x1}px ${y2}px)`;
		}
	}

	getTitleOffset() {
		let $cardTitle = this.shadowRoot.querySelector('.card__container h3');
		let padding = 15;
		if ($cardTitle) {
			return (($cardTitle.offsetTop - padding) / 2) * -1;
		}
	}

	animateIn() {
		return new Promise(resolve => {
			if (this.options && this.result === 'incorrect') {
				this.animateIncorrect(resolve.bind(this));
			} else if (
				this.card ||
				(this.correctAnswers && this.correctAnswers.length > 0) ||
				this.list
			) {
				this.animateCorrect(resolve.bind(this));
			} else {
				resolve(true);
			}
		});
	}

	async animateCorrect(resolve) {
		// Preload image
		const img = this.shadowRoot.querySelector('.card__img');
		if (img && img.hasAttribute('src')) {
			const imageLoader = new Image();
			await new Promise(resolve => {
				imageLoader.addEventListener('load', () => {
					resolve();
				});
				imageLoader.addEventListener('error', () => {
					resolve();
				});
				imageLoader.src = img.getAttribute('src');
			});
		}

		let titlePolygon = this.getTitlePolygon();
		let cardPolygon = this.getCardPolygon();

		// Center title before animating
		let titleOffset = this.getTitleOffset();

		let $cardContainer = this.shadowRoot.querySelector('.card__container');
		let $overlay = this.shadowRoot.querySelector('.overlay__container');
		let $titleSpans = this.shadowRoot.querySelectorAll(
			'.overlay__container span'
		);

		let $starWrap = this.shadowRoot.querySelector('.star-icon-wrap');
		let $starIcons = this.shadowRoot.querySelectorAll(
			'.star-icon-wrap svg path'
		);
		let $fireworksWrap = this.shadowRoot.querySelector(
			'.fireworks-icon-wrap'
		);
		let $fireworksParticlesW = this.shadowRoot.querySelectorAll(
			'.fireworks-icon-wrap svg rect.st0--width'
		);

		let $fireworksParticlesH = this.shadowRoot.querySelectorAll(
			'.fireworks-icon-wrap svg rect.st0--height'
		);

		this.timeline.add('start');

		if ($starWrap) {
			this.timeline
				.to($starWrap, 0, { autoAlpha: 0, scale: 0.4 }, 'start')
				.fromTo(
					$starWrap,
					1.2,
					{ autoAlpha: 0, scale: 0.4 },
					{
						autoAlpha: 1,
						scale: 1,
						ease: Elastic.easeOut.config(1, 0.5)
					},
					'start+=0.5'
				);
		}

		if ($starIcons && $starIcons.length > 0) {
			TweenMax.staggerTo(
				$starIcons,
				1.25,
				{
					rotation: 360,
					transformOrigin: '50% 50%',
					ease: SteppedEase.config(3),
					repeat: -1,
					repeatDelay: 0
				},
				0.2
			);

			TweenMax.staggerTo(
				$starIcons,
				0.5,
				{
					scale: 0.6,
					transformOrigin: '50% 50%',
					ease: SteppedEase.config(2),
					yoyo: true,
					repeat: -1,
					repeatDelay: 0
				},
				0.2
			);
		}

		if ($fireworksWrap) {
			this.timeline.fromTo(
				$fireworksWrap,
				0.6,
				{ scale: 0.4 },
				{
					scale: 1
				},
				'start+=0.4'
			);
		}

		if ($fireworksParticlesW && $fireworksParticlesW.length > 0) {
			this.timeline
				.to($fireworksParticlesW, 0, { autoAlpha: 0 }, 'start')
				.fromTo(
					$fireworksParticlesW,
					0.4,
					{ autoAlpha: 0, width: '6px' },
					{
						autoAlpha: 1,
						width: '110px',
						yoyo: true,
						repeat: 1
					},
					'start+=0.4'
				);
		}

		if ($fireworksParticlesH && $fireworksParticlesH.length > 0) {
			this.timeline
				.to($fireworksParticlesH, 0, { autoAlpha: 0 }, 'start')
				.fromTo(
					$fireworksParticlesH,
					0.4,
					{ autoAlpha: 0, height: '6px' },
					{
						autoAlpha: 1,
						height: '110px',
						yoyo: true,
						repeat: 1
					},
					'start+=0.4'
				);
		}

		if ($titleSpans && $titleSpans.length) {
			// Title reveal
			this.timeline.staggerFromTo(
				$titleSpans,
				1.2,
				{ scale: 0 },
				{
					scale: 1,
					ease: Elastic.easeOut.config(1, 0.5)
				},
				0.2,
				'start+=0.4'
			);
		}

		if ($overlay) {
			// Overlay fade out
			this.timeline.fromTo(
				$overlay,
				0.8,
				{ autoAlpha: 1 },
				{ autoAlpha: 0, delay: 0.5 }
			);
		}

		if ($cardContainer) {
			// Card title clip path reveal
			this.timeline
				.fromTo(
					$cardContainer,
					0.5,
					{
						y: titleOffset,
						scale: 0,
						transformOrigin: 'center center'
					},
					{
						y: titleOffset,
						scale: 1,
						ease: Back.easeOut.config(1.1),
						transformOrigin: 'center center'
					}
				)
				.fromTo(
					$cardContainer,
					0.8,
					{
						clipPath: titlePolygon,
						y: titleOffset,
						transformOrigin: 'center center'
					},
					{
						clipPath: cardPolygon,
						y: 0,
						transformOrigin: 'center center',
						ease: Back.easeOut.config(1.1)
					}
				)
				.to($cardContainer, 0.1, {
					clipPath: 'inset(0, 0)'
				});
		}
		this.timeline.eventCallback('onComplete', () => {
			resolve(true);
		});
	}

	renderStars() {
		return html`
			<div class="svg-wrap star-icon-wrap">
				<?xml version="1.0" encoding="utf-8"?>
				<!-- Generator: Adobe Illustrator 23.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
				<svg
					version="1.1"
					id="Layer_1"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					x="0px"
					y="0px"
					viewBox="0 0 1356.5 1410.1"
					style="enable-background:new 0 0 1356.5 1410.1;"
					xml:space="preserve"
				>
					<style type="text/css">
						.st0 {
							fill: #fff;
						}
					</style>
					<path
						class="st0"
						d="M650.8,1410.1c-6-8.7-11.8-17.1-17.6-25.5l-29.3,10.5c1.3-1.9,2.4-3.5,3.6-5.1c4.7-6.7,14.9-21.1,14.9-21.1
					s-11.3-16.4-16.6-24c-0.2-0.3-0.4-0.6-0.8-1.2l28.1,9l18.3-24.9l0.3,0.1c0.1,10.3,0.2,20.5,0.4,30.8l28.1,9
					c-0.6,0.2-0.9,0.4-1.2,0.5c-8.7,3.2-27.6,9.9-27.6,9.9s-0.1,20.8-0.2,30.5C650.9,1408.9,650.9,1409.3,650.8,1410.1"
					/>
					<path
						class="st0"
						d="M539.2,17.3l-16.5,13.9l9.2,19.6c-1.4-0.8-2.6-1.4-3.8-2.1l-15.6-8.9L497,52.9l-0.8,0.6
					c1.5-6.8,2.9-13.4,4.4-20l-18.4-11c0-0.1,0-0.1,0-0.2l21.3-2.3c1.5-6.6,2.9-13.2,4.4-20c0.2,0.4,0.3,0.6,0.5,0.8
					c2.8,5.8,8.7,18.5,8.7,18.5l21.1-1.9C538.4,17.4,538.7,17.4,539.2,17.3"
					/>
					<path
						class="st0"
						d="M1356.5,396l-31-1.5c-3.2,9.8-6.3,19.6-9.5,29.6c-0.7-2.2-1.3-4-1.9-5.9c-2.4-7.8-7.7-24.7-7.7-24.7l-29.2-1.4
					c-0.4,0-0.8-0.1-1.4-0.1l24.2-16.8l-8.7-29.6c0.1-0.1,0.1-0.1,0.2-0.2l24.8,18.5l24.2-16.8c-0.2,0.6-0.2,1-0.3,1.3
					c-2.8,8.9-8.9,27.9-8.9,27.9l24,18.7C1355.6,395.3,1355.9,395.6,1356.5,396"
					/>
					<path
						class="st0"
						d="M842.8,390.4l-8.3-28.9l-30.1,0.5c1.8-1.3,3.3-2.5,4.8-3.6c6.4-4.7,20.2-14.8,20.2-14.8s-5.3-18.5-7.8-27.2
					c-0.1-0.4-0.2-0.7-0.3-1.3l22.9,16.9l24.4-17.2l0.2,0.2c-3.1,9.4-6.1,18.9-9.2,28.4l22.9,16.9c-0.6,0-0.9,0.1-1.3,0.1
					c-9,0.2-28.4,0.6-28.4,0.6l-9.6,27.8C843.2,389.4,843.1,389.7,842.8,390.4"
					/>
					<path
						class="st0"
						d="M1315,933.5l-38.8-1.4c-3.8,12.3-7.5,24.6-11.4,37.3c-0.9-2.7-1.7-5-2.5-7.4c-3.2-9.7-10.1-30.8-10.1-30.8
					l-36.6-1.3l-1.8-0.1l30-21.4c-3.8-12.4-7.6-24.7-11.3-36.9l0.3-0.2L1264,894l30-21.5c-0.2,0.8-0.3,1.2-0.4,1.6
					c-3.3,11.1-10.7,35.1-10.7,35.1l30.4,23C1313.8,932.6,1314.2,932.9,1315,933.5"
					/>
					<path
						class="st0"
						d="M132.2,1026.9c-5.8-8.4-11.5-16.6-17.2-24.8l-28.5,10.2c1.3-1.8,2.4-3.4,3.4-5c4.6-6.5,14.5-20.5,14.5-20.5
					l-16.2-23.4c-0.2-0.3-0.4-0.6-0.8-1.2l27.3,8.8l17.8-24.2l0.3,0.1c0.1,10,0.2,20,0.3,30l27.3,8.8c-0.6,0.2-0.9,0.4-1.2,0.5
					c-8.5,3.1-26.8,9.7-26.8,9.7s-0.1,20.3-0.1,29.6C132.3,1025.8,132.3,1026.2,132.2,1026.9"
					/>
					<path
						class="st0"
						d="M147.1,426.6l-56.5-2L74,478.9c-1.3-4-2.5-7.4-3.6-10.7c-4.6-14.1-14.6-44.8-14.6-44.8l-53.2-1.9
					c-0.7,0-1.4-0.1-2.6-0.2l43.7-31.2c-5.6-18-11-35.9-16.5-53.8l0.4-0.3L73,369l43.7-31.2c-0.3,1.1-0.4,1.8-0.6,2.4
					c-4.9,16.2-15.5,51.1-15.5,51.1l44.3,33.5C145.6,425.2,146.1,425.7,147.1,426.6"
					/>
				</svg>
			</div>
		`;
	}

	renderFireworks(blue) {
		return html`
			<div class="svg-wrap fireworks-icon-wrap">
				<?xml version="1.0" encoding="utf-8"?>
				<!-- Generator: Adobe Illustrator 23.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
				<svg
					version="1.1"
					id="Layer_1"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					x="0px"
					y="0px"
					viewBox="0 0 1308.1 1323"
					style="enable-background:new 0 0 1308.1 1323;"
					xml:space="preserve"
				>
					<style type="text/css">
						.st0 {
							fill: #fff;
						}
					</style>
					${blue
						? html`
								<style type="text/css">
									.st0--blue {
										fill: #3c7eba;
									}
								</style>
						  `
						: ''}
					<title>result-fireworks</title>
					<rect
						x="40.9"
						y="349.9"
						transform="matrix(0.4495 -0.8933 0.8933 0.4495 -330.9791 258.6642)"
						class="st0 st0--height st0--blue"
						width="6.9"
						height="95.9"
					/>
					<rect
						x="1213.8"
						y="485"
						transform="matrix(0.96 -0.28 0.28 0.96 -86.3051 372.8153)"
						class="st0 st0--width st0--blue"
						width="95.9"
						height="6.9"
					/>
					<rect
						x="483.6"
						y="-0.4"
						transform="matrix(0.975 -0.2221 0.2221 0.975 1.6077 109.3373)"
						class="st0 st0--height st0--blue"
						width="6.9"
						height="95.9"
					/>
					<rect
						x="1171.6"
						y="1004"
						transform="matrix(0.572 -0.8203 0.8203 0.572 -359.9511 1414.0946)"
						class="st0 st0--height st0--blue"
						width="6.9"
						height="95.9"
					/>
					<rect
						x="260.8"
						y="1246.5"
						transform="matrix(0.4983 -0.867 0.867 0.4983 -928.7097 896.2278)"
						class="st0 st0--width st0--blue"
						width="98.4"
						height="8.1"
					/>
					<rect
						x="41.3"
						y="919.4"
						transform="matrix(0.8983 -0.4393 0.4393 0.8983 -395.2847 140.7855)"
						class="st0 st0--width"
						width="130.5"
						height="10.1"
					/>
					<rect
						x="536.9"
						y="1253.6"
						transform="matrix(6.982913e-02 -0.9976 0.9976 6.982913e-02 -695.3724 1771.5925)"
						class="st0 st0--width"
						width="130.8"
						height="10.2"
					/>
					<rect
						x="1199.2"
						y="788.9"
						transform="matrix(0.3192 -0.9477 0.9477 0.3192 10.2167 1722.828)"
						class="st0 st0--height"
						width="10.2"
						height="130.8"
					/>
					<rect
						x="909.6"
						y="168.5"
						transform="matrix(0.5531 -0.8331 0.8331 0.5531 291.0531 889.7516)"
						class="st0 st0--width"
						width="130.5"
						height="10.1"
					/>
					<rect
						x="246.9"
						y="150"
						transform="matrix(0.7522 -0.659 0.659 0.7522 -79.4182 219.3729)"
						class="st0 st0--height"
						width="10.1"
						height="130.5"
					/>
				</svg>
			</div>
		`;
	}

	renderRandom() {
		switch (Math.floor(Math.random() * Math.floor(3))) {
			case 0:
				return html`
					${this.renderStars()}
				`;
			case 1:
				return html`
					${this.renderFireworks()}
				`;
			case 2:
			default:
				return html`
					${this.renderFireworks(true)}
				`;
		}
	}

	animateIncorrect(resolve) {
		let tlIncorrect = new TimelineMax();
		let $titleSpans = this.shadowRoot.querySelectorAll(
			'.incorrect-container span'
		);
		let $statusButtons = this.shadowRoot.querySelectorAll('.status-button');

		tlIncorrect
			.staggerFromTo(
				$titleSpans,
				1.2,
				{ scale: 0 },
				{
					scale: 1,
					ease: Elastic.easeOut.config(1, 0.5),
					delay: 0.4
				},
				0.2
			)
			.fromTo(
				$statusButtons,
				0.5,
				{ scale: 0, transformOrigin: 'center center' },
				{
					scale: 1,
					transformOrigin: 'center center',
					ease: Elastic.easeOut.config(1, 1)
				}
			)
			.eventCallback('onComplete', () => {
				resolve(true);
			});
	}

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

	animateReset() {
		let $titleSpans = this.shadowRoot.querySelectorAll('span');
		if ($titleSpans) {
			TweenMax.to($titleSpans, 0, { scale: 0 });
		}

		let $statusButtons = this.shadowRoot.querySelectorAll('.status-button');
		if ($statusButtons) {
			TweenMax.to($titleSpans, 0, { scale: 0 });
		}

		let $overlay = this.shadowRoot.querySelector('.overlay__container');
		if ($overlay) {
			TweenMax.to($overlay, 0, { autoAlpha: 1 });
		}
	}

	renderImage(item) {
		const { image, image_alt } = { ...item };
		const portrait = window.innerHeight >= window.innerWidth;

		if (
			!portrait &&
			image_alt &&
			image_alt !==
				'https://civicstest-dev.firebaseapp.com/images/alt_image_here'
		) {
			return html`
				<div class="card__img-wrap">
					<img class="card__img" src="${image_alt}" />
				</div>
			`;
		} else if (image) {
			return html`
				<div class="card__img-wrap">
					<img class="card__img" src="${image}" />
				</div>
			`;
		} else {
			return;
		}
	}

	renderOverlay() {
		// Only render header if correct
		// Header for incorrect response
		// has already been shown
		return html`
			<div class="overlay__container">
				${this.result === 'correct'
					? html`
							<h1 class="overlay-title">
								${this.formatTitle(this.title)}
							</h1>
							${this.renderRandom()}
					  `
					: ''}
			</div>
		`;
	}

	renderAnswer() {
		if (this.options && this.result === 'incorrect') {
			// Case: incorrect answer
			return html`
				<div class="incorrect-container">
					<h1 class="overlay-title">
						${this.formatTitle(this.title)}
					</h1>
					<div class="button-group">
						${this.options.map(option => {
							return html`
								<button
									class="status-button"
									@click=${this.choiceSelectedHandler}
								>
									${option}
								</button>
							`;
						})}
					</div>
				</div>
			`;
		} else if (this.card) {
			// Case: correct answer with card provided
			return html`
				${this.renderOverlay()}
				<div class="card__shadow-wrap">
					<div
						class="card__container ${this.card.image
							? ''
							: 'card__container--text-only'}"
					>
						${this.renderImage(this.card)}
						<div class="card__text-wrap">
							<div class="card__text">
								<h3
									class="card__title"
									style="color: ${this.cardColor}"
								>
									${this.card.title}
								</h3>
								<p class="card__subtitle">
									${this.card.text}
								</p>
							</div>
						</div>
					</div>
				</div>
			`;
		} else if (this.correctAnswers && this.correctAnswers.length > 0) {
			// Case: correct answer with correctAnswers[] provided
			return html`
				${this.renderOverlay()}
				<div class="card__shadow-wrap">
					<div class="card__container card__container--text-only">
						<div class="card__text-wrap">
							<div class="card__text">
								<!-- TODO: get from response once provided -->
								<h3
									class="card__title"
									style="color: ${this.cardColor}"
								>
									Possible answers:
								</h3>
								${this.correctAnswers.map(
									answer => html`
										<div class="card__multiple-wrap">
											<p class="card__subtitle">
												${answer}
											</p>
										</div>
									`
								)}
							</div>
						</div>
					</div>
				</div>
			`;
		} else if (this.list) {
			// Case: correct answer with list object provided
			return html`
				${this.renderOverlay()}
				<div class="card__shadow-wrap">
					<div
						class="card__container ${this.list.image
							? ''
							: 'card__container--text-only'}"
					>
						${this.renderImage(this.list)}
						<div class="card__text-wrap">
							<div class="card__text">
								${this.list.list && this.list.list.length > 0
									? this.list.list.map(
											i => html`
												<div
													class="card__multiple-wrap"
												>
													<h3
														class="card__title"
														style="color: ${this
															.cardColor}"
													>
														${i.title}
													</h3>
													<p class="card__subtitle">
														${i.text}
													</p>
												</div>
											`
									  )
									: ``}
							</div>
						</div>
					</div>
				</div>
			`;
		} else {
			// Default case
			console.error('No render case:', this.state);
			return html`
				<div class="incorrect-container">
					<h1 class="overlay-title">${this.title}</h1>
				</div>
			`;
		}
	}

	render() {
		return html`
			${sharedStyles}
			<div
				class="results-container component-container"
				style="background-color: ${this.result === 'incorrect'
					? config.style.results.backgroundColor.incorrect
					: config.style.results.backgroundColor.correct}"
			>
				${this.renderAnswer()}
			</div>
		`;
	}

	static get styles() {
		return css`
			.results-container {
				position: relative;
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: flex-start;
				${unsafeCSS(
					!!config.style.results.color
						? `color: ${config.style.results.color}`
						: ''
				)};
			}

			.overlay__container {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-color: ${unsafeCSS(
					config.style.results.backgroundColor.overlay
				)};
				z-index: 1;
			}

			.overlay__container h1.overlay-title {
				width: 100%;
				position: absolute;
				left: 50%;
				top: 40%;
				transform: translate(-50%, -50%);
			}

			h1.overlay-title span {
				display: inline-block;
				transform: scale(0);
			}

			.incorrect-container {
				width: 100%;
				max-width: 600px;
				margin: auto;
			}

			.incorrect-container h1.overlay-title {
				margin: 0 0 40px 0;
			}

			.card__shadow-wrap {
				display: block;
				height: auto;
				width: auto;
				margin: auto;
				${unsafeCSS(
					!!config.style.results.infoBubble.shadow
						? `filter: ${config.style.results.infoBubble.shadow}`
						: ''
				)};
			}

			.card__container {
				position: relative;
				width: 100%;
				height: 100%;
				border-radius: ${unsafeCSS(
					config.style.results.infoBubble.borderRadius
				)}px;
				background-color: ${unsafeCSS(
					config.style.results.infoBubble.backgroundColor
				)};
			}

			.card__img {
				display: block;
				width: 100%;
				height: auto;
				border-radius: inherit;
			}

			.card__text-wrap {
				padding: 30px;
				background-color: ${unsafeCSS(
					config.style.results.infoBubble.backgroundColor
				)};
			}

			.card__text {
				width: 100%;
				margin: auto 0;
			}

			h3.card__title {
				margin: 0 0 30px 0;
				${unsafeCSS(
					!!config.style.results.infoBubble.h3.color
						? `color: ${config.style.results.infoBubble.h3.color}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.results.infoBubble.h3.fontSize
						? `font-size: ${
								config.style.results.infoBubble.h3.fontSize
						  }px`
						: ''
				)};
				${unsafeCSS(
					!!config.style.results.infoBubble.h3.fontWeight
						? `font-weight: ${
								config.style.results.infoBubble.h3.fontWeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.results.infoBubble.h3.fontFamily
						? `font-family: ${
								config.style.results.infoBubble.h3.fontFamily
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.results.infoBubble.h3.fontStyle
						? `font-style: ${
								config.style.results.infoBubble.h3.fontStyle
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.results.infoBubble.h3.lineHeight
						? `line-height: ${
								config.style.results.infoBubble.h3.lineHeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.results.infoBubble.h3.textAlign
						? `text-align: ${
								config.style.results.infoBubble.h3.textAlign
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.results.infoBubble.h3.textDecoration
						? `text-decoration: ${
								config.style.results.infoBubble.h3
									.textDecoration
						  }`
						: ''
				)};
			}

			p.card__subtitle {
				${unsafeCSS(
					!!config.style.results.infoBubble.paragraph.color
						? `color: ${
								config.style.results.infoBubble.paragraph.color
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.results.infoBubble.paragraph.fontSize
						? `font-size: ${
								config.style.results.infoBubble.paragraph
									.fontSize
						  }px`
						: ''
				)};
				${unsafeCSS(
					!!config.style.results.infoBubble.paragraph.fontWeight
						? `font-weight: ${
								config.style.results.infoBubble.paragraph
									.fontWeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.results.infoBubble.paragraph.fontFamily
						? `font-family: ${
								config.style.results.infoBubble.paragraph
									.fontFamily
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.results.infoBubble.paragraph.fontStyle
						? `font-style: ${
								config.style.results.infoBubble.paragraph
									.fontStyle
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.results.infoBubble.paragraph.lineHeight
						? `line-height: ${
								config.style.results.infoBubble.paragraph
									.lineHeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.results.infoBubble.paragraph.textAlign
						? `text-align: ${
								config.style.results.infoBubble.paragraph
									.textAlign
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.results.infoBubble.paragraph.textDecoration
						? `text-decoration: ${
								config.style.results.infoBubble.paragraph
									.textDecoration
						  }`
						: ''
				)};
			}

			.card__multiple-wrap:not(:last-of-type) {
				margin-bottom: 15px;
			}

			.star-icon-wrap,
			.fireworks-icon-wrap svg rect.st0--width,
			.fireworks-icon-wrap svg rect.st0--height {
				opacity: 0;
			}

			.fireworks-icon-wrap,
			.star-icon-wrap {
				width: 350px;
				position: absolute;
				top: 45%;
				left: 50%;
				transform: translate(-50%, -50%);
			}

			.button-group {
				display: flex;
				justify-content: space-between;
				margin: 0 -10px;
			}

			.button-group > * {
				flex: 1 1 50%;
				margin: 0 10px;
			}

			.status-button {
				padding: ${unsafeCSS(config.style.results.statusBtns.padding)};
				background-color: ${unsafeCSS(
					config.style.results.statusBtns.backgroundColor
				)};
				box-shadow: ${unsafeCSS(
					config.style.results.statusBtns.shadow
						? config.style.results.statusBtns.shadow
						: 'none'
				)};
				border: ${unsafeCSS(config.style.results.statusBtns.border)};
				border-radius: ${unsafeCSS(
					config.style.results.statusBtns.borderRadius
				)}px;
				color: ${unsafeCSS(config.style.results.statusBtns.color)};
				font-size: ${unsafeCSS(
					config.style.results.statusBtns.fontSize
				)}px;
				font-weight: ${unsafeCSS(
					config.style.results.statusBtns.fontWeight
				)};
				font-family: ${unsafeCSS(
					config.style.results.statusBtns.fontFamily
				)};
				transform: scale(0);
				transition: 0.2s background-color ease;
			}

			.status-button:active {
				background-color: ${unsafeCSS(
					config.style.results.statusBtns.backgroundColorSelected
				)};
			}

			@media all and (orientation: portrait) {
				.results-container {
					padding: 40px 40px 100px;
				}

				.card__shadow-wrap {
					max-width: 650px;
					max-height: 100%;
				}
				.card__container {
					overflow-y: auto;
				}

				.card__container > *:first-child {
					border-top-left-radius: ${unsafeCSS(
						config.style.results.infoBubble.borderRadius
					)}px;
					border-top-right-radius: ${unsafeCSS(
						config.style.results.infoBubble.borderRadius
					)}px;
				}

				.card__container > *:last-child {
					border-bottom-left-radius: ${unsafeCSS(
						config.style.results.infoBubble.borderRadius
					)}px;
					border-bottom-right-radius: ${unsafeCSS(
						config.style.results.infoBubble.borderRadius
					)}px;
				}
			}

			@media all and (orientation: landscape) {
				.results-container {
					padding: 20px 20px 120px;
				}

				.card__shadow-wrap {
					max-width: 800px;
					max-height: 80%;
				}
				.card__container {
					display: flex;
				}

				.card__container--text-only {
					width: 500px;
					max-width: 80vw;
				}

				.card__container > *:first-child {
					border-top-left-radius: ${unsafeCSS(
						config.style.results.infoBubble.borderRadius
					)}px;
					border-bottom-left-radius: ${unsafeCSS(
						config.style.results.infoBubble.borderRadius
					)}px;
				}

				.card__container > *:last-child {
					border-top-right-radius: ${unsafeCSS(
						config.style.results.infoBubble.borderRadius
					)}px;
					border-bottom-right-radius: ${unsafeCSS(
						config.style.results.infoBubble.borderRadius
					)}px;
					max-height: 100%;
					overflow-y: auto;
				}

				.card__img-wrap {
					display: block;
					flex: 9 1 0;
					height: auto;
				}

				.card__img {
					object-fit: cover;
					width: 100%;
					height: 100%;
				}

				.card__text-wrap {
					display: flex;
					flex: 11 1 0;
					padding: 35px;
				}
			}

			@media all and (orientation: portrait) and (max-width: 410px),
				all and (orientation: landscape) and (max-height: 500px) {
				.results-container {
					padding: 20px 20px 90px;
				}
			}

			@media all and (orientation: portrait) and (max-width: 330px),
				all and (orientation: landscape) and (max-height: 390px) {
				.results-container {
					padding: 20px 20px 60px;
				}
			}
		`;
	}
}

customElements.define('results-element', Results);
