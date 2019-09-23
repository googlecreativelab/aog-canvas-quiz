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

import { html } from 'lit-element';
import * as config from './config';

export const sharedStyles = html`
	<!-- CSS Reset -->
	<style type="text/css">
		html,
		body,
		div,
		span,
		applet,
		object,
		iframe,
		h1,
		h2,
		h3,
		h4,
		h5,
		h6,
		p,
		blockquote,
		pre,
		a,
		abbr,
		acronym,
		address,
		big,
		cite,
		code,
		del,
		dfn,
		em,
		img,
		ins,
		kbd,
		q,
		s,
		samp,
		small,
		strike,
		strong,
		sub,
		sup,
		tt,
		var,
		b,
		u,
		i,
		center,
		dl,
		dt,
		dd,
		ol,
		ul,
		li,
		fieldset,
		form,
		label,
		legend,
		table,
		caption,
		tbody,
		tfoot,
		thead,
		tr,
		th,
		td,
		article,
		aside,
		canvas,
		details,
		embed,
		figure,
		figcaption,
		footer,
		header,
		hgroup,
		menu,
		nav,
		output,
		ruby,
		section,
		summary,
		time,
		mark,
		audio,
		video {
			margin: 0;
			padding: 0;
			border: 0;
			font-size: 100%;
			font: inherit;
			vertical-align: baseline;
		}
		/* HTML5 display-role reset for older browsers */
		article,
		aside,
		details,
		figcaption,
		figure,
		footer,
		header,
		hgroup,
		menu,
		nav,
		section {
			display: block;
		}
		body {
			line-height: 1;
		}
		ol,
		ul {
			list-style: none;
		}
		blockquote,
		q {
			quotes: none;
		}
		blockquote:before,
		blockquote:after,
		q:before,
		q:after {
			content: '';
			content: none;
		}
		table {
			border-collapse: collapse;
			border-spacing: 0;
		}
	</style>

	<style type="text/css">
		* {
			box-sizing: border-box;
		}

		h1 {
			color: ${config.style.h1.color};
			font-size: ${config.style.h1.fontSize}px;
			font-weight: ${config.style.h1.fontWeight};
			font-family: ${config.style.h1.fontFamily};
			font-style: ${config.style.h1.fontStyle
				? config.style.h1.fontStyle
				: 'normal'};
			line-height: ${config.style.h1.lineHeight};
			text-align: ${config.style.h1.textAlign
				? config.style.h1.textAlign
				: 'left'};
			text-decoration: ${config.style.h1.textDecoration
				? config.style.h1.textDecoration
				: 'none'};
		}

		h2 {
			color: ${config.style.h2.color};
			font-size: ${config.style.h2.fontSize}px;
			font-weight: ${config.style.h2.fontWeight};
			font-family: ${config.style.h2.fontFamily};
			font-style: ${config.style.h2.fontStyle
				? config.style.h2.fontStyle
				: 'normal'};
			line-height: ${config.style.h2.lineHeight};
			text-align: ${config.style.h2.textAlign
				? config.style.h2.textAlign
				: 'left'};
			text-decoration: ${config.style.h2.textDecoration
				? config.style.h2.textDecoration
				: 'none'};
		}

		h3 {
			color: ${config.style.h3.color};
			font-size: ${config.style.h3.fontSize}px;
			font-weight: ${config.style.h3.fontWeight};
			font-family: ${config.style.h3.fontFamily};
			font-style: ${config.style.h3.fontStyle
				? config.style.h3.fontStyle
				: 'normal'};
			line-height: ${config.style.h3.lineHeight};
			text-align: ${config.style.h3.textAlign
				? config.style.h3.textAlign
				: 'left'};
			text-decoration: ${config.style.h3.textDecoration
				? config.style.h3.textDecoration
				: 'none'};
		}

		p {
			color: ${config.style.paragraph.color};
			font-size: ${config.style.paragraph.fontSize}px;
			font-weight: ${config.style.paragraph.fontWeight};
			font-family: ${config.style.paragraph.fontFamily};
			font-style: ${config.style.paragraph.fontStyle
				? config.style.paragraph.fontStyle
				: 'normal'};
			line-height: ${config.style.paragraph.lineHeight};
			text-align: ${config.style.paragraph.textAlign
				? config.style.paragraph.textAlign
				: 'left'};
			text-decoration: ${config.style.paragraph.textDecoration
				? config.style.paragraph.textDecoration
				: 'none'};
		}

		a {
			font-size: ${config.style.paragraph.fontSize}px;
			font-family: ${config.style.paragraph.fontFamily};
		}

		ol {
			color: ${config.style.paragraph.color};
			font-size: ${config.style.paragraph.fontSize}px;
			font-weight: ${config.style.paragraph.fontWeight};
			font-family: ${config.style.paragraph.fontFamily};
			font-style: ${config.style.paragraph.fontStyle
				? config.style.paragraph.fontStyle
				: 'normal'};
			line-height: ${config.style.paragraph.lineHeight};
			text-align: ${config.style.paragraph.textAlign
				? config.style.paragraph.textAlign
				: 'left'};
			text-decoration: ${config.style.paragraph.textDecoration
				? config.style.paragraph.textDecoration
				: 'none'};
		}

		.svg-wrap > svg,
		.svg-wrap--width > svg {
			display: block;
			width: 100% !important;
			height: auto !important;
		}

		.svg-wrap--height > svg {
			display: block;
			height: 100% !important;
			width: auto !important;
		}

		button {
			background: transparent;
			border: transparent;
		}

		button:focus {
			outline: none;
		}

		.hidden {
			opacity: 0;
		}

		.component-container {
			height: 100%;
			width: 100%;
			padding-bottom: 60px;
		}

		@media all and (orientation: landscape) {
			.component-container {
				padding-bottom: 80px;
			}
		}
	</style>
`;
