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

import './style.scss';
// Our Game element, which handles most state logic
import './components/Game';
// Example functions on the window to preview various states
import './debug-helpers.js';

const $$body = document.querySelector('body');
const game = document.createElement('game-element');
$$body.appendChild(game);

// For the debug helpers, feel free to remove:
window.game = game;

// Sends responses from Assistant to our game element
function updateHandler(data) {
	console.log(data);
	game.sendAction(data);
}
// Setup for AoG
window.assistantCallbacks = {
	onUpdate: updateHandler
};

try {
	interactiveCanvas.ready(assistantCallbacks);
	console.log('Interactive Canvas initalized');
} catch (e) {
	console.error(`Error initializing Interactive Canvas: ${e}`);
}
