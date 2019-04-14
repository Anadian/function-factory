#!/usr/local/bin/node

/**
* @file application-log.js
* @brief A slightly-opinionated, fairly-robust, and comparatively-simple logging solution for applications and simple commands.
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
	const Utility = require('util');
	const FileSystem = require('fs');
	const Path = require('path');
	//External
	const EnvPaths = require('env-paths');
	const Chalk = require('chalk');
	const StripJSONComments = require('strip-json-comments');
	const ParseJSON = require('parse-json');

//Constants
const FILENAME = 'application-log.js';
const MODULE_NAME = 'ApplicationLog';
var PROCESS_NAME = '';
if(require.main === module){
	PROCESS_NAME = 'application-log';
} else{
	PROCESS_NAME = process.argv0;
}
const EnvironmentPaths = EnvPaths(PROCESS_NAME);

//var date = new Date();
const LogLevelsMap = new Map([ //RFC 5424
	['emerg', 0],
	['alert', 1],
	['crit', 2],
	['error', 3],
	['warn', 4],
	['note', 5],
	['info', 6],
	['debug', 7]
]);
const TransportTypesMap = new Map([
	['directory', 0],
	['file', 1],
	['stream', 2],
	['callback', 3]
]);

var Metadata = {
	absolute_path: Path.join( EnvironmentPaths.log, '.log_information.json')
};
var Transports = [
/*	{enabled: true, type: 'directory', level: 'debug', name: 'log_debug', directory: EnvironmentPaths.log, header: true, cycle_size: 1048576, file_limit: 4, colour: false, callback: null, metadata_file: 'log_information.json', tracked_files: []},
//	{enabled: true, type: 'file', name: date.toISOString().replace(/[-+:.]/g,'')+'.log', colour: false, level: 'debug'},
	{enabled: true, type: 'stream', name: 'stderr', colour: true, level: 'info'}*/
];

//Functions
function FileIO_Callback(error){ 
	if(error != null) console.error('FileIO_Callback error: ', error);
}
function UpdateTransportTrackedFileFromFileSystemStat_CallbackUnbound( transport_index, tracked_file_index, error, stats){
	var _return = [1,null];
	var function_return = [1,null];
	if( error == null ){
		if( stats != null ){
			if( transport_index != null && typeof(transport_index) === 'number' && transport_index < Transports.length ){
				if( tracked_file_index != null && typeof(tracked_file_index) === 'number' && tracked_file_index < Transports[transport_index].tracked_files.length ){
					Transports[transport_index].tracked_files[tracked_file_index].size = filestats.size;
					Transports[transport_index].tracked_files[tracked_file_index].last_write = filestats.mtime.toISOString();
					function_return = ApplicationLog_LogMetadata_Write();
					if( function_return[0] === 0 ){
						_return = [0,filestats];
					} else{
						_return = [function_return[0], 'ApplicationLog_LogMetadata_Write: '+function_return[1]];
					}
				} else{
					_return = [-5, Utility.format('Error: bound tracked_file_index is either null, not a number, or not a valid tracked-file index: %o', tracked_file_index)];
				}
			} else{
				_return = [-4, Utility.format('Error: bound transport_index is either null, not a number, or not a valid transport index: %o', transport_index)];
			}
		} else{
			_return = [-3, Utility.format('Error: stats is null: %o', stats)];
		}
	} else{
		_return = [-2, Utility.format('Error: FileSystem.stat callback received error: %s', error)];
	}
	if( _return !== 0 ){
		console.error(_return);
	}
}
/**
* @fn ApplicationLog_LogMetadata_Read
* @brief Read the '.log_information.json' metadata file if it exists.
* @return <ARRAY>
*	@entry 0 
*		@retval 1 premature return.
*		@retval 0 on success.
*		@retval <0 on failure.
*	@entry 1
*		@retval <object> on success
*		@retval <error_message> on failure.
*/
function ApplicationLog_LogMetadata_Read(){
	var _return = [1,null];
	const FUNCTION_NAME = 'ApplicationLog_LogMetadata_Read';
	//Variables
	var metadata_string = null;
	var stripped_metadata_string = null;
	var metadata_object = null;

	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: '+arguments.toString());
	//Parametre checks
	
	//Function
	if( Metadata.absolute_path != null && typeof(Metadata.absolute_path) === 'string' ){
		try{
			metadata_string = FileSystem.readFileSync( Metadata.absolute_path, 'utf8' );
		} catch(error){
			_return = [-8, Utility.format('Warn: error reading Metadata.absolute_path; you probably forgot to call ApplicationLog_Init first: %s: %s', Metadata.absolute_path, error)];
		}
		if( _return[0] === 1 ){
			stripped_metadata_string = StripJSONComments( metadata_string );
			if( stripped_metadata_string != null ){
				metadata_object = ParseJSON( stripped_metadata_string );
				if( metadata_object != null ){
					if( metadata_object.transports != null){
						if( Array.isArray(metadata_object.transports) === true ){
							Transports = metadata_object.transports;
							_return = [0,null];
						} else{
							_return = [-128, Utility.format('Warn: metadata_object.transports is not an array: %o', metadata_object)];
						}
					} else{
						_return = [-64, Utility.format('Error: metadata_object.transports property is missing: %o', metadata_object)];
					}
				} else{
					_return = [-32, Utility.format('Error: parsing stripped_metadata_string: %s', stripped_metadata_string)];
				}
			} else{
				_return = [-16, Utility.format('Error: stripping comments from metadata_string: %s', metadata_string)];
			}
		}
	} else{
		_return = [-4, Utility.format('Warn: Metadata.absolute_path is either null or not a string: %o', Metadata)];
	}

	//Return
	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','returned: '+_return.toString());
	return _return;
}
/**
* @fn ApplicationLog_LogMetadata_Write
* @brief Update the '.log_information.json' metadata file to the current transport state.
* @return <ARRAY>
*	@entry 0 
*		@retval 1 premature return.
*		@retval 0 on success.
*		@retval <0 on failure.
*	@entry 1
*		@retval <object> on success
*		@retval <error_message> on failure.
*/
function ApplicationLog_LogMetadata_Write(){
	var _return = [1,null];
	const FUNCTION_NAME = 'ApplicationLog_LogMetadata_Write';
	//Variables
	var metadata_string = null;

	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: '+arguments.toString());
	//Parametre checks
	
	//Function
	if( Metadata.absolute_path != null && typeof(Metadata.absolute_path) === 'string' ){
		var temp_object = {
			transports: Transports
		};
		metadata_string = JSON.stringify( temp_object, null, '\t');
		if( metadata_string != null ){
			FileSystem.writeFileSync( Metadata.absolute_path, '/*.log_information.json: Metadata file used by application-log; not intended to be directly edited by end users.*/\n'+metadata_string, 'utf8', FileIO_Callback );
			_return = [0,null];
		} else{
			_return = [-8, Utility.format('Error: couldn\'t stringify transports: %o', Transports)];
		}
	} else{
		_return = [-4, Utility.format('Warn: Metadata.absolute_path is either null or not a string: %o', Metadata)];
	}

	//Return
	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','returned: '+_return.toString());
	return _return;
}
/**
* @fn ApplicationLog_TransportHeader_Write
* @brief Writes a header message to the transport_index transport, optionally specifying a tracked_file.
* @param transport_index
*	@type Number
*	@brief The index of the transport.
*	@default null
* @param tracked_file_index
*	@type Number
*	@brief OPTIONAL: The tracked_file to write the header to; [directory] defaults to the most recent tracked_File [file] not necessary.
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
function ApplicationLog_TransportHeader_Write( transport_index, tracked_file_index ){
	var _return = [1,null];
	var function_return = [1,null];
	const FUNCTION_NAME = 'ApplicationLog_TransportHeader_Write';
	//Variables
	var date = new Date();
	var header_message = '';
	var file_path = '';

	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: '+arguments.toString());
	//Parametre checks
	if(transport_index == undefined) transport_index = null;
	if(tracked_file_index == undefined) tracked_file_index = null;
	
	//Function
	if( transport_index != null && typeof(transport_index) === 'number' && transport_index < Transports.length ){
		if( Transports[transport_index].type === 'directory' && tracked_file_index != null ){
			if( tracked_file_index != null && tracked_file_index < Transports[transport_index].tracked_files.length ){
			} else{
				tracked_file_index = (Transports[transport_index].tracked_files.length - 1);
			}
			header_message = Utility.format('#Header %s\n%o\n%o\n', date.toISOString(), Transports[transport_index].tracked_files[tracked_file_index], Transports[transport_index]);
			file_path = Path.join( Transports[transport_index].directory, Transports[transport_index].tracked_files[tracked_file_index].filename );
			try{
				FileSystem.appendFileSync( file_path, header_message, 'utf8' );
				_return = [0, header_message];
			} catch(error){
				_return = [-4, Utility.format('Error: FileSystem.appendFileSync threw and error when writing to file_path: %s: %s', file_path, error)];
			}
		} else if( Transports[transport_index].type === 'file' ){
			header_message = Utility.format('#Header %s\n%o\n', date.toISOString(), Transports[transport_index]);
			file_path = Path.join( Transports[transport_index].directory, Transports[transport_index].name );
			try{
				FileSystem.appendFileSync( file_path, header_message, 'utf8' );
				_return = [0, header_message];
			} catch(error){
				_return = [-5, Utility.format('Error: FileSystem.appendFileSync threw and error when writing to file_path: %s: %s', file_path, error)];
			}
		}
	} else{
		_return = [-2, Utility.format('Error: transport_index is either null, not a number, or not a valid array index.')];
	}
	//Return
	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','returned: '+_return.toString());
	return _return;
}
/**
* @fn ApplicationLog_TrackedFile_Stat
* @brief Stats the tracked file of a transport, updating the arrary.
* @param transport_index
*	@type Number
*	@brief The index of the transport.
*	@default null
* @param tracked_file_index
*	@type Number
*	@brief The index of the tracked file to be stat'd.
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
function ApplicationLog_TrackedFile_Stat( transport_index, tracked_file_index ){
	var _return = [1,null];
	var function_return = [1,null];
	const FUNCTION_NAME = 'ApplicationLog_TrackedFile_Stat';
	//Variables

	console.error(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: ',arguments);
	//Parametre checks
	if(transport_index == undefined) transport_index = null;
	if(tracked_file_index == undefined) tracked_file_index = null;
	
	//Function
	if( transport_index != null && typeof(transport_index) === 'number' && transport_index < Transports.length ){
		if( tracked_file_index != null && typeof(tracked_file_index) === 'number' && tracked_file_index < Transports[transport_index].tracked_files.length ){
			console.error(Transports[transport_index].tracked_files[tracked_file_index]);
			var file_path = Path.join( Transports[transport_index].directory, Transports[transport_index].tracked_files[tracked_file_index].filename );
			var filestats = null;
			//try{
				console.error(file_path);
				FileSystem.stat(file_path, UpdateTransportTrackedFileFromFileSystemStat_CallbackUnbound.bind( null, transport_index, tracked_file_index ));
			_return = [0,null];
			//} catch(error){
			//	_return [-4, Utility.format('Error: calling FileSystem.statSync threw error: %s', error)];
			//}
			/*console.error(filestats);
			if( filestats != null ){
			} else{
				_return = [-4, Utility.format('Error: filestats is null.')];
			}*/
		} else{
			_return = [-3, Utility.format('Error: tracked_file_index is either null, not a number, or not a valid tracked_files index: %o', tracked_file_index)];
		}
	} else{
		_return = [-2, Utility.format('Error: transport_index is either null, not a number, or not a valid Transports index: %o', transport_index)];
	}
	//Return
	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','returned: '+_return.toString());
	return _return;
}
/**
* @fn ApplicationLog_TrackedFile_Add
* @brief Adds a new tracked file to transport of the given index.
* @param transport_index
*	@type Number
*	@brief The index of the transport to add a new tracked file to.
*	@default 0
* @return <ARRAY>
*	@entry 0 
*		@retval 1 premature return.
*		@retval 0 on success.
*		@retval <0 on failure.
*	@entry 1
*		@retval <object> on success
*		@retval <error_message> on failure.
*/
function ApplicationLog_TrackedFile_Add( transport_index ){
	var _return = [1,null];
	var function_return = [1,null];
	const FUNCTION_NAME = 'ApplicationLog_TrackedFile_Add';
	//Variables
	var date = new Date();
	var new_tracked_file = {
		filename: '',
		created: date.toISOString(),
		last_write: date.toISOString(),
		size: 0,
		index: null
	};
	var header = '\n';
	var new_tracked_file_index = null;
	//console.error(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: ',arguments);
	//Parametre checks
	if(transport_index == undefined) transport_index = 0;
	
	//Function
	if( Transports[transport_index].tracked_files.length === 0 ){
		new_tracked_file.index = 0;
		new_tracked_file.filename = Transports[transport_index].name + '0.log';
		new_tracked_file_index = (Transports[transport_index].tracked_files.push(new_tracked_file) - 1);
	} else{
		new_tracked_file.index = (Transports[transport_index].tracked_files[(Transports[transport_index].tracked_files.length - 1)].index + 1);
		new_tracked_file.filename = Transports[transport_index].name + new_tracked_file.index + '.log';
		if( Transports[transport_index].tracked_files.length >= Transports[transport_index].file_limit ){
			var former_tracked_file = Transports[transport_index].tracked_files.shift();
			var former_tracked_file_path = Path.join(Transports[transport_index].directory, former_tracked_file.filename);
			try{
				FileSystem.unlinkSync( former_tracked_file_path, 'utf8' );
			} catch(error){
				_return = [-8, Utility.format('Warn: error when removing former_tracked_file_path: %s', former_tracked_file_path)];
				console.error(_return[1]);
			}
		}
		new_tracked_file_index = (Transports[transport_index].tracked_files.push(new_tracked_file) - 1);
	}
	//console.error(Transports[transport_index]);
	function_return = ApplicationLog_TransportHeader_Write( transport_index, new_tracked_file_index );
	if( function_return[0] === 0 ){
		function_return = ApplicationLog_TrackedFile_Stat( transport_index, new_tracked_file_index );
		if( function_return[0] === 0 ){
			_return = [0,new_tracked_file_index];
		} else{
			_return = [function_return[0], 'ApplicationLog_TrackedFile_Stat: '+function_return[1]];
		}
	} else{
		_return = [function_return[0], 'ApplicationLog_TransportHeader_Write: '+function_return[1]];
		console.error(_return[1]);
	}
	
	//Return
	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','returned: '+_return.toString());
	return _return;
}
/**
* @fn ApplicationLog_Init
* @brief Checks and loads the current log-information metadata file, creating it if necessary.
* @param directory_path
*	@type String
*	@brief The directory to store the log metadata file.
*	@default EnvironmentPaths.log
* @param file_path
*	@type String
*	@brief The name of the log metadata file; defaults to '.log_information.json'
*	@default '.log_information.json'
* @return <ARRAY>
*	@entry 0 
*		@retval 1 premature return.
*		@retval 0 on success.
*		@retval <0 on failure.
*	@entry 1
*		@retval <object> on success
*		@retval <error_message> on failure.
*/
function ApplicationLog_Init( directory_path, file_path ){
	var _return = [1,null];
	const FUNCTION_NAME = 'ApplicationLog_Init';
	
	//Variables
	var directory_accessible = false;
	var file_accessible = false;
	var file_data = null;
	var stripped_file_data = null;
	var json_object = {};

	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: '+arguments.toString());
	//Parametre checks
	if(directory_path == undefined) directory_path = EnvironmentPaths.log;
	if(file_path == undefined) file_path = '.log_information.json';
	
	//Function
	try{
		FileSystem.accessSync( directory_path, (FileSystem.constants.F_OK | FileSystem.constants.R_OK | FileSystem.constants.W_OK) );
		directory_accessible = true;
	} catch(error){
		console.error(error);
		try{
			FileSystem.mkdirSync(directory_path, {recursive: true});
			directory_accessible = true;
		} catch(error){
			console.error(error);
			directory_accessible = false;
		}
	}
	if( directory_accessible === true ){
		try{
			FileSystem.accessSync( Path.join(directory_path, file_path), (FileSystem.constants.F_OK | FileSystem.constants.R_OK | FileSystem.constants.W_OK) );
			file_accessible = true;
		} catch(error){
			try{
				FileSystem.writeFileSync( Path.join(directory_path, file_path), '/*.log_information.json: Used by application-log; not intended to be edited by end users.*/\n{\n\t"transports": []\n}\n', 'utf8');
				file_accessible = true;
			} catch(error){
				console.error(error);
				file_accessible = false;
			}
		}
	} else{
		_return = [-4, 'Directory is inaccessible or could not be created.'];
		file_accessible = false;
	}
	if( file_accessible === true ){
		Metadata.absolute_path = Path.join( directory_path, file_path );
		function_return = ApplicationLog_LogMetadata_Read();
		if( function_return[0] === 0 ){
			/*for( var i = 0; i < Transports.length; i++){
				if( Transports[i].tracked_files.length == 0 ){
					function_return = ApplicationLog_TrackedFile_Add( transport_index );
					if( function_return[0] === 0 ){
						_return = [0, null];
					} else{
						_return = [function_return[0], 'ApplicationLog_TrackedFile_Add: '+function_return[1]];
					}
					//ApplicationLog_TrackedFile_Stat( transport_index, tracked_file_index );
				}
			}*/
			_return = [0,null];
		} else{
			_return = [function_return[0], 'ApplicationLog_LogMetadata_Read: '+function_return[1]];
		}
	} else{
		_return = [-8,'Error metadata file is not readable or cannot be created.'];
	}

	//Return
	return _return;
}
/**
* @fn ApplicationLog_CycleBusiness
* @brief Returns the appropriate file to log to, shifting and removing old files as necessary.
* @param transport_index
*	@type Number
*	@brief The index of the transport to be updated.
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
function ApplicationLog_CycleBusiness( transport_index ){
	var _return = [1,null];
	var function_return = [1,null];
	const FUNCTION_NAME = 'ApplicationLog_CycleBusiness';
	//Variables
	var tracked_file_index = 0;

	//console.error(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: ',arguments);
	//Parametre checks
	if(transport_index == undefined) transport_index = null;
	
	//Function
	if( transport_index != null ){
		if( Transports[transport_index].tracked_files.length < 1 ){
			function_return = ApplicationLog_TrackedFile_Add( transport_index );
		} else{
			tracked_file_index = (Transports[transport_index].tracked_files.length - 1);
			if( Transports[transport_index].tracked_files[tracked_file_index].size >= Transports[transport_index].cycle_size ){
				function_return = ApplicationLog_TrackedFile_Add( transport_index );
			}
		}
		if( function_return[0] === 0 ){
			tracked_file_index = function_return[1];
		} else{
			_return = [function_return[0], 'ApplicationLog_TrackedFile_Add: '+function_return[1]];
		}
		if( _return[0] === 1 ){
			var current_file_path = Path.join( Transports[transport_index].directory, Transports[transport_index].tracked_files[tracked_file_index].filename );
			_return = [0,current_file_path];
		}
	} else{ //transport_index is null
		_return = [-2,'Error: parameter invalid; transport_index needs to a non-null number.']
	}

	//Return
	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','returned: '+_return.toString());
	return _return;
}

/**
* @fn ApplicationLog_Transports_Add
* @brief Add a transport.
* @param enabled
*	@type Boolean
*	@brief A boolean determining whether the new transport is to be enabled immediately.
*	@default true
* @param type
*	@type TransportType:String
*	@brief The type of transport: 'directory', 'file', 'stream', or 'callback'
*	@default 'file'
* @param level
*	@type LogLevel:String
*	@brief The log level of the transport.
*	@default 'debug'
* @param name
*	@type String
*	@brief [directory] The base-filename, minus the file-extension, which will be concatenated to form the names of the incremental, cyclical log files. [file] The name of the transport file. [stream] A value of 'stdout' or 'stderr' will write to their respective POSIX-standard streams.
*	@default null
* @param directory
*	@type String
*	@brief [directory/file] Where the log file(s) will be stored.
*	@default EnvironmentPaths.log
* @param header
*	@type Boolean
*	@brief [file] Whether a header should be added when the tranport is first being used.
*	@default true
* @param cycle_size
*	@type Number
*	@brief [file] The size, in bytes, at which to cycle to the next file; default is 1 048 576 bytes (1 MiB).
*	@default 1048576
* @param file_limit
*	@type Number
*	@brief [file] The max number of log files to have in the directory at once; default is 4.
*	@default 4
* @param colour
*	@type Boolean
*	@brief [stream] Whether to use colour when writing to a stream.
*	@default true
* @param callback
*	@type Function
*	@brief [callback] The function to be called with all the message information.
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
function ApplicationLog_Transports_Add( enabled, type, level, name, directory, header, cycle_size, file_limit, colour, callback ){
	var _return = [1,null];
	var function_return = [1,null];
	const FUNCTION_NAME = 'ApplicationLog_Transports_Add';
	//Variables
	var new_transport_index = null;
	var transport = {};

	//console.error(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: ',arguments);
	//Parametre checks
	if( enabled == undefined || typeof(enabled) !== 'boolean' ) enabled = true;
	if( type == undefined || typeof(type) !== 'string' ) type = 'file';
	if( level == undefined || typeof(level) !== 'string' ) level = 'debug';
	if( name == undefined || typeof(name) !== 'string' ){
		switch(type){
			case 'stream':
				name = 'stderr';
				break;
			default:
				name = 'log_debug';
				break;
		}
	}
	if( directory == undefined || typeof(directory) !== 'string' ) directory = EnvironmentPaths.log;
	if( header == undefined || typeof(header) !== 'boolean' ){
		switch(type){
			case 'directory':
			case 'file': 
				header = true;
				break;
			default:
				header = false;
				break;
		}
	}
	if( cycle_size == undefined || typeof(cycle_size) !== 'number' ){
		if( type === 'directory' ){
			cycle_size = 1048576;
		} else{
			cycle_size = null;
		}
	}
	if( file_limit == undefined || typeof(file_limit) !== 'number' ){
		if( type === 'directory' ){
			file_limit = 4;
		} else{
			file_limit = null;
		}
	}
	if( colour == undefined || typeof(colour) !== 'boolean' ){
		if( type === 'stream' ){
			colour = true;
		} else{
			colour = false;
		}
	}
	if( callback == undefined || typeof(callback) !== 'function' ){
		if( type === 'callback' ){
			 _return = [-2, Utility.format('Error: callback not provided for tranport type callback: %o', callback)];
		} else{
			callback = null;
		}
	}
	if( _return[0] === 1 ){
		transport = {
			enabled: enabled,
			type: type,
			level: level,
			name: name,
			directory: directory,
			header: header,
			cycle_size: cycle_size,
			file_limit: file_limit,
			colour: colour,
			callback: callback,
			tracked_files: []
		}
		//console.error(transport);
		//Function
		function_return = ApplicationLog_LogMetadata_Read();
		if( function_return[0] === 0 ){
			new_transport_index = (Transports.push(transport) - 1);
			//console.error(new_transport_index);
			if( transport.header === true ){
				function_return = ApplicationLog_TransportHeader_Write( new_transport_index ); 
				if( function_return[0] !== 0 ){
					_return = [function_return[0], 'ApplicationLog_TransportHeader_Write: '+function_return[1]];
				}
			}
			if( _return[0] === 1 ){
				function_return = ApplicationLog_LogMetadata_Write();
				if( function_return[0] === 0 ){
					_return = [0,new_transport_index];
				} else{
					_return = [function_return[0], 'ApplicationLog_LogMetadata_Write: '+function_return[1]];
				}
			}
		} else{
			_return = [function_return[0], Utility.format('Warn: ApplicationLog_LogMetadata_Read: %o', function_return)];
		}
	}
	//Return
	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','returned: '+_return.toString());
	return _return;
}



function ReturnObject(code, message){
	var return_message = code.toString()+': '+message;
	if(arguments.length > 2){
		for(var i = 2; i < arguments.length; i++){
			return_message += ('|'+Utility.inspect(arguments[i]));
		}
	}
	return [code,return_message];
}

/**
* @fn ApplicationLog_Log
* @brief Logs to all enabled transports.
* @param process_name
*	@type String
*	@brief The name of the current process.
*	@default PROCESS_NAME
* @param module_name
*	@type String
*	@brief The name of the current module.
*	@default MODULE_NAME
* @param file_name
*	@type String
*	@brief The current filename.
*	@default FILENAME
* @param function_name
*	@type String
*	@brief The name of the function calling log.
*	@default FUNCTION_NAME
* @param level_name
*	@type LogLevel:String
*	@brief The RFC 54524 log level.
*	@default 'debug'
* @param message
*	@type String
*	@brief The actual message to be logged.
*	@default 
* @return <ARRAY>
*	@entry 0 
*		@retval 1 premature return.
*		@retval 0 on success.
*		@retval <0 on failure.
*	@entry 1
*		@retval <object> on success
*		@retval <error_message> on failure.
*/
function ApplicationLog_Log( process_name, module_name, file_name, function_name, level_name, message ){
	var _return = [1,null];
	const FUNCTION_NAME = 'ApplicationLog_Log';
	//Variables
	var function_return = [1,null];
	var date = new Date();

	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: '+arguments.toString());
	//Parametre checks
	if(process_name == undefined) process_name = PROCESS_NAME;
	if(module_name == undefined) module_name = MODULE_NAME;
	if(file_name == undefined) file_name = FILENAME;
	if(function_name == undefined) function_name = FUNCTION_NAME;
	if(level_name == undefined) level_name = 'debug';
	if(message == undefined) message = null;
	
	if(arguments.length > 6){
		for(var i = 6; i < arguments.length; i++){
			message += ('|'+Utility.inspect(arguments[i]));
		}
	}
	//Function
	for(var i = 0; i < Transports.length; i++){
		if(Transports[i].enabled === true){
			var transport_level = LogLevelsMap.get(Transports[i].level);
			var message_level = LogLevelsMap.get(level_name);
			if(message_level <= transport_level){
				if(Transports[i].type === 'directory'){
					function_return = ApplicationLog_CycleBusiness( i );
					var target_file = null;
					if( function_return[0] === 0 ){
						target_file = function_return[1];
						FileSystem.appendFile(target_file, date.toISOString()+' '+process_name+': '+module_name+': '+function_name+': '+level_name+': '+message+'\n', 'utf8', FileIO_Callback);
					} else{
						_return[1] += Utility.format('| ApplicationLog_CycleBusiness: %s |',function_return[1]);
					}
				} else if(Transports[i].type === 'file'){
					if(Transports[i].name != null){
						FileSystem.appendFile(Transports[i].name, date.toISOString()+' '+process_name+':'+module_name+':'+file_name+':'+function_name+':'+level_name+': '+message+'\n', 'utf8', FileIO_Callback);
					} else{
						_return[1] += Utility.format('| Log error: Transports[%d].name is not specified: %s |', i, Transports[i].name);
					}
				} else if(Transports[i].type === 'stream'){
					var string = '';
					if(Transports[i].colour === true){
						var colour;
						switch(level_name){
							case 'emerg':
							case 'alert':
							//silent
							case 'crit':
							case 'error': colour = Chalk.red; break;
							//quiet
							case 'warn': colour = Chalk.yellow; break;
							case 'note': colour = Chalk.magenta; break;
							case 'info': colour = Chalk.blue; break;
							//normal
							case 'debug': colour = Chalk.green; break;
							//verbose
							default: colour = function no_colour(){ return arguments; }; break;
						}
						string = colour(Utility.format("%s:%s:%s: %s", Chalk.bold(level_name), Chalk.dim(module_name), Chalk.underline(function_name), message));
					} else{
						string = Utility.format("%s:%s:%s: %s", level_name, module_name, function_name, message);
					}
					if(Transports[i].name === 'stdout'){
						console.log(string);
					} else if(Transports[i].name === 'stderr'){
						console.error(string);
					} else{
						_return[1] += Utility.format('| Log error: Unknown stream for Transports[%d]: %s |', i, Transports[i].name);
					}
				} else{
					_return[1] += Utility.format('| Log error: Invalid transport type for Transports[%d]: %s |', i, Transports.type);
				}	
			}
		}
	}
	if( _return[1] === null ){
		_return[0] = 0;
	} else{
		_return[0] = -4;
		console.error(_return);
	}
	//Return
	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','returned: '+_return.toString());
	return _return;
}
/**
* @fn ApplicationLog_Test
* @brief Test the current ApplicationLog context.
* @return <ARRAY>
*	@entry 0 
*		@retval 1 premature return.
*		@retval 0 on success.
*		@retval <0 on failure.
*	@entry 1
*		@retval <object> on success
*		@retval <error_message> on failure.
*/
function ApplicationLog_Test(){
	var _return = [1,null];
	const FUNCTION_NAME = 'ApplicationLog_Test';
	//Variables

	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: '+arguments.toString());
	//Parametre checks
	
	//Function
	ApplicationLog_Log(PROCESS_NAME, MODULE_NAME, Path.basename(__filename), FUNCTION_NAME, 'error', 'yo');
	ApplicationLog_Log(PROCESS_NAME, MODULE_NAME, Path.basename(__filename), FUNCTION_NAME, 'warn', 'yo');
	ApplicationLog_Log(PROCESS_NAME, MODULE_NAME, Path.basename(__filename), FUNCTION_NAME, 'note', 'yo');
	ApplicationLog_Log(PROCESS_NAME, MODULE_NAME, Path.basename(__filename), FUNCTION_NAME, 'info', 'yo');
	ApplicationLog_Log(PROCESS_NAME, MODULE_NAME, Path.basename(__filename), FUNCTION_NAME, 'debug', 'yo');

	//Return
	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','returned: '+_return.toString());
	return _return;
}

//Exports and Execution
if(require.main === module){
	var _return = [1,null];
	var function_return = [1,null];
	function_return = ApplicationLog_Init();
	if( function_return[0] === 0 ){
		if( Transports.length === 0 ){
			function_return = ApplicationLog_Transports_Add( true, 'directory', 'debug', null, null, true, null, null, false, null );
			if( function_return[0] === 0 ){
				function_return = ApplicationLog_Transports_Add( true, 'file', 'debug', 'test_log.log', null, true, null, null, false, null );
				if( function_return[0] === 0 ){
					function_return = ApplicationLog_Transports_Add( true, 'stream', 'debug', 'stderr', null, false, null, null, true, null );
					if( function_return[0] === 0 ){
						_return = [1,null];
					} else{
						_return = [function_return[0], 'ApplicationLog_Transports_Add: '+function_return[1]];
					}
				} else{
					_return = [function_return[0], 'ApplicationLog_Transports_Add: '+function_return[1]];
				}
			} else{
				_return = [function_return[0], 'ApplicationLog_Transports_Add: '+function_return[1]];
			}
		}
		if( _return[0] === 1 ){
			ApplicationLog_Test();
		}
	} else{
		_return = [function_return[0], 'ApplicationLog_Init: '+function_return[1]];
	}
	if( _return[0] === 0 ){
		process.exitCode = 0;
	} else{
		process.exitCode = _return[0];
		console.error(_return);
	}
} else{
	exports.constants = {
		log_levels_map: LogLevelsMap,
		transport_types_map: TransportTypesMap
	};
	exports.variables = {
		metadata: Metadata,
		transports: Transports
	};
	exports.init = ApplicationLog_Init;
	exports.addTransport = ApplicationLog_Transports_Add;
	exports.readMetadata = ApplicationLog_LogMetadata_Read;
	exports.writeMetadata = ApplicationLog_LogMetadata_Write;
	exports.log = ApplicationLog_Log;
	exports.test = ApplicationLog_Test;
}
