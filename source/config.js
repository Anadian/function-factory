#!/usr/bin/env node

import * as PathNS from 'node:path';
import * as FSNS from 'node:fs';

import * as ApplicationLogWinstonInterface from 'application-log-winston-interface';
import * as HJSON from 'hjson';
import AJV from 'ajv';
//import * as Utility from 'node:util';

const FILENAME = 'config.js';

function ConfigManager( options = {} ){
	if( !( this instanceof ConfigManager ) ){
		return ( new ConfigManager( options ) );
	}
	const FUNCTION_NAME = 'ConfigManager';
	this.packageMeta = ( this.packageMeta || options.packageMeta ) ?? ( null );
	this.logger = ( this.logger || options.logger ) ?? ( ApplicationLogWinstonInterface.nullLogger );
	this.logger?.log({ function: FUNCTION_NAME, level: 'debug', message: `options: ${options.toString()}`});
	this.ajv = ( this.ajv || options.ajv ) ?? ( new AJV() );
	this.configObject = ( this.configObject || options.configObject ) ?? ( {} );
	this.schemaPath = ( this.schemaPath || options.schemaPath ) ?? ( '' );
	this.schemaString = ( this.schemaString || options.schemaString ) ?? ( '' );
	this.schemaJSON = ( this.schemaJSON || options.schemaJSON ) ?? ( {} );
	this.validator = ( this.validator || options.validator ) ?? ( null );
	this.defaultConstructor = ( this.defaultConstructor || options.defaultConstructor ) ?? ( ( options = {} ) => {} );
	//this.logger?.log({ function: FUNCTION_NAME, level: 'debug', message: `template_directories: ${this.configObject.template_directories.toString()} defaults_directories: ${this.configObject.defaults_directories.toString()}` });
	return this;
}

ConfigManager.prepare = async function( options = {} ){
	const FUNCTION_NAME = 'ConfigManager.prepare';
	var return_error = null;
	var configManager = new ConfigManager( options );
	var schemaString_promise = Promise.resolve();
	//Function
	configManager.defaultConstructor();
	if( configManager.validator === null ){
		if( configManager.schemaJSON === {} ){
			if( configManager.schemaString === '' ){
				if( configManager.schemaPath === '' ){
					try{
						configManager.schemaPath = PathNS.join(configManager.packageMeta.paths.packageDirectory, 'Resources', 'schema', 'config.schema.json');
					} catch(error){
						return_error = new Error(`PathNS.join threw an error: ${error}`);
						throw return_error;
					}
				}
				schemaString_promise = FSNS.promises.readFile( configManager.schemaPath, 'utf8' ).then(
					( file_string ) => {
						configManager.schemaString = file_string;
					},
					( error ) => {
						return_error = new Error(`FSNS.promises.readFile threw an error: ${error}`);
						throw return_error;
					}
				);
			}
			await schemaString_promise;
			try{
				configManager.schemaJSON = HJSON.parse( configManager.schemaString );
			} catch(error){
				return_error = new Error(`HJSON.parse threw an error: ${error}`);
				throw return_error;
			}
		}
		configManager.validator = configManager.ajv.compile( configManager.schemaJSON );
	}
	return configManager;
}

/*ConfigManager.prototype.toJSON = function( options = {} ){
	const FUNCTION_NAME = 'toJSON';
	var config_object = {
		template_directories: this.template_directories,
		defaults_directories: this.defaults_directories
	};
	return config_object;
}

ConfigManager.prototype.toString = function( options = {} ){
	const FUNCTION_NAME = 'toString';
	var object = this.toJSON( options );
	var string = JSON.stringify( object );
	console.log(`${FUNCTION_NAME}: object: ${object} string: ${string}`);
	return string;
}*/

ConfigManager.prototype.loadFilePath = function( filepath_string, options = {} ){
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
			this.configObject = { ...this.configObject, ...config_object };
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
ConfigManager.prototype.saveFilePath = function( filepath_string, options = {} ){
	var return_error = null;
	var _return = null;
	if( filepath_string == '' && typeof(filepath_string) !== typeof('') ){
		return_error = new TypeError('Parametre "filepath_string" is either empty or not a string.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
	var json_string = JSON.stringify( this.configObject, null, '\t' );
	_return = FSNS.promises.writeFile( filepath_string, json_string, 'utf8' );
	return _return;
}

export default ConfigManager;
