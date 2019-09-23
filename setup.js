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

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const spawn = require('child_process').spawn;
var fs = require('fs');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const serviceAccountName = "canvasquiz";
const keyFileName = "canvasquizkey.json";
const keyPath = "deploy/functions/modules/auth/";
const agentZipName = "canvas-quiz-starter-agent.zip";



function installDeps() {
    return new Promise((resolve, reject) => {
        const child = spawn('npm', ['run', 'installall'], { stdio: 'inherit' });
        child.on('exit', function (code) {
            if (code === 0) {
                msg('Dependencies installed successfully');
            } else {
                error(`There was an error installing dependencies. You probably want to look into it.`)
            }
            resolve();
        });
    })
}


async function setup() {
    msg(`This script will help set up your Canvas Quiz project.`)
    msg(`\x1b[1mIT IS IMPORTANT YOU DO THESE THINGS FIRST:`);
    msg(`1. Create a new Firebase project.`);
    msg(`2. Enable Blaze billing for your project.`);
    msg(`3. Install the Google Cloud SDK: https://cloud.google.com/sdk/docs/#install_the_latest_cloud_tools_version_cloudsdk_current_version`);
    msg(`4. Create a new Dialogflow agent connected to your Firebase project.`);

    const installConfirm = await prompt('Do you want to install all dependencies with npm?  [y/n]:', true);
    if (installConfirm) {
        msg('Installing dependencies...');
        await installDeps();
    } else {
        msg('Skipping dependency installation...');
    }


    msg('Getting current Google Cloud project...')
    let gcloudProject;
    try {
        gcloudProject = await getProject();
    } catch (e) {
        error(`Error getting project`);
        error(`More info from gcloud:`);
        error(`----------------------`);
        error(e);
        readline.close();
        return;
    }

    msg('Using project ' + gcloudProject);
    let serviceAccountEmail;
    let matchingAccounts;
    try {
        matchingAccounts = await getMatchingServiceAccounts(serviceAccountName, gcloudProject);
    } catch (e) {
        error(`Error getting service accounts. Have you run "gcloud auth login?:`);
        error(`More info from gcloud:`);
        error(`----------------------`);
        error(e);
        readline.close();
        return;
    }

    if (matchingAccounts) {
        msg("This project already has service accounts that look like they're for Canvas Quiz:");
        for (const account of matchingAccounts) {
            msg(account.email);
            serviceAccountEmail = account.email;
        }
    } else {
        try {
            msg(`Creating service account...`);
            serviceAccountEmail = await createServiceAccount(serviceAccountName, gcloudProject);

        } catch (e) {
            error('Error creating serivce account:');
            error(JSON.stringify(e));
            readline.close();
            return;
        }
    }

    if (!fs.existsSync("./" + keyPath + keyFileName)) {
        msg(`Creating key...`)
        try {
            await createKey(serviceAccountName, gcloudProject, keyFileName);
        } catch (e) {
            error('Error creating key:');
            error(JSON.stringify(e));
        }
    } else {
        const keyContents = fs.readFileSync('./' + keyPath + keyFileName, 'utf8');
        const key = JSON.parse(keyContents);
        if (key.client_email.indexOf(`${serviceAccountName}@${gcloudProject}`) != 0) {
            msg(`It looks like the downloaded key file doesn't match your service account.`);
            msg(`Service account for current key file: ${key.client_email}`);
            const confirm = await prompt('Download a new key?', true);
            if (confirm) {
                msg(`Creating key...`)
                try {
                    await createKey(serviceAccountName, gcloudProject, keyFileName);
                } catch (e) {
                    error('Error creating key:');
                    error(JSON.stringify(e));
                }
            } else {
                msg(`Keeping current key. If you need to get another key,` +
                    `delete the one in deploy/functions/modules/auth and ` +
                    `run this again.`);
            }
        } else {
            msg(`Keeping current key. If you need to get another key,` +
                `delete the one in deploy/functions/modules/auth and ` +
                `run this again.`);
        }
    }

    msg('Enabling Google Sheets API...');
    await exec('gcloud services enable sheets.googleapis.com');

    msg('Please make a copy of the Google Sheet at https://docs.google.com/spreadsheets/d/1Nk6ZedoaNutKK4aJb1mD_MsKOdyUwFBeay_6cVOplBk/edit.');
    msg(`Now enter your sheet's ID:`);
    const sheetID = await getSheetID();

    msg('Please share that sheet with the service account you just created:');
    msg(serviceAccountEmail)
    await prompt('Enter any character to continue:');

    msg('Updating config variables...');
    await replaceInFile('./deploy/functions/modules/config.js', [
        { term: '$PROJECTID', replacement: gcloudProject },
        { term: '$SHEETID', replacement: sheetID },
        { term: '$AUTHKEY', replacement: `/auth/${keyFileName}` }
    ])
    await replaceInFile('./deploy/.firebaserc', [
        { term: '$PROJECTID', replacement: gcloudProject }
    ])

    msg('Enabling Dialogflow API...')
    await exec('gcloud services enable dialogflow.googleapis.com');

    process.env.GOOGLE_APPLICATION_CREDENTIALS = __dirname + `/${keyPath}${keyFileName}`;

    msg('HEADS UP! This script is about to restore the Dialogflow Agent. If you already set up an agent, this will overwrite everything. There is no undo.');
    const confirm = await prompt('Are you sure? [y/n]:', true);
    if (confirm) {
        msg('Restoring Dialogflow agent...');
        try {
            await restoreDialogflowAgent(agentZipName, gcloudProject);
        } catch (e) {
            error(`Error restoring Dialogflow agent. Make sure you've created an agent and set the Google Proejct ID. More details:`);
            error(JSON.stringify(e));
        }
    } else {
        msg('Skipping agent restore. If you skipped this by accident, just run the script again.');
    }
    msg(`Make sure you update your fulfillment URL in the Dialogflow console to your Firebase functions URL`);


    msg('All done.');
    readline.close();
    return;
}

function replaceInFile(filename, replacements) {
    return new Promise((resolve, reject) => {
        const fileContents = fs.readFileSync(filename, 'utf8');
        let edited = fileContents;
        for (var pair of replacements) {
            const escapedTerm = pair.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            edited = edited.replace(new RegExp(escapedTerm, 'g'), pair.replacement);
        }
        fs.writeFileSync(filename, edited, 'utf8');
        resolve();
    })

}

function createServiceAccount(name, project) {
    return new Promise(async (resolve, reject) => {
        try {
            const { stdout1 } = await exec(`gcloud iam service-accounts create ${name} --format=json`);
            const { stdout2 } = await exec(`gcloud projects add-iam-policy-binding ${project} --member "serviceAccount:${name}@${project}.iam.gserviceaccount.com" --role "roles/owner"`);
            const email = `${name}@${project}.iam.gserviceaccount.com`;
            resolve(email);
        } catch (e) {
            reject(e);
        }
    })
}

function createKey(name, project, keyFileName) {
    return new Promise(async (resolve, reject) => {
        try {
            const { stdout } = await exec(`gcloud iam service-accounts keys create ${keyFileName} --iam-account ${name}@${project}.iam.gserviceaccount.com`);
            if (!fs.existsSync(`./${keyPath}`)){
                fs.mkdirSync(`./${keyPath}`);
            }
            fs.rename(keyFileName, `./${keyPath}${keyFileName}`, (err) => {
                if (err){
                    reject(err);
                } else{
                    resolve();
                }
                
            });
        } catch (e) {
            reject(e);
        }

    })
}

function getMatchingServiceAccounts(emailPart, project) {
    return new Promise(async (resolve, reject) => {
        try {
            const { stdout } = await exec(`gcloud iam service-accounts list --filter="EMAIL:${emailPart}@*" --format=json --project="${project}"`);
            const accounts = JSON.parse(stdout);
            if (accounts.length === 0) {
                resolve(false);
            } else {
                resolve(accounts);
            }
        } catch (e) {
            reject(e);
        }
    })
}

async function getProject() {
    return new Promise(async (resolve, reject) => {
        try {
            const { stdout, stderror } = await exec('gcloud config get-value project --format=json');
            const project = JSON.parse(stdout);
            msg("Currently using project " + project);
            const result = await prompt('Does that look right? [y/n]:', true);
            if (result) {
                resolve(project);
            } else {
                const newProject = await prompt('Please enter your project name:');
                await exec(`gcloud config set project ${newProject}`);
                resolve(newProject);
            }
        } catch (e) {
            console.log(JSON.stringify(e));
            reject();
        }
    })
}

function getSheetID() {
    return new Promise(async (resolve, reject) => {
        readline.question('Please enter the id of your Google Sheet:', (input) => {
            resolve(input);
        })
    })
}

function prompt(question, yesNo) {
    return new Promise((resolve, reject) => {
        readline.question(question, (input) => {
            if (yesNo) {
                if (input.toLowerCase() == "y") {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(input);
            }
        })
    })
}

function restoreDialogflowAgent(filename, project) {
    return new Promise((resolve, reject) => {
        const dialogflow = require('dialogflow');
        const client = new dialogflow.v2.AgentsClient();
        const formattedParent = client.projectPath(project);

        fs.readFile(filename, function (err, data) {
            const base64encoded = Buffer.from(data).toString('base64');
            client.restoreAgent({
                parent: formattedParent,
                agentContent: base64encoded
            }).then(responses => {
                const [operation, initialApiResponse] = responses;
                // Operation#promise starts polling for the completion of the LRO.
                return operation.promise();
            }).then(responses => {
                const result = responses[0];
                const metadata = responses[1];
                const finalApiResponse = responses[2];
                console.log(JSON.stringify(responses));
                resolve(true);
            })
                .catch(err => {
                    reject(err);
                });
        })
    })
}

function msg(body) {
    console.log(`\x1b[96m${body}\x1b[0m`);
}

function error(body) {
    console.log(`\x1b[31m${body}\x1b[0m`);
}

setup();