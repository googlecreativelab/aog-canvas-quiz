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

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');

const commonConfig = {
	context: __dirname + '/client',
	entry: ['@babel/polyfill', './index.js'],
	output: {
		path: __dirname + '/deploy/public/canvas',
		filename: 'app.js',
		publicPath: '/canvas/'
	},
	resolve: {
		// modules : ['node_modules']
	},
	devServer: {
		contentBase: path.join(__dirname, 'deploy/public/canvas'),
		compress: true,
		port: 9000,
		historyApiFallback: {
			index: '/canvas/'
		}
	},
	plugins: [
		new CleanWebpackPlugin(['deploy/public/canvas']),
		new CopyWebpackPlugin([
			{
				from: __dirname + '/client/assets/**/*',
				to: __dirname + '/deploy/public/canvas/'
			}
		]),
		new HtmlWebpackPlugin({
			title: 'My Sample Quiz',
			template: __dirname + '/client/index.html',
			inject: 'body'
		})
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
								'@babel/preset-env',
								{
									targets: {
										esmodules: true
									}
								}
							]
						]
					}
				}
			},
			{
				test: /\.scss$/,
				use: ['style-loader', 'css-loader', 'sass-loader']
			}
		]
	}
};

module.exports = [commonConfig];
