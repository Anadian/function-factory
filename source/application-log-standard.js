#!/usr/local/bin/node

/**
* @file application-log-standard.js
* @brief Standardised level names and console formatting.
* @author Anadian
* @copyright MITlicensetm(2019,Canosw)
*/

//Dependencies
	//Internal
	//Standard
	//External
	const LogForm = require('logform');
	const Winston = require('winston');

//Constants
const FILENAME = 'application-log-standard.js';
const MODULE_NAME = 'ApplicationLogStandard';
var PROCESS_NAME = '';
if(require.main === module){
	PROCESS_NAME = 'application-log-standard';
} else{
	PROCESS_NAME = process.argv0;
}

const ApplicationLogStandard = { //RFC 5424
	levels: {
		emerg: 0,
		alert: 1,
		crit: 2,
		error: 3,
		warn: 4,
		note: 5,
		info: 6,
		debug: 7
	},
	colors: {
		emerg: 'bold underline red',
		alert: 'bold underline red',
		crit: 'bold red',
		error: 'red',
		warn: 'yellow',
		note: 'magenta',
		info: 'blue',
		debug: 'green'
	}
};
/*const DefaultPropertiesFormat = Winston.format((info, opts) => {
	if( info.process == undefined ){
		info.process = PROCESS_NAME;
	}
	if( info.module == undefined ){
		info.module = MODULE_NAME;
	}
	if( info.file == undefined ){
		info.file = FILENAME;
	}
	return info;
});*/

//Functions

//Exports and Execution
if(require.main === module){
	
} else{
	exports.levels = ApplicationLogStandard.levels;
	exports.colors = ApplicationLogStandard.colors;
	//exports.DefaultPropertiesFormat = DefaultPropertiesFormat;
}
/*
const Logger = Winston.createLogger({
	level: 'debug',
	levels: ApplicationLogStandard.levels,
	transports: [
		new Winston.transports.Console({
			level: 'debug',
			format: LogForm.format.combine(
				LogForm.format.colorize({
					all: true,
					colors: ApplicationLogStandard.colors
				}),
				LogForm.format.splat(),
				LogForm.format.printf((info) => {
					return `${info.level}: ${info.function?info.function+':':''} ${info.message}`;
				})
			),
			stderrLevels: ['emerg','alert','crit','error','warn','note','info','debug'],
			warnLevels: ['warn','note']
		}),
		new Winston.transports.File({
			level: 'debug',
			format: LogForm.format.combine(
				LogForm.format.timestamp(),
				LogForm.format.splat(),
				LogForm.format.printf((info) => {
					return `${info.timestamp} ${info.process?info.process+':':''}${info.module?info.module+':':''}${info.file?info.file+':':""}${info.function?info.function+':':''}${info.level}: ${info.message}${(info.meta)?' '+info.meta:''}`;
				})
			),
			eol: '\n',
			filename: 'log_debug.log',
			maxsize: 1048576,
			maxFiles: 4
		})
	]
});
*/
