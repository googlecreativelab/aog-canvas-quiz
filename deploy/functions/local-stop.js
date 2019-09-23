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

// In case a tunnel doesn't close, you may run this (node ./local-stop)
const ngrok = require('ngrok');
require('dotenv').config();

let stopNgrok = async () => {
    try {
        await ngrok.disconnect({ configPath: process.env.NGROK_CONFIG });
        console.log('disconnected')
    } catch (err) {
        console.log(err)
        return err;
    }
}
stopNgrok();