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

const { google } = require('googleapis');
const config = require('./config.js');
const dialogflow = require('dialogflow');
const fs = require('fs');

module.exports = class dataManager {
	constructor() {
		process.env.GOOGLE_APPLICATION_CREDENTIALS =
			__dirname + config.SERVICE_KEY;
	}

	/**
	 * Returns quiz questions and answers.
	 */
	async getQuizData() {
		return new Promise(async (resolve, reject) => {
			let data = null;
			switch (config.dataManager.METHOD) {
				case 'live':
					// Get fresh data from Sheets API and update Dialogflow.
					// This will be slow as it incurs two API calls every time.
					data = await this.getDataFromSheet();
					await this.updateDialogFlow(data);
					break;

				case 'cache':
					// Get fresh data only if it's not already in memory.
					// It will be retained as long as the function is live on 
					// Firebase. This will be slow when the data needs to be 
					// reloaded.
					if (this.quizData) {
						// Quiz data is in memory. Skip calling Sheets API.
						data = this.quizData;
					} else {
						// Quiz data not in memory. Get it from Sheets API.
						data = await this.getDataFromSheet();
						// Also update dialogflow to make sure questions and 
						// answers are in sync
						await this.updateDialogFlow(data);
					}
					break;

				case 'static':
					// Get data from JSON file. Don't update Dialogflow.
					// This is the fastest.
					data = this.getStaticQuiz();
					break;

				default:
					reject(
						'unrecognized cache method ' + config.dataManager.METHOD
					);
					break;
			}

			this.quizData = data;
			this.lastUpdate = Date.now();
			resolve(data);
		});
	}

	/**
	 * Get quiz data from JSON file
	 */
	getStaticQuiz() {
		const data = JSON.parse(
			fs.readFileSync(
				__dirname + '/data/' + config.dataManager.STATIC_FILENAME,
				'utf8'
			)
		);
		return data;
	}

	/**
	 * Retrieves content from the "Misc" sheets of the spreadsheet
	 * @param {String} key id of the item in the spreadsheet
	 */
	getMisc(key) {
		let itemParts = {};
		let rand;
		for (const item of this.quizData.misc) {
			if (item.id === key) {
				// If there are the same number of text and audio elements,
				// assume they should be aligned
				if (Array.isArray(item.text) && Array.isArray(item.audio)) {
					if (item.text.length === item.audio.length) {
						rand = Math.round(
							Math.random() * (item.text.length - 1)
						);
						itemParts = { 
							text: item.text[rand], 
							audio: item.audio[rand] 
						};
						return itemParts;
					}
				}
				if (item.text) {
					if (Array.isArray(item.text)) {
						itemParts.text = item.text[
							Math.round(Math.random() * (item.text.length - 1))
						];
					} else {
						itemParts.text = item.text;
					}
				}
				if (item.audio) {
					if (Array.isArray(item.audio)) {
						itemParts.audio = item.audio[
							Math.round(Math.random() * (item.audio.length - 1))
						];
					} else {
						itemParts.audio = item.audio;
					}
				}
				return itemParts;
			}
		}
		return false;
	}

	/**
	 * Update JSON file and update Dialogflow.
	 * Useful to run on deploying function.
	 */
	async updateAllQuizData() {
		return new Promise(async (resolve, reject) => {
			const quizData = await this.getDataFromSheet();
			await this.updateStaticQuiz(quizData);
			await this.updateDialogFlow(quizData);
			resolve(quizData);
		});
	}

	/**
	 * Makes sheet data Dialogflow-friendly and adds it via DF API
	 * @param {Object} sheetData
	 */
	async updateDialogFlow(sheetData) {
		if (!sheetData) {
			sheetData = await this.getDataFromSheet();
		}
		if (sheetData.answers) {
			let entities = [];
			for (let answer of sheetData.answers) {
				if (!answer.synonyms) {
					// DF requires at least one synonym
					answer.synonyms = [answer.value];
				}
				entities.push({
					value: answer.value,
					synonyms: answer.synonyms
				});
			}
			await this.updateDF(sheetData.answers);
		}
	}

	/**
	 * Writes sheet data to JSON file
	 * @param {Object} sheetData
	 */
	async updateStaticQuiz(sheetData) {
		if (!sheetData) {
			sheetData = await this.getDataFromSheet();
		}
		fs.writeFileSync(
			__dirname + '/data/' + config.dataManager.STATIC_FILENAME,
			JSON.stringify(sheetData, null, 4)
		);
	}

	/**
	 * Updates Dialogflow entities. Deletes any entities that aren't included.
	 * @param {Array} entities
	 */
	async updateDF(entities) {
		return new Promise(async (resolve, reject) => {
			let existingEntities = [];
			let existingEntityType;
			try {
				existingEntityType = await this.getEntityTypeByName(
					config.GCP_ID,
					config.dialogflow.ENTITY_DISPLAY_NAME
				);
				existingEntities = existingEntityType.entities;
			} catch (e) {
				console.log(e);
			}

			const entityTypesClient = new dialogflow.EntityTypesClient();
			const entityTypePath = entityTypesClient.entityTypePath(
				config.GCP_ID,
				existingEntityType.id
			);
			let request = {};

			const newEntities = entities;
			let toBeDeleted = [];

			// Find entities that are in Dialogflow but aren't included in this 
			// update
			loop1: for (let exisitingEntity of existingEntities) {
				for (let newEntity of newEntities) {
					if (newEntity.value === exisitingEntity.value) {
						continue loop1;
					}
				}
				toBeDeleted.push(exisitingEntity.value);
			}

			// Batch delete entities
			if (toBeDeleted.length > 0) {
				console.log('Deleting ' + toBeDeleted.length + ' entities');
				request = {
					parent: entityTypePath,
					entityValues: toBeDeleted
				};
				await entityTypesClient.batchDeleteEntities(request);
				console.log('Entities deleted');
			} else {
				console.log('No entities to delete');
			}
			console.log('Adding/updating ' + newEntities.length + ' entities');
			request = {
				parent: entityTypePath,
				entities: newEntities
			};
			// Add entities. Overwrites exisiting entitiies with the same value.
			const [response] = await entityTypesClient.batchCreateEntities(
				request
			);
			console.log('Training agent');
			const trainResponse = await this.trainDFAgent(config.GCP_ID);
			resolve(response);
		});
	}

	/**
	 * Trains the agent, to make sure entity updates are actually used
	 * @param {String} projectId id of the GCP project attached to this agent
	 */
	async trainDFAgent(projectId) {
		return new Promise(async (resolve, reject) => {
			const client = new dialogflow.v2.AgentsClient();
			const formattedParent = client.projectPath(projectId);
			const [operation] = await client.trainAgent({ 
				parent: formattedParent 
			});
			resolve(operation);
		})
	}

	/**
	 * Finds the entity type by display name.
	 * This is a little cumbersome because entity paths in Dialogflow 
	 * aren't just the human-readable name.
	 * @param {String} projectId Dialogflow project id
	 * @param {String} entityDisplayName Name of the entity you want to find
	 */
	async getEntityTypeByName(projectId, entityDisplayName) {
		return new Promise(async (resolve, reject) => {
			const entityTypesClient = new dialogflow.EntityTypesClient();
			const agentPath = entityTypesClient.projectAgentPath(projectId);
			const request = {
				parent: agentPath
			};
			// Call the client library to retrieve a list of all existing entity
			// types.
			const [response] = await entityTypesClient.listEntityTypes(request);
			// Find the path that matches the display name
			response.forEach(entityType => {
				if (entityType.displayName === entityDisplayName) {
					//console.log(entityDisplayName);
					let parts = entityType.name.split('/');
					resolve({
						displayName: entityType.displayName,
						id: parts[parts.length - 1],
						entities: entityType.entities
					});
					return;
				}
			});
			reject(new Error('No entity found'));
		});
	}

	/**
	 * Gets all questions and answers and other data from Sheets API
	 * This requires a JSON key for a service account, downloaded from
	 * GCP. The spreadsheet should be shared with the service account.
	 * Location of the key is specified in config.js.
	 */
	async getDataFromSheet() {
		return new Promise(async (resolve, reject) => {
			const auth = await this.getAuth();
			const sheets = google.sheets({
				version: config.spreadsheet.API_VERSION,
				auth
			});
			// Range of thes spreadsheet to retrieve
			const range =
				'!' +
				config.spreadsheet.RANGE_START +
				':' +
				config.spreadsheet.RANGE_END;
			let ranges = [];
			// Loop through all sheets in config and create ranges
			for (const sheet of config.spreadsheet.sheets) {
				if (typeof sheet.name === 'string') {
					ranges.push(sheet.name + range);
				} else {
					for (const name of sheet.name) {
						ranges.push(name + range);
					}
				}
			}
			// Load values from the sheets
			sheets.spreadsheets.values.batchGet(
				{
					spreadsheetId: config.SHEET_ID,
					ranges: ranges
				},
				(err, res) => {
					if (err) {
						console.log('The API returned an error: ' + err);
						reject(err);
					} else {
						let allQuizData = {};
						let combinedSheetValues = {};
						// Loop through each sheet's data
						for (let valueRange of res.data.valueRanges) {
							const sheetName = valueRange.range.split('!')[0];
							// Find matching config info for this sheet
							for (const sheetConfig of config.spreadsheet
								.sheets) {
								let matches = false;
								if (typeof sheetConfig.name === 'string') {
									if (sheetConfig.name === sheetName) {
										matches = true;
									}
								} else {
									for (const name of sheetConfig.name) {
										if (name === sheetName) {
											matches = true;
											break;
										}
									}
								}
								if (matches) {
									if (combinedSheetValues[sheetConfig.id]) {
										combinedSheetValues[sheetConfig.id] =
											combinedSheetValues[sheetConfig.id]
												.concat(valueRange.values);
									} else {
										combinedSheetValues[sheetConfig.id] =
											valueRange.values;
									}
									break;
								}
							}
						}

						for (const [id, values] of Object.entries(
							combinedSheetValues
						)) {
							for (const sheetConfig of config.spreadsheet
								.sheets) {
								if (sheetConfig.id === id) {
									allQuizData[id] = this.parseSheet(
										sheetConfig,
										values
									);
									break;
								}
							}
						}
						resolve(allQuizData);
					}
				}
			);
		});
	}

	/**
	 * Parses a set of rows from a sheet based on config data
	 * @param {Object} sheetConfig
	 * @param {Array} rows
	 */
	parseSheet(sheetConfig, rows) {
		let allEntries = [];
		// Loop through all rows
		rowLoop: for (let i = sheetConfig.startAtRow - 1; i <= rows.length - 1; 
			i++) {
			let currentEntry = {};
			// Loop through the columns specified in config
			for (let col of sheetConfig.columns) {
				let colNum = col.range - 1;
				if (rows[i][colNum] && rows[i][colNum].length > 0) {
					// Check if this data should be in array format
					if (col.array) {
						let arr = rows[i][colNum].split(
							config.spreadsheet.DELIMITER
						);
						arr = arr.map(v => {
							return v.trim();
						});
						currentEntry[col.name] = arr;
					} else {
						currentEntry[col.name] = rows[i][colNum].trim();
					}
				} else {
					// column doesn't exist or isn't set
					if (col.required) {
						console.log(
							'ERROR: "' +
							col.name +
							'" is required but is not set at row ' +
							(i + 1) +
							', column ' +
							col.range +
							' in sheet ' +
							sheetConfig.name
						);
						continue rowLoop;
					}
				}
			}
			currentEntry.index = allEntries.length;
			allEntries.push(currentEntry);
		}
		return allEntries;
	}

	/**
	 * Authorizes API requests to Sheets and Dialogflow.
	 * Requires a JSON key for a service account. These can be
	 * generated from GCP.
	 */
	async getAuth() {
		const auth = await google.auth.getClient({
			scopes: [config.spreadsheet.AUTH_SCOPE]
		});
		return auth;
	}
};