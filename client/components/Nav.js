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

export class Nav extends LitElement {
	static get properties() {
		return {
			qNum: { type: Number },
			totalQs: { type: Number },
			next: { type: Boolean },
			nextBtnText: { type: String }
		};
	}

	constructor() {
		super();
		this.qNum = 0;
		this.totalQs = 0;
		this.next = false;
		this.nextBtnText = 'Next Question';
	}

	firstUpdated() {
		this.$navBtns = this.shadowRoot.querySelectorAll('.nav__btn');
		this.$prevBtn = this.shadowRoot.querySelector('.nav__btn--prev');
		this.$overlayBtn = this.shadowRoot.querySelector('.nav__overlay-btn');
		this.$overlayContent = this.shadowRoot.querySelectorAll(
			'.nav__overlay-btn > *'
		);
		this.timeline = new TimelineMax();
	}

	updated() {
		this.checkPrevButton();
	}

	checkPrevButton() {
		if (this.qNum % this.totalQs === 0) {
			this.$prevBtn.setAttribute('disabled', 'true');
		} else if (this.$prevBtn.hasAttribute('disabled')) {
			this.$prevBtn.removeAttribute('disabled');
		}
	}
	animateOverlayIn() {
		if (this.next) {
			this.$navBtns.forEach(el => {
				el.setAttribute('tabindex', -1);
			});
			this.$overlayBtn.setAttribute('tabindex', 0);

			this.timeline
				.to(this.$overlayBtn, 0.75, { maxWidth: '100%', autoAlpha: 1 })
				.to(this.$overlayContent, 0.25, { autoAlpha: 1 });
		}
	}

	animateOverlayOut() {
		this.$navBtns.forEach(el => {
			el.setAttribute('tabindex', 0);
		});
		this.$overlayBtn.setAttribute('tabindex', -1);

		this.timeline
			.add('start')
			.to(this.$overlayContent, 0.25, { autoAlpha: 0 }, 'start')
			.to(this.$overlayBtn, 0.25, { autoAlpha: 0 }, 'start')
			.to(
				this.$overlayBtn,
				0,
				{
					maxWidth: '0%',
					autoAlpha: 1
				},
				'start+=0.25'
			);
	}

	choiceSelectedHandler(e) {
		assistantCanvas.sendTextQuery(
			e.currentTarget.getAttribute('aria-label')
		);
	}

	renderArrow(direction) {
		return html`
			<div class="svg-wrap arrow-icon-wrap arrow-icon-wrap--${direction}">
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

	render() {
		let currQ = (this.qNum % this.totalQs) + 1;
		return html`
			${sharedStyles}
			<div id="container" class="nav-container">
				<button
					class="nav__overlay-btn"
					@click=${this.choiceSelectedHandler}
					aria-label=${this.nextBtnText}
					tabindex="-1"
				>
					<h3>${this.nextBtnText}</h3>
					${this.renderArrow('overlay')}
				</button>
				<button
					class="nav__btn nav__btn--prev"
					@click=${this.choiceSelectedHandler}
					aria-label="Previous question"
				>
					${this.renderArrow('left')}
				</button>
				<p class="nav__text">
					${currQ} of ${this.totalQs}
				</p>
				<button
					class="nav__btn"
					@click=${this.choiceSelectedHandler}
					aria-label="Next question"
				>
					${this.renderArrow('right')}
				</button>
			</div>
		`;
	}

	static get styles() {
		return css`
			button:disabled {
				opacity: 0.3;
			}

			button:not(:disabled):active,
			button:not(:disabled):focus {
				background-color: ${unsafeCSS(
					config.style.nav.activeBackground
				)};
			}

			.nav-container {
				position: relative;
				display: flex;
				width: 100vw;
				margin: 0 auto;
				padding: 15px 25px;
				justify-content: space-between;
				align-items: center;
			}

			.nav__overlay-btn {
				position: absolute;
				height: 100%;
				width: 100%;
				padding: 0;
				max-width: 0px;
				top: 0;
				left: 0;
				z-index: 1;
				background-color: ${unsafeCSS(
					config.style.nav.overlayBackground
				)};
				transition: background-color 0.2s ease;
			}

			.nav__overlay-btn h3 {
				${unsafeCSS(
					!!config.style.nav.h3.color
						? `color: ${config.style.nav.h3.color}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.nav.h3.fontSize
						? `font-size: ${config.style.nav.h3.fontSize}px`
						: ''
				)};
				${unsafeCSS(
					!!config.style.nav.h3.fontFamily
						? `font-family: ${config.style.nav.h3.fontFamily}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.nav.h3.fontWeight
						? `font-weight: ${config.style.nav.h3.fontWeight}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.nav.h3.fontStyle
						? `font-style: ${config.style.nav.h3.fontStyle}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.nav.h3.lineHeight
						? `line-height: ${config.style.nav.h3.lineHeight}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.nav.h3.textAlign
						? `text-align: ${config.style.nav.h3.textAlign}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.nav.h3.textDecoration
						? `text-decoration: ${
								config.style.nav.h3.textDecoration
						  }`
						: ''
				)};
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				opacity: 0;
			}

			.nav__btn {
				height: 50px;
				width: 50px;
				padding: 0;
				position: relative;
				border-radius: 50%;
				transition: background-color 0.2s ease;
				z-index: 0;
			}

			.arrow-icon-wrap {
				width: 15px;
				height: auto;
				position: absolute;
				top: 50%;
				transform-origin: center;
			}

			.arrow-icon-wrap--left,
			.arrow-icon-wrap--right {
				left: 50%;
			}

			.arrow-icon-wrap--left {
				transform: translate(-60%, -50%);
			}

			.arrow-icon-wrap--right {
				transform: translate(-40%, -50%) scaleX(-1);
			}

			.arrow-icon-wrap--overlay {
				right: 41px;
				transform: translateY(-50%) scaleX(-1);
				opacity: 0;
			}

			.arrow-icon-wrap .st0 {
				fill: none;
				stroke: ${unsafeCSS(config.style.nav.icons.arrow)};
				stroke-width: 10;
			}

			p.nav__text {
				${unsafeCSS(
					!!config.style.nav.paragraph.color
						? `color: ${config.style.nav.paragraph.color}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.nav.paragraph.fontSize
						? `font-size: ${config.style.nav.paragraph.fontSize}px`
						: ''
				)};
				${unsafeCSS(
					!!config.style.nav.paragraph.fontFamily
						? `font-family: ${
								config.style.nav.paragraph.fontFamily
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.nav.paragraph.fontWeight
						? `font-weight: ${
								config.style.nav.paragraph.fontWeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.nav.paragraph.fontStyle
						? `font-style: ${config.style.nav.paragraph.fontStyle}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.nav.paragraph.lineHeight
						? `line-height: ${
								config.style.nav.paragraph.lineHeight
						  }`
						: ''
				)};
				${unsafeCSS(
					!!config.style.nav.paragraph.textAlign
						? `text-align: ${config.style.nav.paragraph.textAlign}`
						: ''
				)};
				${unsafeCSS(
					!!config.style.nav.paragraph.textDecoration
						? `text-decoration: ${
								config.style.nav.paragraph.textDecoration
						  }`
						: ''
				)};
			}

			@media all and (orientation: landscape) {
				.nav-container {
					padding: 25px 40px;
				}

				.arrow-icon-wrap--overlay {
					right: 56px;
				}
			}

			@media all and (orientation: portrait) and (max-width: 410px),
				all and (orientation: landscape) and (max-height: 500px) {
				.nav__btn {
					height: 40px;
					width: 40px;
				}

				.nav-container {
					padding: 15px 40px;
				}
			}

			@media all and (orientation: portrait) and (max-width: 330px),
				all and (orientation: landscape) and (max-height: 390px) {
				.nav__btn {
					height: 30px;
					width: 30px;
				}

				.nav-container {
					padding: 10px 40px;
				}
			}
		`;
	}
}

customElements.define('nav-element', Nav);
