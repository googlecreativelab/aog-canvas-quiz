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
import { TweenMax, TimelineMax } from 'gsap';
import * as config from '../config';

export class Home extends LitElement {
	static get properties() {
		return {
			title: { type: String },
			state: { type: Object },
			headline: { type: String }
		};
	}

	set state(state) {
		this._state = state;
		if (this._state.answerOptions && this._state.answerOptions.list) {
			this.answers = this._state.answerOptions.list;
			this.shadowRoot.querySelector(
				'choices-element'
			).answers = this.answers;
		}
		this.title = document.title;

		if (this._state.headline) {
			this.headline = this._state.headline;
		}
	}

	get state() {
		return this._state;
	}

	firstUpdated() {
		this.$shiftLeft = this.shadowRoot.querySelectorAll(
			'.transition--exit-left'
		);
	}

	resetSelectedChoices() {
		let $choices = this.shadowRoot.querySelector(
			'choices-element'
		);
		$choices.resetSelectedChoices();
	}

	async animateIn() {
		var tlMain = new TimelineMax();

		tlMain
			.addLabel('start')
			// Reset x/y tweens
			.to(this.$shiftLeft, 0, { x: 0 }, 'start')
			// Reset Title/Start options
			.call(
				() => {
					let $startSpans = this.shadowRoot.querySelectorAll(
						'#startOptions span'
					);
					let $choices = this.shadowRoot.querySelector(
						'choices-element'
					);

					if ($startSpans && $startSpans.length > 0) {
						// Hide start header
						TweenMax.to($startSpans, 0, { scale: 0 });
					}
					if ($choices) {
						// Hide start buttons
						$choices.animateHide();
					}
				},
				null,
				null,
				'start'
			)
			// Label for Title
			.addLabel('rest', 0.9)
			// Title reveal
			.call(
				() => {
					const $titleSpans = this.shadowRoot.querySelectorAll(
						'#homeTitle > span'
					);

					if ($titleSpans && $titleSpans.length > 0) {
						// Hide start header
						TweenMax.staggerTo(
							$titleSpans,
							1.2,
							{
								scale: 1,
								transformOrigin: 'top center',
								ease: Elastic.easeOut.config(1, 0.7)
							},
							0.3
						);
					}
				},
				null,
				null,
				'rest'
			)
			.call(
				() => {
					var tlOptions = new TimelineMax();
					let $startSpans = this.shadowRoot.querySelectorAll(
						'#startOptions span'
					);
					let $choices = this.shadowRoot.querySelector(
						'choices-element'
					);

					tlOptions
						.add('reveal')
						// Text reveal
						.staggerFromTo(
							$startSpans,
							0.8,
							{
								scale: 0
							},
							{
								scale: 1,
								ease: Elastic.easeOut.config(1, 0.8)
							},
							0.1,
							'reveal'
						)
						// Button reveal
						.call(
							() => {
								$choices.animateIn();
							},
							null,
							null,
							'reveal+=0.5'
						);
				},
				null,
				null,
				'hide+=1.5'
			);
	}

	animateOut() {
		return new Promise(resolve => {
			let tlOut = new TimelineMax();

			tlOut
				.addLabel('start')
				// Shift content left
				.to(
					this.$shiftLeft,
					1.9,
					{ x: '-150vw', ease: Power3.easeOut },
					'start'
				)
				.eventCallback('onComplete', () => {
					resolve(true);
				});
		});
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

	render() {
		return html`
			${sharedStyles}
			<div class="homescreen-container component-container">
				<div class="title-options-container transition--exit-left">
					<h1 id="homeTitle" class="title">
						${this.formatTitle(this.title)}
					</h1>
					<div id="startOptions" class="start-container">
						<h2 class="headline">
							${this.formatTitle(this.headline)}
						</h2>
						<choices-element optionsStart=${true}></choices-element>
					</div>
				</div>
			</div>
		`;
	}

	static get styles() {
		return css`
			.homescreen-container {
				background: ${unsafeCSS(config.style.home.backgroundColor)};
				display: block;
			}

			.title-options-container {
				position: relative;
				height: 100%;
				width: 100%;
			}

			.title-options-container > * {
				width: 100%;
				position: absolute;
				top: 45%;
				left: 50%;
				transform: translate(-50%, -50%);
			}

			h1.title {
				top: 7%;

				${unsafeCSS(
					!!config.style.home.h1.color
						? `color: ${config.style.home.h1.color}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.home.h1.fontSize[0]
						? `font-size: ${config.style.home.h1.fontSize[0]}px`
						: ''
				)};
				${unsafeCSS(
					!!config.style.home.h1.fontFamily
						? `font-family: ${config.style.home.h1.fontFamily}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.home.h1.fontWeight
						? `font-weight: ${config.style.home.h1.fontWeight}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.home.h1.fontStyle
						? `font-style: ${config.style.home.h1.fontStyle}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.home.h1.lineHeight
						? `line-height: ${config.style.home.h1.lineHeight}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.home.h1.textAlign
						? `text-align: ${config.style.home.h1.textAlign}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.home.h1.textDecoration
						? `text-decoration: ${
								config.style.home.h1.textDecoration
						  }`
						: ''
				)};
			}

			h2.headline {
				margin-bottom: 20px;
			}

			h1.title > span,
			h2.headline > span {
				display: inline-block;
				transform: scale(0);
				transform-origin: center center;
			}

			@media all and (orientation: portrait) {
				.homescreen-container {
					padding: 20% 0 10%;
				}

				.start-container {
					padding: 0 5%;
				}
			}

			@media all and (orientation: landscape) {
				.homescreen-container {
					padding: 5% 0;
				}

				h1.title {
					${unsafeCSS(
						!!config.style.home.h1.fontSize[1]
							? `font-size: ${config.style.home.h1.fontSize[1]}px`
							: ''
					)};
				}
			}
		`;
	}
}

customElements.define('home-element', Home);
