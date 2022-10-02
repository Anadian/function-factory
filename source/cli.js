#!/usr/bin/env node
//Dependencies
	//Internal
	import ConfigObject from './config.js';
	import FunctionFactory from './lib.js';
	//Standard
	import * as PathNS from 'node:path';
	import * as FSNS from 'node:fs';
	import * as Utility from 'node:util';
	//External
	import getPackageMeta from 'simple-package-meta';
	import * as ApplicationLogWinstonInterface from 'application-log-winston-interface';
	import Inquirer from 'inquirer';
	import * as GetStream from 'get-stream';
	import Clipboardy from 'clipboardy';
	import CommandLineArgs from 'command-line-args';
	import CommandLineUsage from 'command-line-usage';
import ConfigManager from './config.js';

const PROCESS_NAME = 'function-factory';
const MODULE_NAME = 'CLI';
const FILENAME = 'cli.js';

function CLI( options = {} ){
	if( !( this instanceof CLI ) ){
		return ( new CLI( options ) );
	}
	this.packageMeta = ( this.packageMeta || options.packageMeta ) ?? ( null );
	this.logger = ( this.logger || options.logger ) ?? ( ApplicationLogWinstonInterface.nullLogger );
	this.config = ( this.config || options.config ) ?? ( null );
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

CLI.run = async function( options = {} ){
	const FUNCTION_NAME = 'CLI.run';
	var return_error = null;
	var cli = new CLI( options );
	var run_promise;
	var input_string_promise;
	var output_string;
	var output_promise;
	//Init
	var packageMeta = getPackageMeta( import.meta );
	cli.packageMeta = await packageMeta;
	var mkDir_promise = FSNS.promises.mkdir( cli.packageMeta.paths.log, { recursive: true } );
	await mkDir_promise.then(
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
	if( cli.options.verbose === true ){
		cli.logger.setConsoleLogLevel('debug');
		cli.logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'note', message: `Logger: console_stderr transport log level set to: ${cli.logger?.real_transports?.console_stderr?.level}`});
	}
	try{
		var config_promise = null;
		var config_filepath = '';
		var configObject = new ConfigManager( { packageMeta: cli.packageMeta, logger: cli.logger, defaultContructor: function(){
			var default_template_directories = [];
			var default_defaults_directories = [];
			var basedirs = [
				PathNS.join( process.cwd(), 'Resources' )
			];
			if( this.packageMeta != null ){
				basedirs.push( PathNS.join( this.packageMeta.paths.packageDirectory, 'Resources' ) );
				basedirs.push( this.packageMeta.paths.data );
			}
			for( const basedir of basedirs ){
				if( basedir != null ){
					var path = PathNS.join( basedir, 'templates' );
					default_template_directories.push(path);
					path = PathNS.join( basedir, 'defaults' );
					default_defaults_directories.push(path);
				}
			}
			this.configObject.template_directories = ( this.configObject.template_directories || options.configObject.template_directories ) ?? ( default_template_directories );
			this.configObject.defaults_directories = ( this.configObject.defaults_directories || options.configObject.defaults_directories ) ?? ( default_defaults_directories );
			this.logger?.log({ function: FUNCTION_NAME, level: 'debug', message: `template_directories: ${this.template_directories.toString()} defaults_directories: ${this.defaults_directories.toString()}` });
		}
		} );
		if( cli.options['config-file'] != null && typeof(cli.options['config-file']) === 'string' ){
			config_filepath = cli.options['config-file'];
		} else{
			config_filepath = PathNS.join( cli.packageMeta.paths.config, 'config.json' );
		}
		config_promise = configObject.loadFilePath( config_filepath );
		config_promise.then(
			( configObject ) => {
				cli.config = configObject;
				cli.logger.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `cli.config: ${cli.config.toString()}`});
			},
			async ( error ) => {
				cli.logger.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `error: ${error}`});
				if( error.code === 'ENOENT' ){
					await configObject.saveFilePath( config_filepath );
					cli.config = configObject;
				} else{
					return_error = new Error(`Error: cli.configObject.loadFilePath threw an error: ${error}`);
					throw return_error;
				}
			}
		);
	} catch(error){
		cli.logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: `Caught an unhandled error while setting config: ${error}`});
	}
	cli.logger.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `cli.config: ${cli.config}`});
	var quick_exit = false;
	if( cli.options.version === true ){
		console.log(cli.packageMeta.version);
		quick_exit = true;
	}
	if( cli.options.help === true ){
		const help_sections_array = [
			{
				header: 'function-factory',
				content: 'Simple, minimalist templating from the command line.',
			},
			{
				header: 'Options',
				optionList: cli.OptionDefinitions
			}
		]
		const help_message = CommandLineUsage(help_sections_array);
		console.log(help_message);
		quick_exit = true;
	}
	if( cli.options.config === true ){
		console.log('Paths: ', cli.packageMeta.paths);
		console.log('Config: ', cli.config);
		quick_exit = true;
	}
	if( quick_exit === false || cli.options['no-quick-exit'] === true ){
		run_promise = FunctionFactory.load( { logger: cli.logger, config: cli.config, options: cli.options } ).then(
			async ( functionFactory ) => {
				cli.functionFactory = functionFactory;
				//cli.input().then( functionFactory.transform ).then( cli.output );
				//Receive Input
				if( cli.options.stdin === true ){
					cli.logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'info', message: 'Reading input from STDIN.'});
					input_string_promise = GetStream( process.stdin, 'utf8' ).catch(
						( error ) => {
							return_error = new Error(`GetStream threw an error: ${error}`);
							cli.logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
						}
					);
				} else if( cli.options.input != null ){
					cli.logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'info', message: 'Reading input from a file.'});
					if( typeof(cli.options.input) === 'string' ){
						cli.logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `cli.options.input: '${cli.options.input}'`});
						input_string_promise = FSNS.promises.readFile( cli.options.input, 'utf8' ).catch(
							( error ) => {
								return_error = new Error(`FSNS.promises.readFile threw an error: ${error}`);
								cli.logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
							}
						);
					} else{
						return_error = new Error('"cli.options.input" is not a string.');
						cli.logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
					}
				} else if( cli.options.edit != null ){
					input_string_promise = cli.getInputStringFromInquirerEditor( cli.options ).then(
						( input_string ) => {
							cli.logger.log({level: 'debug', message: `input_string: ${input_string}`});
							return input_string;
						},
						( error ) => {
							return_error = new Error(`getInputStringFromInquirerEditor threw an error: ${error}`);
							throw return_error;
						}
					);
				} else{
					return_error = new Error('No input options specified.');
					cli.logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
				}
				//Transform
				output_string = functionFactory.transform( await input_string_promise, cli.options );
				//Send Output
				if( cli.options.output != null && typeof(output_string) === 'string' ){
					output_promise = FSNS.promises.writeFile( cli.options.output, output_string, 'utf8' ).catch(
						( error ) => {
							return_error = new Error(`FSNS.promises.writeFile threw an error: ${error}`);
							cli.logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: return_error.message});
						}
					);
				} else if( cli.options.pasteboard === true ){
					output_promise = Clipboardy.write( output_string ).catch(
						( error ) => {
							return_error = new Error(`Clipboardy.write threw an error: '${error}' when trying to write '${output_string}'`);
						}
					);
				} else{
					if( cli.options.stdout !== true ){
						cli.logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'warn', message: 'No output options specified; defaulting to STDOUT.'});
					}
					
					try{
						console.log(output_string);
						output_promise = Promise.resolve();
					} catch(error){
						return_error = new Error(`console.log threw an error: ${error}`);
						throw return_error;
					}
				}
				//return new Promise( () => { return Promise.resolve(); } );
				return Promise.resolve();
			},
			( error ) => {
				return_error = new Error(`FunctionFactory.load threw an error: ${error}`);
				throw return_error;
			}
		);
	} else{
		run_promise = Promise.resolve();
	}
	await run_promise.then(
		() => {
			process.exitCode = 0;
		},
		( error ) => {
			process.exitCode = -1;
			throw error;
		}
	);
}


//Global Constants
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
CLI.prototype.getInputStringFromInquirerEditor = async function( options = {} ){
	var arguments_array = Array.from(arguments);
	var _return;
	var return_error;
	const FUNCTION_NAME = 'getInputStringFromInquirerEditor';
	this.logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
	//Variables
	var template_generic_name = '';
	var default_input_string = '';
	var inquirer_questions = [];

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
		default_input_string = this.functionFactory.getDefaultInputStringFromGenericName( template_generic_name, options );
	} catch(error){
		this.logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'warn', message: `getDefaultInputStringFromGenericName threw an error: ${error}`});
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
	_return = await Inquirer.prompt( inquirer_questions ).then(
		( inquirer_answer ) => {
			this.logger.log({ level: 'debug', message: `Received inquirer_answer: ${inquirer_answer}` });
			return inquirer_answer.editor_input;
		},
		( error ) => {
			return_error = new Error(`Inquirer.prompt threw an error: ${error}`);
			throw return_error;
		}
	);
	//Return
	this.logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
	return _return;
}

CLI.run();
