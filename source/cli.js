#!/usr/bin/env node
//Dependencies
	//Internal
	import ConfigObject from './source/config.js';
	//Standard
	import * as PathNS from 'node:path';
	import * as FSNS from 'node:fs';
	//External
	import getPackageMeta from 'simple-package-meta';
	import * as ApplicationLogWinstonInterface from 'application-log-winston-interface';
	import * as Inquirer from 'inquirer';
	import * as GetStream from 'get-stream';
	import * as Clipboardy from 'clipboardy';
	import * as CommandLineArgs from 'command-line-args';
	import * as CommandLineUsage from 'command-line-usage';

function CLI( options ){
	if( !( this instanceof CLI ) ){
		return ( new CLI( options ) );
	}
	this,packageMeta = null;
	this.logger = ApplicationLogWinstonInterface.nullLogger;
	this,configObject = new ConfigObject();
	this.OptionDefinitions = [
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
		{ name: 'do', alias: 'D', type: String, defaultOption: true, description: '[Reserved] Select a default input file and an output template based on a single string.' },
		//{ name: 'test', alias: 't', type: Boolean, description: 'Run unit tests and exit.' },
		//Output
		{ name: 'stdout', alias: 'o', type: Boolean, description: 'Write output to STDOUT.' },
		{ name: 'output', alias: 'O', type: String, description: 'The name of the file to write output to.' },
		{ name: 'pasteboard', alias: 'p', type: Boolean, description: 'Copy output to pasteboard (clipboard).' },
		//Config
		{ name: 'config', alias: 'c', type: Boolean, description: 'Print search paths and configuration values to STDOUT.' },
		{ name: 'config-file', alias: 'C', type: String, description: 'Use the given config file instead of the default.' },
		{ name: 'defaults', alias: 'd', type: Boolean, description: '[Reserved] Print a list of the "defaults" files.' },
		{ name: 'templates', alias: 'l', type: Boolean, description: '[Reserved] Print a list of available templates to stdout.' },
		{ name: 'template-override', alias: 'T', type: String, description: 'Override the template to the file specified.' }
	];
	return this;
}

CLI.start = function( options = {} ){
	var return_error = null;
	var cli = new CLI( options );
	var packageMeta_promise = getPackageMeta( import.meta );
	cli.packageMeta = await packageMeta_promise;
	var mkDir_promise = FSNS.promises.mkdir( packageMetaObject.paths.log, { recursive: true } );
	mkDir_promise.then(
		() => {
			try{
				cli.logger = ApplicationLogWinstonInterface.initWinstonLogger( 'debug.log', cli.packageMeta.paths.log );
			} catch( error ){
				return_error = new Error(`Error: ApplicationLogWinstonInterface.initWinstonLogger threw an error: ${error}`);
				throw return_error;
			}
		},
		( error ) => {
			return_error = new Error(`Error: FSNS.promises.mkdir threw an error: ${error}`);
			throw return_error;
		}
	);
	cli.options = CommandLineArgs( cli.OptionDefinitions );
	try{
		cli.configObject.template_directories.push( PathNS.join( EnvironmentPaths.data, 'templates' ) );
		cli.configObject.defaults_directories.push( PathNS.join( EnvironmentPaths.data, 'defaults' ) );
		cli.configObject.helper_scripts.push( PathNS.join( EnvironmentPaths.data,	'helpers' ) );	
		cli.configObject.partial_scripts.push( PathNS.join( EnvironmentPaths.data, 'partials' ) );
		if( cli.options['config-file'] != null && typeof(cli.options['config-file']) === 'string' ){
			config_filepath = cli.options['config-file'];
		} else{
			config_filepath = PathNS.join( packageMeta.paths.config, 'config.json' );
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
	} catch(error){
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `Caught an unhandled error while setting config: ${error}`});
	}

}


//Global Constants
Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'Start of execution block.'});
//Options
//Config
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
			/*try{
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
			}*/
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

//#Exports and Execution
var _return = [1,null];
const FUNCTION_NAME = 'MainExecutionFunction';
//##Dependencies
	//###Internal
	//###Standard
	const Path = require('path');
	//###External
//Constants

//Variables
var function_return = [1,null];
var logger = null;
var return_error = null;
var quick_exit = false;
var config_filepath = '';
var source_dirname = '';
var parent_dirname = '';
var package_path = '';
//Logger
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
