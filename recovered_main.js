#!/usr/local/bin/node
'use strict';

/**
* @file function-factory.js
* @brief Quick, minimalist text-templating from the command line.
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
	const JSONICParse = require('jsonic-parse');
	const ApplicationLogStandard = require('./application-log-standard.js');
	//Standard
	const FileSystem = require('fs');
	const Path = require('path');
	const Utility = require('util');
	//External
	const HandleBars = require('handlebars');
	const Inquirer = require('inquirer');
	const GetStream = require('get-stream');
	const Clipboardy = require('clipboardy');
	/*const LogForm = require('logform');
	const Winston = require('winston');*/

//Constants
const FILENAME = 'function-factory.js';
const MODULE_NAME = 'FunctionFactory';
var PROCESS_NAME = '';
if(require.main === module){
	PROCESS_NAME = 'function-factory';
} else{
	PROCESS_NAME = process.argv0;
}

var ConfigObject = {
	template_directories: [
		Path.join( 'Resources', 'templates' )
	],
	defaults_directories: [
		Path.join( 'Resources', 'defaults' )
	]
};

var Logger = null;

//Functions
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

function Safe_Directory_Create_Sync( directory_path ){
	var _return = [1,null];
	if( directory_path != null && typeof(directory_path) === 'string' ){
		try{
			FileSystem.mkdirSync( directory_path, { recursive: true } );
			_return = [0,null];
		} catch(error){
			_return = [-3, Utility.format('Warn: %s', error)];
		}
	} else{
		_return = [-2, Utility.format('Error: directory_path is either null or not a string: %o', directory_path)];
	}
	return _return;
}
function ConfigObject_Load( config_filename ){
	var _return = [1,null];
	const FUNCTION_NAME = 'ConfigObject_Load';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('ConfigObject_Load received: %o', arguments)});
	var function_return = [1,null];
	if( config_filename != null && typeof(config_filename) === "string" ){
		try{
			FileSystem.accessSync( config_filename, (FileSystem.constants.R_OK | FileSystem.constants.W_OK) );
			function_return[0] = 0;
		} catch(error){
	if( typeof(logger) === 'object' ){
		/* istanbul ignore next */
		if( logger === null ){
			logger = { 
				log: () => {
					return null;
				}
			};
		}
	} else{
		return_error = new TypeError('Param "logger" is not an object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	Logger = logger;
	//Return
}
/**
### loadConfigObjectFromFilePath
> Reads the given filepath and sets the global configuration object to the contained JSON value.

Parametres:
| name | type | description |
| --- | --- | --- |
| config_filepath | {string} | The path of the JSON file to be parsed for config values.  |
| options | {?Object} | Additional run-time options. \[default: {}\] |


Returns:
| type | description |
| --- | --- |
| {object} | The current config object value, after attempting to parse the given file. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |
| 'ERR_INVALID_RETURN_VALUE' | {Error} | Thrown if parsing the file as JSONIC fails. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Experimental |
*/
/* istanbul ignore next */
function loadConfigObjectFromFilePath( config_filepath, options = {} ){
	var arguments_array = Array.from(arguments);
	var _return;
	var return_error;
	const FUNCTION_NAME = 'loadConfigObjectFromFilePath';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var function_return = [1, null];
	var have_readwrite_permissions = false;
	//Parametre checks
	if( typeof(config_filepath) !== 'string' ){
		return_error = new TypeError('Param "config_filepath" is not a string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	try{
		FileSystem.accessSync( config_filepath, (FileSystem.constants.R_OK | FileSystem.constants.W_OK) );
		have_readwrite_permissions = true;
	} catch(error){
		return_error = new Error(`FileSystem.accessSync threw an error: ${error}`);
		throw return_error;
	}
	if( have_readwrite_permissions === true ){
		function_return = JSONICParse.ParseFilePath(config_filepath);
		if( function_return[0] === 0 ){
			ConfigObject = function_return[1];
			_return = function_return[1];
		} else{
			return_error = new Error(`JSONICParse.ParseFilePath returned an error value: ${function_return}`);
			return_error.code = 'ERR_INVALID_RETURN_VALUE';
			throw return_error;
		}
	}

	//Return
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
}
/**
### saveConfigObjectToFilePath
> Saves the current ConfigObject to the given filepath.

Parametres:
| name | type | description |
| --- | --- | --- |
| filepath_string | {string} | The filepath destination to save the configuration to.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Experimental |
*/
/* istanbul ignore next */
function saveConfigObjectToFilePath( filepath_string, options = {} ){
	var arguments_array = Array.from(arguments);
	var return_error;
	const FUNCTION_NAME = 'saveConfigObjectToFilePath';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var config_directory = '';
	var config_json_string = '';
	//Parametre checks
	if( typeof(filepath_string) !== 'string' ){
		return_error = new TypeError('Param "filepath_string" is not a string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	//Function
	try{
		config_directory = Path.dirname( filepath_string );
	} catch(error){
		return_error = new Error(`Path.dirname threw an error: ${error}`);
		throw return_error;
	}
	try{
		MakeDir.sync(config_directory);
	} catch(error){
		return_error = new Error(`MakeDir.sync threw an error: ${error}`);
		throw return_error;
	}
	try{
		config_json_string = JSON.stringify(ConfigObject, null, '\t');
	} catch(error){
		return_error = new Error(`JSON.stringify threw an error: ${error}`);
		throw return_error;
	}
	try{
		FileSystem.writeFileSync( filepath_string, config_json_string, 'utf8' );
	} catch(error){
		return_error = new Error(`FileSystem.writeFileSync threw an error: ${error}`);
		throw return_error;
	}
}

/**
### getNameLiteralFromGenericName
> Ensures the given input_string is a generic name and returns a string guaranteed to be a name literal.

Parametres:
| name | type | description |
| --- | --- | --- |
| input_string | {string} | The generic name input string to be coverted to a name literal string.  |
| extension_string | {?string} | An optional string which, if specified, is used as a file extension to be appended to the name literal string if it's not already present. \[default: ''\] |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {string} | The name literal string. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Introduced |
*/
function getNameLiteralFromGenericName( input_string, extension_string = '', options = {} ){
	var arguments_array = Array.from(arguments);
	var _return;
	var return_error;
	const FUNCTION_NAME = 'getNameLiteralFromGenericName';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var new_name = '';
	var name_parts_array = [];
	var properly_seperated_name = '';
	//Parametre checks
	if( typeof(input_string) !== 'string' ){
		return_error = new TypeError('Param "input_string" is not string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	if( typeof(extension_string) !== 'string' ){
		return_error = new TypeError('Param "extension_string" is not string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	try{
		new_name = input_string.replace( /[/\\]/g, ' ');
		name_parts_array = new_name.split(' ');
		properly_seperated_name = name_parts_array[0];
		for( var i = 1; i < name_parts_array.length; i++ ){
			properly_seperated_name = Path.join( properly_seperated_name, name_parts_array[i] );
		}
		if( extension_string != '' && typeof(extension_string) === 'string' ){
			if( Path.extname(properly_seperated_name) !== extension_string ){
				properly_seperated_name += extension_string;
			}
		}
		_return = properly_seperated_name;
	} catch(error)/* istanbul ignore next */{
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `Caught an unhandled error: ${error}`});
		throw error;
	}

	//Return
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
}

/**
### getNameLiteralFromGenericName_Test (private)
> Tests [getNameLiteralFromGenericName](#getNameLiteralFromGenericName); this function is not exported and should only be used internally by this module. 
 
Returns:
| type | description |
| --- | --- |
| {boolean} | Returns `true` if all tests pass successfully. |

Throws:
| code | type | condition |
| --- | --- | --- |
| any | {Error} | Thrown if a test fails. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Introduced |
*/
function getNameLiteralFromGenericName_Test(){
	const FUNCTION_NAME = 'getNameLiteralFromGenericName_Test';
	//Variables
	var _return = false;
	var return_error = null;
	//Tests
	//Return
	return _return;
}

/**
### getTemplateFunctionFromFilePath (private)
> Returns the template function from the given file path or `null` if not found.

Parametres:
| name | type | description |
| --- | --- | --- |
| file_path | {string} | The file path of the [HandleBars](https://handlebarsjs.com/) template to load.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {?Function} | The template function or `null` if it can't be found. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Introduced |
*/
/* istanbul ignore next */
function getTemplateFunctionFromFilePath( file_path, options = {} ){
	var arguments_array = Array.from(arguments);
	var _return;
	var return_error;
	const FUNCTION_NAME = 'getTemplateFunctionFromFilePath';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var file_readable = false;
	var file_string = '';
	var template_function = null;
	//Parametre checks
	if( typeof(file_path) !== 'string' ){
		return_error = new TypeError('Param "file_path" is not string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	try{
		FileSystem.accessSync( file_path, FileSystem.constants.R_OK );
		file_readable = true;
	} catch(error){
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `FileSystem.accessSync threw an error: ${error}`});
		file_readable = false;
		_return = null;
	}
	if( file_readable === true ){
		try{
			file_string = FileSystem.readFileSync( file_path, 'utf8' );
		} catch(error){
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `FileSystem.readFileSync threw an error: ${error}`});
			file_string = '';
			_return = null;
		}
	}
	if( file_string != '' && typeof(file_string) === 'string' ){
		try{
			template_function = HandleBars.compile( file_string );
		} catch(error){
			return_error = new Error(`HandleBars.compile threw an error: ${error}`);
			throw return_error;
		}
	}
	if( template_function != null && typeof(template_function) === 'function' ){
		_return = template_function;
	} else{
		_return = null;
	}

	//Return
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
}
/**
### getTemplateFunctionFromNameLiteral (private)
> Returns the template function from the given name literal string or `null` if none are found.

Parametres:
| name | type | description |
| --- | --- | --- |
| name_literal_string | {string} | The name literal as a string.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {?Function} | The found template function or `null` otherwise. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Introduced |
*/
/* istanbul ignore next */
function getTemplateFunctionFromNameLiteral( name_literal_string, options = {} ){
	var arguments_array = Array.from(arguments);
	var _return;
	var return_error;
	const FUNCTION_NAME = 'getTemplateFunctionFromNameLiteral';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var template_function = null;
	var potential_path = '';
	var success = false;
	//Parametre checks
	if( typeof(name_literal_string) !== 'string' ){
		return_error = new TypeError('Param "name_literal_string" is not string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	try{
		template_function = getTemplateFunctionFromFilePath( name_literal_string, options );
	} catch(error){
		return_error = new Error(`getTemplateFunctionFromFilePath threw an error: ${error}`);
		throw return_error;
	}
	if( template_function != null && typeof(template_function) === 'string' ){
		_return = template_function;
	} else{
		for( var i = 0; i < ConfigObject.template_directories.length; i++ ){
			try{
				potential_path = Path.join( ConfigObject.template_directories[i], name_literal_string );
			} catch(error){
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `For loop index: ${i}: Path.join threw an error: ${error}`});
			}
			if( potential_path != '' && typeof(potential_path) === 'string' ){
				try{
					template_function = getTemplateFunctionFromFilePath( potential_path, options );
				} catch(error){
					Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `For loop index: ${i}: getTemplateFunctionFromFilePath threw an error: ${error}`});
				}
			}
			if( template_function != null && typeof(template_function) === 'function' ){
				success = true;
				i = ConfigObject.template_directories.length;
			}
		}
		if( success === true ){
			_return = template_function;
		} else{
			_return = null;
		}
	}

	//Return
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
}

/**
### getTemplateFunctionfromGenericName
> Returns the template function matching the given generic name or `null` if none are found.

Parametres:
| name | type | description |
| --- | --- | --- |
| generic_name_string | {string} | The generic name to use to find the template function.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {?Function} | The template function if found or `null` otherwise. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Introduced |
*/
/* istanbul ignore next */
function getTemplateFunctionFromGenericName( generic_name_string, options = {} ){
	var arguments_array = Array.from(arguments);
	var _return;
	var return_error;
	const FUNCTION_NAME = 'getTemplateFunctionfromGenericName';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var name_literal = '';
	var template_function = null;
	//Parametre checks
	if( typeof(generic_name_string) !== 'string' ){
		return_error = new TypeError('Param "generic_name_string" is not string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	try{
		name_literal = getNameLiteralFromGenericName( generic_name_string, '.hbs', options );
	} catch(error){
		return_error = new Error(`getNameLiteralFromGenericName threw an error: ${error}`);
		throw return_error;
	}
	if( name_literal != '' && typeof(name_literal) === 'string' ){
		try{
			template_function = getTemplateFunctionFromNameLiteral( name_literal, options );
		} catch(error){
			return_error = new Error(`getTemplateFunctionFromNameLiteral threw an error: ${error}`);
			throw return_error;
		}
	}
	if( template_function != null && typeof(template_function) === 'function' ){
		_return = template_function;
	} else{
		_return = null;
	}

	//Return
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
}

/**
### getTemplateFunctionFromInputContextObject
> Returns the template function derived from either the given input context object or the run-time options object.

Parametres:
| name | type | description |
| --- | --- | --- |
| input_context_object | {Object} | The input context object.  |
| options | {?Object} | Additional run-time options. If a property `template-override` is specified, its value will be used to lookup the template function instead of the input context object. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {?Function} | The template function if found, or `null` otherwise. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |
| 'ERR_INVALID_ARG_VALUE' | {Error} | Thrown if no options or properties in the given objects specify a template to lookup. |
| 'ERR_INVALID_RETURN_VALUE' | {Error} | Thrown if this function receives an invalid return value from `getTemplateFunctionFromGenericName` or `getTemplateFunctionFromFilePath`. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Introduced |
*/
/* istanbul ignore next */
function getTemplateFunctionFromInputContextObject( input_context_object, options = {} ){
	var arguments_array = Array.from(arguments);
	var _return;
	var return_error;
	const FUNCTION_NAME = 'getTemplateFunctionFromInputContextObject';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var template_generic_name = '';
	var template_file_path = '';
	var template_function = null;
	//Parametre checks
	if( typeof(input_context_object) !== 'object' ){
		return_error = new TypeError('Param "input_context_object" is not Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	//Function
	if( options['template-override'] != null && typeof(options['template-override']) === 'string' ){
		template_generic_name = options['template-override'];
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'info', message: `Using template generic name from 'template-override' option: ${template_generic_name}`});
	} else if( options['edit'] != null && typeof(options['edit']) === 'string' ){
		template_generic_name = options.edit;
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'info', message: `Using template generic name from 'edit' option: ${template_generic_name}`});
	} else if( input_context_object.template != null && typeof(input_context_object.template) === 'string' ){
		template_generic_name = input_context_object.template;
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'info', message: `Using template generic name from 'template' property in the input context object: ${template_generic_name}`});
	} else if( input_context_object.templatename != null && typeof(input_context_object.templatename) === 'string' ){
		template_file_path = input_context_object.templatename;
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'warn', message: `Using template file path literal from the 'templatename' property in the input context object: '${template_file_path}' This property is deprecated and it's recommended you use the 'template' generic name property instead.`});
	} else{
		return_error = new Error(`No template-specifying options were found in the run-time options and no template-specifying properties were found in the input_context object. input_context_object: ${input_context_object} options: ${options}`);
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
		return_error.code = 'ERR_INVALID_ARG_VALUE';
		throw return_error;
				_return = `Array.isArray(${name}) === true`;
			} else if( type === 'Buffer' ){
				_return = `Buffer.isBuffer(${name}) === true`;
			} else{
				_return = `typeof(${name}) === '${type.replace(/[?!| ]/g, '').toLowerCase()}'`;
			}
			return _return;
		} );
		HandleBars.registerHelper('CheckNotType', function CheckNotType_HandleBarsHelper( type, name ){
			var _return = null;
			if( type === 'Array' ){
				_return = `Array.isArray(${name}) === false`;
			} else if( type === 'Buffer' ){
				_return = `Buffer.isBuffer(${name}) === false`;
			} else{
				_return = `typeof(${name}) !== '${type.replace(/[?!| ]/g, '').toLowerCase()}'`;
			}
			return _return;
		} );
		HandleBars.registerHelper('upper_first', function UpperFirst_HandleBarsHelper( short_description ){
			var _return = null;
			if( typeof(short_description) === 'string' ){
				var first_letter = short_description.charAt(0);
				var rest_of_string = short_description.substring(1);
				_return = first_letter.toUpperCase()+rest_of_string;
			}
			return _return;
		} );
		HandleBars.registerHelper('lower_first', function LowerFirst_HandleBarsHelper( short_description ){
			var _return = null;
			if( typeof(short_description) === 'string' ){
				var first_letter = short_description.charAt(0);
				var rest_of_string = short_description.substring(1);
				_return = first_letter.toLowerCase()+rest_of_string;
			}
			return _return;
		} );

		if( Options.edit !== undefined ){
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'info', message: 'In editor mode.'});
			_return = Input_Inquirer_Editor( Options );
		} else if( Options.stdin !== undefined ){
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'info', message: 'In stdin mode.'});
			_return = Input_STDIN( Options );
		} else if( Options.input !== undefined ){
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'info', message: 'In file input mode.'});
			if( typeof(Options.input) === 'string' ){
				function_return = JSONICParse.ParseFilePath( Options.input );
				if( function_return[0] === 0 ){
					function_return = OutputFromInput(function_return[1]);
					if( function_return[0] === 0 ){
						function_return = ProduceOutput(function_return[1], Options);
						if( function_return[0] === 0 ){
							_return = [0,null];
						} else{
							_return = [function_return[0], 'ProduceOutput: '+function_return[1]];
						}
					} else{
						_return = [function_return[0], 'OutputFromInput: '+function_return[1]];
					}
				} else{
					_return = [function_return[0], 'JSONICParse.ParseFilePath: '+function_return[1]];
				}
			} else{
				_return = [-4, 'Error: "input" isn\'t a string.'];
			}
			process.exitCode = _return[0];
			if( _return[0] !== 0 ){
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: Utility.format('%o',_return)});
			}
		} else{
			_return = [-2, 'Error: no input option specified.'];
			process.exitCode = _return[0];
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: Utility.format('%o',_return)});
		}
	}
	process.exitCode = _return[0];
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'End of execution block.'});
} else{
	
}
