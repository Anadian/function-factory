#!/usr/local/bin/node
'use strict';

/**
* @file jsonic-parse.js
* @brief Parse a JSONIC (JavaScript Object Notation Including Comments) file.
* @author Anadian
* @copyright 	Copyright 2019 Canosw
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

//Dependencies
	//Internal
	//Standard
	const FileSystem = require('fs');
	const Utility = require('util');
	//External
	const StripJSONComments = require('strip-json-comments');
	const ParseJSON = require('parse-json');

//Constants
const FILENAME = 'jsonic-parse.js';
const MODULE_NAME = 'JSONICParse';
var PROCESS_NAME = '';
if(require.main === module){
	PROCESS_NAME = 'jsonic-parse';
} else{
	PROCESS_NAME = process.argv0;
}

var Logger = null;

function Logger_Set( logger ){
	var _return = [1,null];
	const FUNCTION_NAME = 'Logger_Set';
	//Variables
	var function_return = [1,null];

	//Parametre checks
	if( logger == undefined || typeof(logger) !== 'object' ){
		_return = [-2,'Error: parametre "logger" is either null or not an object.'];
	}

	//Function
	if( _return[0] === 1 ){
		Logger = logger;
		_return = [0,null];
	}

	//Return
	return _return;
}

//Functions
/**
* @fn JSONIC_Parse_FileData
* @brief Parse JSONIC-format file_data.
* @param file_data
*	@type String
*	@brief The filedata to be parsed.
*	@default null
* @return <ARRAY>
*	@entry 0 
*		@retval 1 premature return.
*		@retval 0 on success.
*		@retval <0 on failure.
*	@entry 1
*		@retval <object> on success
*		@retval <error_message> on failure.
*/
function JSONIC_Parse_FileData( file_data ){
	var _return = [1,null];
	const FUNCTION_NAME = 'JSONIC_Parse_FileData';
	//Variables
	var stripped_file_data = '';
	var json_object = null;

	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: '+arguments.toString());
	//Parametre checks
	if(file_data == undefined) file_data = null;
	
	//Function
	if( file_data != null && typeof(file_data) === 'string'){
		stripped_file_data = StripJSONComments( file_data );
		if( stripped_file_data != null ){
			json_object = ParseJSON( stripped_file_data );
			if( json_object != null ){
				_return = [0,json_object];
			} else{
				_return = [-8, 'Error: parsing stripped_file_data: '+stripped_file_data];
			}
		} else{
			_return = [-4, 'Error: stripping comments from file_data: '+file_data];
		}
	} else{
		_return = [-2, 'Error: file_data is either null or not a string: '+file_data];
	}

	//Return
	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','returned: '+_return.toString());
	return _return;
}
/**
* @fn JSONIC_Parse_FilePath
* @brief Parse a JSONIC format file with the given path and return the parsed JSON object.
* @param file_path
*	@type String
*	@brief The path to read for file data.
*	@default null
* @return <ARRAY>
*	@entry 0 
*		@retval 1 premature return.
*		@retval 0 on success.
*		@retval <0 on failure.
*	@entry 1
*		@retval <object> on success
*		@retval <error_message> on failure.
*/
function JSONIC_Parse_FilePath( file_path ){
	var _return = [1,null];
	const FUNCTION_NAME = 'JSONIC_Parse_FilePath';
	//Variables
	var function_return = [1,null];
	var file_data = '';

	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: '+arguments.toString());
	//Parametre checks
	if(file_path == undefined) file_path = null;
	
	//Function
	if( file_path != null && typeof(file_path) === 'string' ){
		try{ 
			file_data = FileSystem.readFileSync( file_path, 'utf8' );
		} catch(error){
			_return = [-4, Utility.format('Error: reading file "%s": %s', file_path, error)];
		}
		if( _return[0] === 1 && file_data != null && typeof(file_data) === 'string' ){
			function_return = JSONIC_Parse_FileData( file_data );
			if( function_return[0] === 0 ){
				_return = function_return;
			} else{
				_return = [function_return[0], 'JSONIC_Parse_FileData: '+function_return[1]];
			}
		}
	} else{
		_return = [-2, 'Error: file_path is either null or not a string: '+file_path];
	}

	//Return
	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','returned: '+_return.toString());
	return _return;
}

//Exports and Execution
if(require.main === module){
	
} else{
	exports.SetLogger = Logger_Set;
	exports.ParseFileData = JSONIC_Parse_FileData;
	exports.ParseFilePath = JSONIC_Parse_FilePath;
}
