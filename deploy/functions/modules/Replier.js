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

const config = require('./config.js');
const {
	Image,
	BasicCard,
	Suggestions,
	List,
	Button,
	HtmlResponse
} = require('actions-on-google');

/**
 * Handles sending all replies. Adjusts to device capability
 * (Audio only, display with canvas, display without canvas)
 * For more information about canvas, see 
 * https://developers.google.com/actions/early-access-program/canvas/
 */
module.exports = class Replier {
	constructor(conv) {
		this.replies = [];
		this.suggestions = [];
		this.updatedState = {};

		this.conv = conv;

		this.hasScreen = conv.surface.capabilities.has(
			'actions.capability.SCREEN_OUTPUT'
		);
		this.hasAudio = conv.surface.capabilities.has(
			'actions.capability.AUDIO_OUTPUT'
		);
		this.hasMediaPlayback = conv.surface.capabilities.has(
			'actions.capability.MEDIA_RESPONSE_AUDIO'
		);
		this.hasWebBrowser = conv.surface.capabilities.has(
			'actions.capability.WEB_BROWSER'
		);
		if (config.USE_CANVAS) {
			this.hasCanvas = conv.surface.capabilities.has(
				'actions.capability.CUSTOM_STAGE'
			);
		}
	}

	/**
	 * Queues a reply to eventually send to user
	 * @param {*} replyData Object or string
	 * @param {String} onlyOnSurface "screen" or "audio"
	 */
	addReply(replyData, onlyOnSurface) {
		if (onlyOnSurface) {
			if (
				(onlyOnSurface === 'screen' && !this.hasScreen) ||
				(onlyOnSurface === 'audio' && this.hasCanvas)
			) {
				return false;
			}
		}
		try {
			let reply = this.buildReply(replyData);
			if (reply.content) {
				if (reply.type === config.replyTypes.SPOKEN) {
					// It's a spoken reply
					let spokenReplyIndexes = [];
					// Find all other spoken replies
					for (let i = 0; i < this.replies.length; i++) {
						if (this.replies[i].type === config.replyTypes.SPOKEN) {
							spokenReplyIndexes.push(i);
						}
					}
					// Check if there are more spoken replies than config 
					// allows. If so, concatenate this one onto the last one.
					// This is because Assistant currently only allows max 2 
					// spoken replies.
					if (
						spokenReplyIndexes.length >= config.MAX_SPOKEN_REPLIES
					) {
						this.replies[
							spokenReplyIndexes[spokenReplyIndexes.length - 1]
						].content += ' ' + reply.content;
					} else {
						this.replies.push(reply);
					}
				} else {
					// Not a spoken reply
					this.replies.push(reply);
				}
			} else {
				// Reply came back empty
				console.log('No reply content', replyData);
			}
			return this.replies;
		} catch (e) {
			console.log('Error making reply', e);
			return false;
		}
	}

	/**
	 * Queue up suggestions (the little chips on the bottom of
	 * screens that don't support canvas)
	 * @param {*} newSugs Array of strings or a single string
	 */
	addSuggestions(newSugs) {
		if (Array.isArray(newSugs)) {
			for (let sug of newSugs) {
				this.suggestions.push(sug);
			}
		} else {
			this.suggestions.push(newSugs);
		}
	}

	/**
	 * Queues up any object to pass to the canvas app
	 * ! This is a very dumb key-value store. 
	 * ! Will silently override old values if they already exist.
	 * @param {Object} obj Arbitrary object to pass to canvas app
	 */
	addCanvasUpdate(obj) {
		for (const [key, val] of Object.entries(obj)) {
			this.updatedState[key] = val;
		}
	}

	/**
	 * Makes AoG suggestions from an array of strings
	 * @param {Array} sugs List of suggestions
	 */
	buildSuggestions(sugs) {
		return new Suggestions(sugs);
	}

	/**
	 * Sends all queued replies, suggestions, and canvas updates.
	 * @param {*} replyData Additional reply to add before sending
	 */
	send(replyData) {
		if (replyData) {
			// Add reply before sending
			this.addReply(replyData);
		}

		for (let reply of this.replies) {
			if (this.hasCanvas && reply.type !== 'spoken') {
				// For non-spoken replies like lists or cards, transform them 
				// into state updates.
				for (const [key, val] of Object.entries(reply.content)) {
					this.addCanvasUpdate({ [key]: val });
				}
			} else if (reply.type === config.replyTypes.SPOKEN) {
				// Wrap spoken replies in case they have SSML elements
				this.conv.ask('<speak>' + reply.content + '</speak>');
			} else {
				this.conv.ask(reply.content);
			}
		}

		this.replies = [];

		if (this.suggestions.length > 0) {
			if (this.hasCanvas) {
				// Make suggestions a state update for canvas
				this.addCanvasUpdate({ suggestions: this.suggestions });
			} else {
				// Make suggestions AoG Suggestions for other devices
				this.conv.ask(this.buildSuggestions(this.suggestions));
			}
			this.suggestions = [];
		}

		if (this.hasCanvas && this.updatedState) {
			// Check if user is in the quiz
			if (this.conv.data.queue) {
				// Attach these for score and progress to every update
				this.updatedState.qNum = this.conv.data.qNum;
				this.updatedState.totalQs = this.conv.data.queue.length;
			}
			let canvasResponse = {
				data: this.updatedState
			};

			if (!this.conv.data.canvasURLLoaded) {
				// Canvas url hasn't been loaded, so tell app to load it.
				// Don't do this every request as it'll refresh the whole app.
				canvasResponse.url = config.CANVAS_URL;
				this.conv.data.canvasURLLoaded = true;
			}

			this.conv.ask(new HtmlResponse(canvasResponse));
		}
	}

	/**
	 * Creates properly formatted reply
	 * @param {*} replyData String for simple spoken reply, 
	 * 						or object with more info
	 */
	buildReply(replyData) {
		var replyContent;

		if (typeof replyData === 'string') {
			// Just plain TTS or SSML
			if (replyData.trim() === '') {
				return false;
			}
			replyContent = replyData;
			return { type: config.replyTypes.SPOKEN, content: replyContent };
		} else if (replyData.text) {
			// Appears to be audio response
			if (!replyData.audio || replyData.audio === '') {
				// No audio included. Process as text-only.
				return this.buildReply(replyData.text);
			}
			// Has audio file to be played
			// Make SSML
			let audioFile = replyData.audio;
			if (audioFile.indexOf('https://') !== 0) {
				audioFile = config.AUDIO_URL + audioFile;
			}
			let str = '<audio src="' + audioFile + '">';
			if (replyData.text) {
				str += '<desc>' + replyData.text + '</desc>';
			}
			str += '</audio>';
			replyContent = str;

			return { type: config.replyTypes.SPOKEN, content: replyContent };
		}

		switch (replyData.type) {
			case config.replyTypes.ANSWER_CHOICES:
				replyContent = this.buildAnswerOptions(replyData.content);
				break;

			case config.replyTypes.EXTRA_INFO:
				// EXTRA_INFO is a bucket that covers mostly feedback a user
				// gets after answering, like a card or a list of correct 
				// answers.
				replyContent = this.buildExtraInfo(replyData.content);
				break;

			default:
				throw new Error('unhandled reply type ' + replyData.type);
		}

		// In case it got converted to spoken, update the type.
		if (typeof replyContent === 'string') {
			replyData.type = config.replyTypes.SPOKEN;
		}

		return { type: replyData.type, content: replyContent };
	}

	/**
	 * Creates multiple choice options
	 * @param {Object} replyContent list property should hold the answer options
	 */
	buildAnswerOptions(replyContent) {
		if (!replyContent.list || replyContent.list.length < 1) {
			throw new Error('No list items in replyContent');
		}

		//Capitalize first letter in each choice
		for (let item of replyContent.list) {
			item.title =
				item.title.charAt(0).toUpperCase() + item.title.slice(1);
		}

		if (this.hasCanvas) {
			return { answerOptions: replyContent };
		} else if (this.hasScreen) {
			// Device has a screen but doesn't support canvas
			return this.buildAoGList(replyContent);
		} else {
			// Audio only
			let spokenOptions = [];
			for (let item of replyContent.list) {
				if (typeof item === 'string') {
					spokenOptions.push(item);
				} else {
					spokenOptions.push(item.title);
				}
			}
			console.log('options', spokenOptions);
			return this.arrayToTextList(spokenOptions, 'or') + '?';
		}
	}

	/**
	 * Builds a card or list to show user with additional info.
	 * @param {Object} replyData
	 */
	buildExtraInfo(replyData) {
		if (this.hasCanvas) {
			if (replyData.list) {
				return { list: replyData };
			} else {
				return { card: replyData };
			}
		} else if (this.hasScreen) {
			// Device has screen but doesn't support canvas
			if (replyData.list) {
				//return this.buildAoGList(replyData);
				return this.buildAoGCard({
					title: "Possible answers",
					text: replyData.list.join("  \n")
				})
			} else {
				return this.buildAoGCard(replyData);
			}
		} else {
			// Audio only
			// Don't do anything
			return false;
		}
	}

	/**
	 * Make an AoG card
	 * https://developers.google.com/actions/assistant/responses#basic_card
	 * @param {Object} replyContent
	 */
	buildAoGCard(replyContent) {
		let cardProps = {};

		if (replyContent.image) {
			cardProps.image = this.buildAoGImage(replyContent.image);
		}

		if (replyContent.title) {
			cardProps.title = replyContent.title;
		}

		if (replyContent.text) {
			cardProps.text = replyContent.text;
		}

		if (replyContent.subtitle) {
			cardProps.subtitle = replyContent.subtitle;
		}

		if (replyContent.link) {
			cardProps.buttons = new Button({
				title: replyContent.link.title,
				url: replyContent.link.url
			});
		}

		return new BasicCard(cardProps);
	}

	/**
	 * Makes and AoG-formatted list
	 * https://developers.google.com/actions/assistant/responses#list
	 * TODO: Support synonyms?
	 * @param {Object} replyData
	 */
	buildAoGList(replyData) {
		let listOptions = {
			items: {}
		};
		if (replyData.title) {
			listOptions.title = replyData.title;
		}
		let itemOptions;
		let itemKey;
		for (let listItem of replyData.list) {
			if (typeof listItem === 'string') {
				listItem = {
					title: listItem
				};
			}

			itemOptions = { title: listItem.title };
			if (listItem.image) {
				itemOptions.image = this.buildAoGImage(listItem.image);
			}
			if (listItem.text) {
				itemOptions.description = listItem.text;
			}
			if (listItem.key) {
				itemKey = listItem.key;
			} else {
				itemKey = listItem.title;
			}
			// Assumes unique titles. AoG will throw an error if you send it 
			// identical ones.
			listOptions.items[itemKey] = itemOptions;
		}
		return new List(listOptions);
	}

	/**
	 * Makes an AoG-formatted image
	 * https://developers.google.com/actions/assistant/responses#basic_card
	 * @param {*} imageInfo
	 */
	buildAoGImage(imageInfo) {
		let url = '';
		let alt = 'image text';
		if (typeof imageInfo === 'string') {
			url = imageInfo;
		} else {
			url = imageInfo.url;
			if (imageInfo.alt) {
				alt = imageInfo.alt;
			}
		}
		return new Image({ url: url, alt: alt });
	}

	/**
	 * Joins array into a list separated by commas and a final string divider
	 * ["Orange", "Apple", "Pear"] becomes "Orange, Apple, and Pear"
	 * TODO: This is duplicated in index.js
	 * @param {Array} array Array of strings
	 * @param {String} lastDivider String to put between last two items, 
	 * 								most likely ("and" or "or")
	 */
	arrayToTextList(array, lastDivider) {
		if (array.length === 2) {
			return array[0] + ' ' + lastDivider + ' ' + array[1];
		}

		let text = '';
		for (let i = 0; i < array.length; i++) {
			text += array[i];
			if (i < array.length - 2) {
				text += ', ';
			} else if (i === array.length - 2) {
				text += ', ' + lastDivider + ' ';
			}
		}
		return text;
	}
};
