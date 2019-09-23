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

/**
 * Gets data from Sheets API, saves it to JSON, and also updates Dialogflow.
 * For use when deploying. Used in package.json scripts.
 */
async function checkAndUpdate(projectId) {
	const config = require('./config.js');
	if (config.dataManager.UPDATE_ON_DEPLOY) {
		msg('Updating quiz data...')
		msg('Setting project to ' + projectId);
		console.log('\x1b[96mParsing sheet...\x1b[96m');
		process.env.GCLOUD_PROJECT = projectId;
		try {
			config.updateEnvironment();
		} catch (e) {
			console.log('updateEnvironment not found');
		}
		const DataManager = require('./DataManager.js');
		const dm = new DataManager();
		const data = await dm.updateAllQuizData();
		msg('Update done');
	} else {
		msg('Skipping quiz data update. If you want to update your quiz data ' +
		'when you deploy, set dataManger.UPDATE_ON_DEPLOY to true in config.js');
	}
}

function msg(body) {
	console.log(`\x1b[96m${body}\x1b[0m`);
}

checkAndUpdate(process.argv[2]);
