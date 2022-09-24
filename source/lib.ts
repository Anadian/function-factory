#!/usr/bin/env node

	//Standard
	import * as PathNS from 'node:path';
	import * as FSNS from 'node:fs';
	//External
	import * as HandleBars from 'handlebars';

function FunctionFactory( options ){
	if( !( this instanceof FunctionFactory ) ){
		return ( new FunctionFactory( options ) );
	}
	this.templateCache = ( this.templateCache || options.templateCache ) ?? ( {} );
	//Load and register helpers
	for( const path of this.helperPaths ){
		import( path ).then(
			( helperModule ) => {
				try{
					HandleBars.registerHelper( helperModule.helperName, helperModule.helperFunction );
				} catch(error){
					return_error = new Error(`HandleBars.registerHelper threw an error: ${error}`);
					throw return_error;
				}
			},
			( error ) => {
				return_error = new Error(`import threw an error: ${error}`);
				throw return_error;
			}
		);
	}
	//Load and register partials
	for( const path of this.partialPaths ){
		FSNS.promises.readFile( path, 'utf8' ).then(
			( file_string ) => {
				var name = '';
				try{
					name = PathNS.basename( path );
				} catch(error){
					return_error = new Error(`PathNS.basename threw an error: ${error}`);
					throw return_error;
				}
				try{
					HandleBars.registerPartial( name, file_string );
				} catch(error){
					return_error = new Error(`HandleBars.registerPartial threw an error: ${error}`);
					throw return_error;
				}
			},
			( error ) => {
				return_error = new Error(`FSNS.promises.readFile threw an error: ${error}`);
				throw return_error;
			}
		);
	}
	//Load PostREs
	//for( const postre of this.postREs );
	//Receive input context
		//Load template
	//Perform transform
	//Return output string
	return this;
}

FunctionFactory.prototype.transform = function( input: string | Promise<string>, options = {} ){
	try{
		input_context_object = HJSON.parse(input_string);
	} catch(error){
		return_error = new Error(`HJSON.parse threw an error: ${error}`);
	}
	try{
		template_function = getTemplateFunctionFromInputContextObject( input_context_object, options );
	} catch(error){
		return_error = new Error(`getTemplateFunctionFromInputContextObject threw an error: ${error}`);
	}
	if( template_function != null && typeof(template_function) === 'function' ){
		try{
			output_string = template_function( input_context_object );
			if( input_context_object.post_re != undefined && Array.isArray( input_context_object.post_re ) === true ){
				for( var i = 0; i < input_context_object.post_re.length; i++ ){
					var regex = new RegExp( input_context_object.post_re[i].search, input_context_object.post_re[i].flags );
					output_string = output_string.replace( regex, input_context_object.post_re[i].replace );
				}
			}
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `output_string: ${output_string}`});
		} catch(error){
			return_error = new Error(`template_function threw an error: ${error}`);
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
| string | The name literal string. |

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
			properly_seperated_name = PathNS.join( properly_seperated_name, name_parts_array[i] );
		}
		if( extension_string != '' && typeof(extension_string) === 'string' ){
			if( PathNS.extname(properly_seperated_name) !== extension_string ){
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
| Promise<function>? | The template function or `null` if it can't be found. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

Status:
| version | change |
| --- | --- |
| 5.0.0 | Massive rebuild |
| 1.9.0 | Introduced |
*/
function getTemplateFunctionFromFilePath( file_path, options = {} ){
	var arguments_array = Array.from(arguments);
	var _return = null;
	var return_error;
	const FUNCTION_NAME = 'getTemplateFunctionFromFilePath';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var template_function = null;
	//Parametre checks
	if( typeof(file_path) !== 'string' ){
		return_error = new TypeError('Param "file_path" is not string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	_return = FSNS.promises.readFile( file_path, 'utf8' ).then(
		( file_string ) => {
			try{
				template_function = HandleBars.compile( file_string );
			} catch(error){
				return_error = new Error(`HandleBars.compile threw an error: ${error}`);
				throw return_error;
			}
			return template_function;
		},
		( error ) => {
			return_error = new Error(`FSNS.promises.readFile threw an error: ${error}`);
			throw return_error;
		}
	);
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
				potential_path = PathNS.join( ConfigObject.template_directories[i], name_literal_string );
			} catch(error){
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `For loop index: ${i}: PathNS.join threw an error: ${error}`});
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

Status:
| version | change |
| --- | --- |
| 2.1.1 | Moved to HJSON |
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
	var default_input_object = {};
	var json_string = '';
	//Parametre checks
	if( typeof(file_path) !== 'string' ){
		return_error = new TypeError('Param "file_path" is not string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}

	//Function
	_return = FSNS.promises.readFile( file_path, 'utf8' ).then(
		( file_string ) => {
			try{
				default_input_object = HJSON.parse( file_string );
				try{
					json_string = JSON.stringify( default_input_object, null, '\t' );
				} catch(error){
					return_error = new Error(`JSON.stringify threw an error: ${error}`);
					Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `JSON.stringify threw: ${error}`});
					throw error;
				}
				return json_string;
			} catch(error){
				return_error = new Error(`HJSON.parse threw an error: ${error}`);
				throw return_error;
			}
		},
		( error ) => {
			return_error = new Error(`FSNS.promises.readFile threw an error: ${error}`);
			throw return_error;
		}
	);
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
				potential_path = PathNS.join( ConfigObject.defaults_directories[i], name_literal );
			} catch(error){
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `For loop index: ${i}: PathNS.join threw an error: ${error} PathNS.join received: ${ConfigObject.defaults_directories[i]}, ${name_literal}`});
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
