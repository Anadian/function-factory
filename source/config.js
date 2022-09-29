#!/usr/bin/env node

import * as PathNS from 'node:path';
import * as FSNS from 'node:fs';

import * as ApplicationLogWinstonInterface from 'application-log-winston-interface';
import * as HJSON from 'hjson';
import * as Utility from 'node:util';

const FILENAME = 'config.js';

function ConfigObject( options = {} ){
	if( !( this instanceof ConfigObject ) ){
		return ( new ConfigObject( options ) );
	}
	const FUNCTION_NAME = 'ConfigObject';
	this.packageMeta = ( this.packageMeta || options.packageMeta ) ?? ( null );
	this.logger = ( this.logger || options.logger ) ?? ( ApplicationLogWinstonInterface.nullLogger );
	this.logger.log({ function: FUNCTION_NAME, level: 'debug', message: `options: ${options.toString()}`});
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
	this.template_directories = ( this.template_directories || options.template_directories ) ?? ( default_template_directories );
	this.defaults_directories = ( this.defaults_directories || options.defaults_directories ) ?? ( default_defaults_directories );
	this.logger?.log({ function: FUNCTION_NAME, level: 'debug', message: `template_directories: ${this.template_directories.toString()} defaults_directories: ${this.defaults_directories.toString()}` });
	return this;
}

ConfigObject.prototype.loadFilePath = function( filepath_string, options = {} ){
	const FUNCTION_NAME = 'loadFilePath';
	var return_error = null;
	var _return = null;
	this.logger.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${filepath_string}`});
	var config_object = {};
	if( filepath_string == '' || typeof(filepath_string) !== 'string' ){
		return_error = new TypeError('Parametre "filepath_string" is either empty or not a string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	_return = FSNS.promises.readFile( filepath_string, 'utf8' ).then( 
		( file_string ) => {
			this.logger.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `file_string: ${file_string}`});
			try{
				config_object = HJSON.parse( file_string );
			} catch(error){
				return_error = new Error(`HJSON.parse threw an error: ${error}`);
				throw return_error;
			}
			//try{
			_return = { ...this, ...config_object };
			/*} catch(error){
				return_error = new Error(`new ConfigObject threw an error: ${error}`);
				throw return_error;
			}*/
			this.logger.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${Utility.inspect(_return)}`});
			return _return;
		},
		( error ) => {
			if( error.code === 'ENOENT' ){
				throw error;
			} else{
				return_error = new Error(`FSNS.promises.readFile threw an error: ${error}`);
				throw return_error;
			}
		}
	);
	return _return;
}
ConfigObject.prototype.saveFilePath = function( filepath_string, options = {} ){
	var return_error = null;
	var _return = null;
	if( filepath_string == '' && typeof(filepath_string) !== typeof('') ){
		return_error = new TypeError('Parametre "filepath_string" is either empty or not a string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	var config_object = {
		template_directories: this.template_directories,
		defaults_directories: this.defaults_directories
	};
	var json_string = JSON.stringify( config_object, null, '\t' );
	_return = FSNS.promises.writeFile( filepath_string, json_string, 'utf8' );
	return _return;
}

export default ConfigObject;
///**
//### loadConfigObjectFromFilePath
//> Reads the given filepath and sets the global configuration object to the contained JSON value.

//Parametres:
//| name | type | description |
//| --- | --- | --- |
//| config_filepath | {string} | The path of the JSON file to be parsed for config values.  |
//| options | {?Object} | Additional run-time options. \[default: {}\] |


//Returns:
//| type | description |
//| --- | --- |
//| {object} | The current config object value, after attempting to parse the given file. |

//Throws:
//| code | type | condition |
//| --- | --- | --- |
//| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

//History:
//| version | change |
//| --- | --- |
//| 2.1.1 | Moved to HJSON |
//| 1.9.0 | Experimental |
//*/
//function loadConfigObjectFromFilePath( config_filepath, options = {} ){
//	var arguments_array = Array.from(arguments);
//	var _return;
//	var return_error;
//	const FUNCTION_NAME = 'loadConfigObjectFromFilePath';
//	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
//	//Variables
//	var function_return = [1, null];
//	var have_readwrite_permissions = false;
//	var config_file_string = '';
//	//Parametre checks
//	if( typeof(config_filepath) !== 'string' ){
//		return_error = new TypeError('Param "config_filepath" is not a string.');
//		return_error.code = 'ERR_INVALID_ARG_TYPE';
//		throw return_error;
//	}

//	//Function
//	try{
//		FileSystem.accessSync( config_filepath, (FileSystem.constants.R_OK | FileSystem.constants.W_OK) );
//		have_readwrite_permissions = true;
//	} catch(error){
//		return_error = new Error(`FileSystem.accessSync threw an error: ${error}`);
//		throw return_error;
//	}
//	if( have_readwrite_permissions === true ){
//		try{
//			config_file_string = FileSystem.readFileSync( config_filepath, 'utf8' );
//		} catch(error){
//			return_error = new Error(`FileSystem.readFileSync threw an error: ${error}`);
//			throw return_error;
//		}
//		try{
//			ConfigObject = HJSON.parse( config_file_string );
//			_return = ConfigObject;
//		} catch(error){
//			return_error = new Error(`HJSON.parse threw an error: ${error}`);
//			throw return_error;
//		}
//		/*if( function_return[0] === 0 ){
//			ConfigObject = function_return[1];
//			_return = function_return[1];
//		} else{
//			return_error = new Error(`JSONICParse.ParseFilePath returned an error value: ${function_return}`);
//			return_error.code = 'ERR_INVALID_RETURN_VALUE';
//			throw return_error;
//		}*/
//	}

//	//Return
//	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
//	return _return;
//}
///**
//### saveConfigObjectToFilePath
//> Saves the current ConfigObject to the given filepath.

//Parametres:
//| name | type | description |
//| --- | --- | --- |
//| filepath_string | {string} | The filepath destination to save the configuration to.  |
//| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

//Throws:
//| code | type | condition |
//| --- | --- | --- |
//| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

//Status:
//| version | change |
//| --- | --- |
//| 1.9.0 | Experimental |
//*/
//function saveConfigObjectToFilePath( filepath_string, options = {} ){
//	var arguments_array = Array.from(arguments);
//	var return_error;
//	const FUNCTION_NAME = 'saveConfigObjectToFilePath';
//	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
//	//Variables
//	var config_directory = '';
//	var config_json_string = '';
//	//Parametre checks
//	if( typeof(filepath_string) !== 'string' ){
//		return_error = new TypeError('Param "filepath_string" is not a string.');
//		return_error.code = 'ERR_INVALID_ARG_TYPE';
//		throw return_error;
//	}
//	//Function
//	try{
//		config_directory = Path.dirname( filepath_string );
//	} catch(error){
//		return_error = new Error(`Path.dirname threw an error: ${error}`);
//		throw return_error;
//	}
//	try{
//		MakeDir.sync(config_directory);
//	} catch(error){
//		return_error = new Error(`MakeDir.sync threw an error: ${error}`);
//		throw return_error;
//	}
//	try{
//		config_json_string = JSON.stringify(ConfigObject, null, '\t');
//	} catch(error){
//		return_error = new Error(`JSON.stringify threw an error: ${error}`);
//		throw return_error;
//	}
//	try{
//		FileSystem.writeFileSync( filepath_string, config_json_string, 'utf8' );
//	} catch(error){
//		return_error = new Error(`FileSystem.writeFileSync threw an error: ${error}`);
//		throw return_error;
//	}
//}
