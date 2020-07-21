#!/usr/local/bin/node
'use strict';
/**
# [function-factory.js](source/main.js)
> Simple, minimalist templating from the command line.

Internal module name: `FunctionFactory`

Author: Anadian

Code license: MIT
```
	Copyright 2020 Anadian
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
```
Documentation License: [![Creative Commons License](https://i.creativecommons.org/l/by-sa/4.0/88x31.png)](http://creativecommons.org/licenses/by-sa/4.0/)
> The source-code comments and documentation are written in [GitHub Flavored Markdown](https://github.github.com/gfm/).

> The type notation used in this documentation is based off of the [Google Closure type system](https://github.com/google/closure-compiler/wiki/Types-in-the-Closure-Type-System).

> The status and feature lifecycle keywords used in this documentation are based off of my own standard [defined here](https://github.com/Anadian/FeatureLifeCycleStateStandard).
*/

//#Dependencies
	//##Internal
	//const JSONICParse = require('jsonic-parse');
	//##Standard
	const FileSystem = require('fs');
	const Path = require('path');
	//##External
	const MakeDir = require('make-dir');
	const HandleBars = require('handlebars');
	const Inquirer = require('inquirer');
	const GetStream = require('get-stream');
	const Clipboardy = require('clipboardy');
	const StripJSONComments = require('strip-json-comments');
	const ParseJSON = require('parse-json');

//#Constants
const FILENAME = 'function-factory.js';
const MODULE_NAME = 'FunctionFactory';
var PACKAGE_JSON = {};
var PROCESS_NAME = '';
if(require.main === module){
	PROCESS_NAME = 'function-factory';
} else{
	PROCESS_NAME = process.argv0;
}
//##Errors

//#Global Variables
var ConfigObject = {
	template_directories: [
		Path.join( 'Resources', 'templates' )
	],
	defaults_directories: [
		Path.join( 'Resources', 'defaults' )
	],
	helper_scripts: [
		Path.join( 'Resources', 'helpers', 'any.js' )
	],
	partial_scripts: [
		Path.joing( 'Resources', 'partials', 'any.js' )
	]
};
/* istanbul ignore next */
var Logger = { 
	log: () => {
		return null;
	}
};
//#Functions
/**
## Functions
*/
/**
### setLogger
> Allows this module's functions to log the given logger object.

Parametres:
| name | type | description |
| --- | --- | --- |
| logger | {?object} | The logger to be used for logging or `null` to disable logging. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if `logger` is neither an object nor `null` |

Status:
| version | change |
| --- | --- |
| 0.0.0 | Introduced |
*/
function setLogger( logger ){
	var return_error = null;
	//const FUNCTION_NAME = 'setLogger';
	//Variables
	//Parametre checks
	/* istanbul ignore else */
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
	}
	if( template_file_path != '' && typeof(template_file_path) === 'string' ){
		try{
			template_function = getTemplateFunctionFromFilePath( template_file_path, options );
		} catch(error){
			return_error = new Error(`getTemplateFunctionFromFilePath threw an error: ${error}`);
			throw return_error;
		}
	} else if( template_generic_name != '' && typeof(template_generic_name) === 'string' ){
		try{
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `Calling getTemplateFunctionFromGenericName with ${template_generic_name}`});
			template_function = getTemplateFunctionFromGenericName( template_generic_name, options );
		} catch(error){
			return_error = new Error(`getTemplateFunctionFromGenericName threw an error: ${error}`);
			throw return_error;
		}
	} else{
		return_error = new Error(`No template file path or generic name to work with.`);
		throw return_error;
	}
	if( template_function != null && typeof(template_function) === 'function' ){
		_return = template_function;
	} else if( template_function === null ){
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'warn', message: `No template function was found for the lookup string. template_generic_name: ${template_generic_name} template_file_path: ${template_file_path}`});
		_return = null;
	} else{
		return_error = new Error(`Received an unexpected non-function return value: ${template_function}`);
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
		return_error.code = 'ERR_INVALID_RETURN_VALUE';
		throw return_error;
	}

	//Return
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
}

/**
### getDefaultInputStringFromFilePath
> Returns the default input string after parsing the JSON file at the given path.

Parametres:
| name | type | description |
| --- | --- | --- |
| file_path | {string} | The path of the file to read and parse.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {string} | The file contents as a string. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |
| 'ERR_INVALID_RETURN_VALUE' | {Error} | Thrown if JSONICParse.ParseFilePath returns an error code. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Introduced |
*/
/* istanbul ignore next */
function getDefaultInputStringFromFilePath( file_path, options = {} ){
	var arguments_array = Array.from(arguments);
	var _return;
	var return_error;
	const FUNCTION_NAME = 'getDefaultInputStringFromFilePath';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var function_return = [1,null];
	//Parametre checks
	if( typeof(file_path) !== 'string' ){
		return_error = new TypeError('Param "file_path" is not string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	function_return = JSONICParse.ParseFilePath( file_path );
	if( function_return[0] === 0 ){
		try{
			_return = JSON.stringify(function_return[1],null,'\t');
		} catch(error){
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `JSON.stringify threw: ${error}`});
			throw error;
		}
	} else{
		return_error = new Error(`JSONICParse.ParseFilePath returned: ${function_return}`);
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
		return_error.code = 'ERR_INVALID_RETURN_VALUE';
		throw return_error;
	}

	//Return
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
}

/**
### getDefaultInputStringFromNameLiteral
> Returns the default input file data as a string or null if there is no default input file found.

Parametres:
| name | type | description |
| --- | --- | --- |
| name_literal | {string} | The name literal to lookup the default input for.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {string} | The default input string or not `null` if a default input file could not be found. |

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
function getDefaultInputStringFromNameLiteral( name_literal, options = {} ){
	var arguments_array = Array.from(arguments);
	var _return;
	var return_error;
	const FUNCTION_NAME = 'getDefaultInputStringFromNameLiteral';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var default_input_string = '';
	var potential_path = '';
	//Parametre checks
	if( typeof(name_literal) !== 'string' ){
		return_error = new TypeError('Param "name_literal" is not string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	try{
		default_input_string = getDefaultInputStringFromFilePath( name_literal, options );
	} catch(error){
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `getDefaultInputStringFromFilePath threw an error: ${error}`});
		default_input_string = null;
	}
	if( default_input_string != '' && typeof(default_input_string) === 'string' ){
		_return = default_input_string;
	} else{
		for( var i = 0; i < ConfigObject.defaults_directories.length; i++ ){
			try{
				potential_path = Path.join( ConfigObject.defaults_directories[i], name_literal );
			} catch(error){
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `For loop index: ${i}: Path.join threw an error: ${error} Path.join received: ${ConfigObject.defaults_directories[i]}, ${name_literal}`});
				throw error;
			}
			try{
				default_input_string = getDefaultInputStringFromFilePath( potential_path, options );
			} catch(error){
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `For loop index: ${i} getDefaultInputStringFromFilePath threw an error: ${error} getDefaultInputStringFromFilePath received: ${potential_path}, ${options}`});
				default_input_string = null;
			}
			if( default_input_string != '' && typeof(default_input_string) === 'string' ){
				i = ConfigObject.defaults_directories.length;
				_return = default_input_string;
			} 
		}
		if( default_input_string === null ){
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'warn', message: `No default input file could be found for name literal: ${name_literal}`});
			_return = null;
		}
	}

	//Return
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
}

/**
### getDefaultInputStringFromGenericName
> Returns the default input string matching the given template generic name.

Parametres:
| name | type | description |
| --- | --- | --- |
| template_generic_name | {string} | The template's generic name to lookup the default input string with.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {?string} | The default input string, likely in the Resources/defaults directory, matching the given generic name or null if not default-input file is found. |

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
function getDefaultInputStringFromGenericName( template_generic_name, options = {} ){
	var arguments_array = Array.from(arguments);
	var _return;
	var return_error;
	const FUNCTION_NAME = 'getDefaultInputStringFromGenericName';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var properly_seperated_name = '';
	var default_input_string = '';
	//Parametre checks
	if( typeof(template_generic_name) !== 'string' ){
		return_error = new TypeError('Param "template_generic_name" is not string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	try{
		properly_seperated_name = getNameLiteralFromGenericName( template_generic_name, '.json', options );
	} catch(error){
		return_error = new Error(`getNameLiteralFromGenericName threw an error: ${error}`);
		throw return_error;
	}
	try{
		default_input_string = getDefaultInputStringFromNameLiteral( properly_seperated_name, options );
		_return = default_input_string;
	} catch(error){
		return_error = new Error(`getDefaultInputStringFromNameLiteral threw an error: ${error}`);
		throw return_error;
	}

	//Return
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
}

/**
### getInputStringFromInquirerEditor
> Prompts the user to edit the input with $EDITOR, optionally loading default input data beforehand, and then returns the final input string.

Parametres:
| name | type | description |
| --- | --- | --- |
| options | {Object} | Run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {string} | The input string obtained from the editor. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |
| 'ERR_INVALID_RETURN_VALUE' | {TypeError} | Thrown if Inquirer.prompt returns an invalid `inquirer_answer` object, missing a string `editor_input` property or otherwise malformatted. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Experimental |
*/
/* istanbul ignore next */
async function getInputStringFromInquirerEditor( options = {} ){
	var arguments_array = Array.from(arguments);
	var _return;
	var return_error;
	const FUNCTION_NAME = 'getInputStringFromInquirerEditor';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var template_generic_name = '';
	var default_input_string = '';
	var inquirer_questions = [];
	var inquirer_answer = {};

	//Parametre checks
	if( options != null && typeof(options) !== 'object' ){
		return_error = new TypeError('Param "options" is either null or not an Object.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	if( options['template-override'] != null && typeof(options['template-override']) === 'string' ){
		template_generic_name = options['template-override'];
	} else if( options.edit != null && typeof(options.edit) === 'string' ){
		template_generic_name = options.edit;
	}
	try{
		default_input_string = getDefaultInputStringFromGenericName( template_generic_name, options );
	} catch(error){
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'warn', message: `getDefaultInputStringFromGenericName threw an error: ${error}`});
		default_input_string = '';
	}
	inquirer_questions = [
		{
			type: 'editor',
			name: 'editor_input',
			message: 'Enter input context (JSON).',
			default: default_input_string
		}
	];
	try{
		inquirer_answer = await Inquirer.prompt( inquirer_questions );
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `inquirer_answer: ${inquirer_answer}`});
	} catch(error){
		return_error = new Error(`Inquirer.prompt threw an error: ${error}`);
		throw return_error;
	}
	if( inquirer_answer.editor_input != '' && typeof(inquirer_answer.editor_input) === 'string' ){
		_return = inquirer_answer.editor_input;
	} else{
		return_error = new TypeError(`'inquirer_answer.editor_input' is either null or not a string. 'editor_input': ${inquirer_answer.editor_input} 'inquirer_answer': ${inquirer_answer}`);
		return_error.code = 'ERR_INVALID_RETURN_VALUE';
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
		throw return_error;
	}

	//Return
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
}

/**
### main_Async (private)
> The main function when the script is run as an executable without the `--test` command-line option. Not exported and should never be manually called.

Parametres:
| name | type | description |
| --- | --- | --- |
| options | {?options} | An object representing the command-line options. \[default: {}\] |

Status:
| version | change |
| --- | --- |
| 0.0.1 | Introduced |
*/
/* istanbul ignore next */
async function main_Async( options = {} ){
	var arguments_array = Array.from(arguments);
	var return_error = null;
	const FUNCTION_NAME = 'main_Async';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var input_string = '';
	var cleaned_json_string = '';
	var input_context_object = {};
	var template_function = null;
	var output_string = '';
	//Parametre checks
	//Function
	//Taken from old_main.js; should be updated.################################################################################
		HandleBars.registerHelper('CheckType', function CheckType_HandleBarsHelper( type, name ){
			var _return = null;
			if( type === 'Array' ){
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
	///Input
	if( options.stdin === true ){
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'info', message: 'Reading input from STDIN.'});
		try{
			input_string = await GetStream( process.stdin, 'utf8' );
		} catch(error){
			return_error = new Error(`GetStream threw an error: ${error}`);
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
		}
	} else if( options.input != null ){
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'info', message: 'Reading input from a file.'});
		if( typeof(options.input) === 'string' ){
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `options.input: '${options.input}'`});
			try{
				input_string = FileSystem.readFileSync( options.input, 'utf8' );
			} catch(error){
				return_error = new Error(`FileSystem.readFileSync threw an error: ${error}`);
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
			}
		} else{
			return_error = new Error('"options.input" is not a string.');
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
		}
	} else if( options.edit != null ){
		try{
			input_string = await getInputStringFromInquirerEditor( options );
		} catch(error){
			return_error = new Error(`getInputStringFromInquirerEditor threw an error: ${error}`);
			throw return_error;
		}
	} else{
		return_error = new Error('No input options specified.');
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
	}
	///Transform
	if( return_error === null ){
		if( input_string !== '' && typeof(input_string) === 'string' ){
			try{
				cleaned_json_string = StripJSONComments( input_string )
			} catch(error){
				return_error = new Error(`StripJSONComments threw an error: ${error}`);
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
			}
			try{
				input_context_object = ParseJSON( cleaned_json_string );
			} catch(error){
				return_error = new Error(`ParseJSON threw an error: ${error}`);
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error});
			}
			try{
				template_function = getTemplateFunctionFromInputContextObject( input_context_object, options );
			} catch(error){
				return_error = new Error(`getTemplateFunctionFromInputContextObject threw an error: ${error}`);
			}
			if( template_function != null && typeof(template_function) === 'function' ){
				try{
					output_string = template_function( input_context_object );
					Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `output_string: ${output_string}`});
				} catch(error){
					return_error = new Error(`template_function threw an error: ${error}`);
				}
			}
		} else{
			return_error = new Error('input_string is either null or not a string.');
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
		}
	}
	///Output
	if( return_error === null ){
		if( output_string != '' && typeof(output_string) === 'string' ){
			if( options.output != null && typeof(output_string) === 'string' ){
				try{
					FileSystem.writeFileSync( options.output, output_string, 'utf8' );
				} catch(error){
					return_error = new Error(`FileSystem.writeFileSync threw an error: ${error}`);
					Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
				}
			} else if( options.pasteboard === true ){
				try{
					Clipboardy.writeSync( output_string );
				} catch(error){
					return_error = new Error(`Clipboardy.writeSync threw an error: '${error}' when trying to write '${output_string}'`);
				}
			} else{
				if( options.stdout !== true ){
					Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'warn', message: 'No output options specified; defaulting to STDOUT.'});
				}
				console.log(output_string);
			}
		} else{
			return_error = new Error('"output_string" is either null or not a string.');
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
		}
	}

	//Return
	if( return_error !== null ){
		process.exitCode = 1;
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'crit', message: return_error.message});
	}
}

/**
### main_Async_Test (private)
> The main function when the script is run as an executable **with** the `--test` command-line option. Runs all of the other `*_Test()`-type unit-test functions in this module. Not exported and should never be manually called.

Parametres:
| name | type | description |
| --- | --- | --- |
| options | {?options} | An object representing the command-line options. \[default: {}\] |

Status:
| version | change |
| --- | --- |
| 0.0.1 | Introduced |
*/
/* istanbul ignore next */
async function main_Async_Test(){
	const FUNCTION_NAME = 'main_Async_Test';
	//Variables
	var _return = false;
	var return_error = null;
	//Tests
	try{
	} catch(error){
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'crit', message: `Test failed with error: '${error}'`});
		process.exitCode = 4;
	}
	//Return
	return _return;
}
//#Exports and Execution
if(require.main === module){
	var _return = [1,null];
	const FUNCTION_NAME = 'MainExecutionFunction';
	//##Dependencies
		//###Internal
		//###Standard
		const Path = require('path');
		//###External
		const ApplicationLogWinstonInterface = require('application-log-winston-interface');
		const EnvPaths = require('env-paths');
		const CommandLineArgs = require('command-line-args');
		const CommandLineUsage = require('command-line-usage');
	//Constants
	const EnvironmentPaths = EnvPaths( PROCESS_NAME );
	const OptionDefinitions = [
		//UI
		{ name: 'help', alias: 'h', type: Boolean, description: 'Writes this help text to STDOUT.' },
		{ name: 'noop', alias: 'n', type: Boolean, description: '[Reserved] Show what would be done without actually doing it.' },
		{ name: 'verbose', alias: 'v', type: Boolean, description: 'Verbose output to STDERR.' },
		{ name: 'version', alias: 'V', type: Boolean, description: 'Writes version information to STDOUT.' },
		{ name: 'no-quick-exit', alias: 'x', type: Boolean, description: 'Don\'t immediately exit after printing help, version, and/or config information.' },
		//Input
		{ name: 'stdin', alias: 'i', type: Boolean, description: 'Read input from STDIN.' },
		{ name: 'input', alias: 'I', type: String, description: 'The path to the file to read input from.' },
		{ name: 'edit', alias: 'e', type: String, description: 'Edit the input in $EDITOR, optionally specifying a file in the "defaults" directory to use as a base.' },
		{ name: 'ask', alias: 'a', type: String, description: '[Reserved] Interactively prompt for input properties, optionally specifying a file in the "defaults" directory to use as a base.' },
		{ name: 'do', alias: 'D', type: String, defaultOption: true, description: '[Reserved] Select a default input file and an output template based on a signle string.' },
		{ name: 'test', alias: 't', type: Boolean, description: 'Run unit tests and exit.' },
		//Output
		{ name: 'stdout', alias: 'o', type: Boolean, description: 'Write output to STDOUT.' },
		{ name: 'output', alias: 'O', type: String, description: 'The name of the file to write output to.' },
		{ name: 'pasteboard', alias: 'p', type: Boolean, description: 'Copy output to pasteboard (clipboard).' },
		//Config
		{ name: 'config', alias: 'c', type: Boolean, description: 'Print search paths and configuration values to STDOUT.' },
		{ name: 'config-file', alias: 'C', type: String, description: '[Resevred] Use the given config file instead of the default.' },
		{ name: 'defaults', alias: 'd', type: Boolean, description: '[Reserved] Print a list of the "defaults" files.' },
		{ name: 'templates', alias: 'l', type: Boolean, description: '[Reserved] Print a list of available templates to stdout.' },
		{ name: 'template-override', alias: 'T', type: String, description: 'Override the template to the file specified.' }
	];
	//Variables
	var function_return = [1,null];
	var return_error = null;
	var quick_exit = false;
	var config_filepath = '';
	var source_dirname = '';
	var parent_dirname = '';
	var package_path = '';
	//Logger
	try{ 
		MakeDir.sync( EnvironmentPaths.log );
	} catch(error)/* istanbul ignore next */{
		console.error('MakeDir.sync threw: %s', error);
	}
	function_return = ApplicationLogWinstonInterface.InitLogger('debug.log', EnvironmentPaths.log);
	if( function_return[0] === 0 ){
		setLogger( function_return[1] );
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'Start of execution block.'});
	//Options
	var Options = CommandLineArgs( OptionDefinitions );
	//Config
	try{
		ConfigObject.template_directories.push( Path.join( EnvironmentPaths.data, 'templates' ) );
		ConfigObject.defaults_directories.push( Path.join( EnvironmentPaths.data, 'defaults' ) );
		/* istanbul ignore next */
		if( Options['config-file'] != null && typeof(Options['config-file']) === 'string' ){
			config_filepath = Options['config-file'];
		} else{
			config_filepath = Path.join( EnvironmentPaths.config, 'config.json' );
		}
		try{
			loadConfigObjectFromFilePath( config_filepath );
		} catch(error)/* istanbul ignore next */{
			return_error = new Error(`loadConfigObjectFromFilePath threw an error: ${error}`);
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'warn', message: `A recoverable error occurred while atempting to load the config file at '${config_filepath}': '${return_error}' Attempting to create a new config file at the path....`});
			try{
				saveConfigObjectToFilePath( config_filepath );
			} catch(error){
				return_error = new Error(`saveConfigObjectToFilePath threw an error: ${error}`);
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.toString()});
			}
		}
	} catch(error)/* istanbul ignore next */{
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `Caught an unhandled error while setting config: ${error}`});
	}
	/* istanbul ignore next */
	if( Options.verbose === true ){
		Logger.real_transports.console_stderr.level = 'debug';
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'note', message: `Logger: console_stderr transport log level set to: ${Logger.real_transports.console_stderr.level}`});
	}
	///Load package.json
	try{
		source_dirname = Path.dirname( module.filename );
		package_path = Path.join( source_dirname, 'package.json' );
		PACKAGE_JSON = require(package_path);
	} catch(error)/*istanbul ignore next*/{
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `Soft error: ${error}`});
		try{
			parent_dirname = Path.dirname( source_dirname );
			package_path = Path.join( parent_dirname, 'package.json' );
			PACKAGE_JSON = require(package_path);
		} catch(error){
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `Soft error: ${error}`});
		}
	}
	//Main
	/* istanbul ignore next */
	if( Options.version === true ){
		console.log(PACKAGE_JSON.version);
		quick_exit = true;
	}
	/* istanbul ignore next */
	if( Options.help === true ){
		const help_sections_array = [
			{
				header: 'function-factory',
				content: 'Simple, minimalist templating from the command line.',
			},
			{
				header: 'Options',
				optionList: OptionDefinitions
			}
		]
		const help_message = CommandLineUsage(help_sections_array);
		console.log(help_message);
		quick_exit = true;
	}
	/* istanbul ignore next */
	if( Options.config === true ){
		console.log('Paths: ', EnvironmentPaths);
		console.log('Config: ', ConfigObject);
		quick_exit = true;
	}
	if( quick_exit === false || Options['no-quick-exit'] === true ){
		/* istanbul ignore else */
		if( Options.test === true ){
			main_Async_Test();
		} else{
			main_Async( Options );
		}
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'End of execution block.'});
} else{
	exports.setLogger = setLogger;
}

