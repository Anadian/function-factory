#!/usr/local/bin/node
'use strict';
/**
* @file filename.js
* @alias source/main.js
* @module ModuleName
* @description Brief description.
* @author Anadian
* @license 	Copyright 2020 Anadian
	Permission is hereby granted, free of charge, to any person obtaining a copy of this 
software and associated documentation files (the "Software"), to deal in the Software 
without restriction, including without limitation the rights to use, copy, modify, 
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to 
permit persons to whom the Software is furnished to do so, subject to the following 
conditions:
	The above copyright notice and this permission notice shall be included in all copies 
or substantial portions of the Software.
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE 
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

//#Dependencies
	//##Internal
	//##Standard
	const Utility = require('util');
	//##External

//#Constants
const FILENAME = 'filename.js';
const MODULE_NAME = 'ModuleName';
var PROCESS_NAME = '';
if(require.main === module){
	PROCESS_NAME = 'process-name';
} else{
	PROCESS_NAME = process.argv0;
}
//##Errors

//#Global Variables
var Logger = { 
	log: () => {
		return null;
	}
};
//#Functions
/**
* @function Logger_Set
* @access public
* @description Allows this module's functions to log the given logger object.
* @param {?object} logger - The logger to be used for logging or `null` to disable logging.
* @throws {TypeError} `ERR_INVALID_ARG_TYPE` if logger is not an object or `null`. 
* @since v0.0.0
*/
function Logger_Set( logger ){
	var return_error = null;
	const FUNCTION_NAME = 'Logger_Set';
	//Variables
	//Parametre checks
	if( typeof(logger) === 'object' ){
		if( logger === null ){
			logger = { 
				log: () => {
					return null;
				}
			};
		}
	} else{
		return_error = new TypeError('Param "logger" is not an object.');
		return_error.code = ERR_INVALID_ARG_TYPE;
		throw return_error;
	}

	//Function
	Logger = logger;
	//Return
}

//#Exports and Execution
if(require.main === module){
	var _return = [1,null];
	const FUNCTION_NAME = 'MainExecutionFunction';
	//##Dependencies
		//###Internal
		//###Standard
		//###External
		const MakeDir = require('make-dir');
		const ApplicationLogWinstonInterface = require('application-log-winston-interface');
		const EnvPaths = require('env-paths');
		const CommandLineArgs = require('command-line-args');
		const CommandLineUsage = require('command-line-usage');
	//Constants
	const EnvironmentPaths = EnvPaths( PROCESS_NAME );
	const OptionDefinitions = [
		//UI
		{ name: 'help', alias: 'h', type: Boolean, description: 'Writes this help text to stdout.' },
		{ name: 'noop', alias: 'n', type: Boolean, description: 'Show what would be done without actually doing it.' },
		{ name: 'verbose', alias: 'v', type: Boolean, description: 'Verbose output to stderr.' },
		{ name: 'version', alias: 'V', type: Boolean, description: 'Writes version information to stdout.'},
		//Input
		{ name: 'stdin', alias: 'i', type: Boolean, description: 'Read input from stdin.' },
		{ name: 'input', alias: 'I', type: String, description: 'The path to the file to read input from.'},
		//Output
		{ name: 'stdout', alias: 'o', type: Boolean, description: 'Write output to stdout.' },
		{ name: 'output', alias: 'O', type: String, description: 'The name of the file to write output to.' },
		{ name: 'pasteboard', alias: 'p', type: Boolean, description: 'Copy output to pasteboard (clipboard).'},
		//Config
		{ name: 'config', alias: 'c', type: Boolean, description: 'Print configuration values and information to stdout.' },
		{ name: 'config-file', alias: 'C', type: String, description: 'Use the given config file instead of the default.' },
	];
	//Variables
	var function_return = [1,null];
	//Logger
	try{ 
		MakeDir.sync( EnvironmentPaths.log );
	} catch(error){
		console.error('MakeDir.sync threw: %s', error);
	}
	function_return = ApplicationLogWinstonInterface.InitLogger('debug.log', EnvironmentPaths.log);
	if( function_return[0] === 0 ){
		Logger_Set( function_return[1] );
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'Start of execution block.'});
	//Options
	var Options = CommandLineArgs( OptionDefinitions );
	//Config
	if( Options.verbose === true ){
		logger.real_transports.console_stderr.level = 'debug';
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'note', message: Utility.format('Logger: console_stderr transport log level set to: %s', logger.real_transports.console_stderr.level)});
	}
	//Main
	if(Options.help === true){
		const help_sections_array = [
			{
				header: 'process-name',
				content: 'Brief description.',
			},
			{
				header: 'Options',
				optionList: OptionDefinitions
			}
		]
		const help_message = CommandLineUsage(help_sections_array);
		console.log(help_message);
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'End of execution block.'});
} else{
/**
* @property SetLogger
* @alias S
	exports.SetLogger = Logger_Set;
}
