#!/usr/bin/env node

import * as PathNS from 'node:path';
import * as FSNS from 'node:fs';

import * as ApplicationLogWinstonInterface from 'application-log-winston-interface';
import * as HJSON from 'hjson';
import * as Utility from 'node:util';

const FILENAME = 'config.js';

function ConfigManager( options = {} ){
	if( !( this instanceof ConfigManager ) ){
		return ( new ConfigManager( options ) );
	}
	const FUNCTION_NAME = 'ConfigManager';
	this.packageMeta = ( this.packageMeta || options.packageMeta ) ?? ( null );
	this.logger = ( this.logger || options.logger ) ?? ( ApplicationLogWinstonInterface.nullLogger );
	this.logger.log({ function: FUNCTION_NAME, level: 'debug', message: `options: ${options.toString()}`});
	this.defaultConstructor = ( this.defaultConstructor || options.defaultConstructor ) ?? ( () => {} );
	this.configObject = ( this.configObject || options.configObject ) ?? ( {} );
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

ConfigManager.prototype.toJSON = function( options = {} ){
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
}

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
