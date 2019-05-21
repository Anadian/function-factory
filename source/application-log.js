#!/usr/local/bin/node
'use strict';

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
	const JSONICParse = require('./jsonic-parse.js');
	//Standard
	const Utility = require('util');
	const FileSystem = require('fs');
	const Path = require('path');
	//const EventEmitter = require('events');
	//External
	const EnvPaths = require('env-paths');
	const Chalk = require('chalk');

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

//Classes
class Transport{
	/**
	* @fn Transport.constructor
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
	constructor( enabled, type, level, name, format, directory, header, cycle_size, file_limit, colour, callback ){
		var _return = [1,null];
		var function_return = [1,null];
		const FUNCTION_NAME = 'Transport.constructor';
		//Variables

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
		if( header == undefined || (typeof(header) !== 'boolean' && typeof(header) !== 'function') ){
			switch(type){
				case 'directory':
				case 'file': 
					header = 'default';
					break;
				default:
					header = false;
					break;
			}
		}
		if( format == undefined || typeof(format) !== 'string' ){
			format = 'default';
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
			this.enabled = enabled;
			this.type = type;
			this.level = level;
			this.name = name;
			this.format = format;
			this.message_formatter = null;
			this.directory = directory;
			this.header = header;
			this.header_formatter = null;
			this.cycle_size = cycle_size;
			this.file_limit = file_limit;
			this.colour = colour;
			this.callback_name = callback_name;
			this.transport_callback = null;
			this.tracked_files = [];
			if( this.type === 'directory' ){
				this.TrackedFiles_Add();
			}
			_return = [0,this];
		}
		return _return;
	}
	ToJSON(){
		_return = [1,null];
		const FUNCTION_NAME = 'Transport.ToJSON';
		//Variables
		var json_object = {};
		if( typeof(this.enabled) === 'boolean' ){
			json_object.enabled = this.enabled;
			if( typeof(this.type) === 'string' ){
				json_object.type = this.type;
				if( typeof(this.level) === 'string' ){
					json_object.level = this.level;
					if( typeof(this.name) === 'string' ){
						json_object.name = this.name;
						if( typeof(this.format) === 'string' ){
							if( typeof(this.directory) === 'string' ){
								json_object.directory = this.directory;
								if( typeof(this.header) === 'boolean' || typeof(this.header) === 'string' ){
									json_object.header = this.header;
									if( typeof(this.cycle_size) === 'number' ){
										json_object.cycle_size = this.cycle_size;
										if( typeof(this.file_limit) === 'number' ){
											json_object.file_limit = this.file_limit;
											if( typeof(this.colour) === 'boolean' ){
												json_object.colour = this.colour;
												if( typeof(this.callback_name) === 'string' ){
													json_object.callback_name = this.callback_name;
													if( Array.isArray(this.tracked_files) === true ){
														json_object.tracked_files = this.tracked_files;
													} else{
														_return = [-14, 'Error: property "tracked_files" is not an array.'];
													}
												} else{
													_return = [-13,'Error: property "callback_name" is not a string.'];
												}
											} else{
												_return = [-12,'Error: property "colour" is not a boolean.'];
											}
										} else{
											_return = [-11,'Error: property "file_limit" is not a number.'];
										}
									} else{
										_return = [-10,'Error: property "cycle_size" is not a number.'];
									}
								} else{
									_return = [-9,'Error: property "header" is neither boolean nor a string.'];
								}
							} else{
								_return = [-8,'Error: property "directory" is not a string.'];
							}
						} else{
							_return = [-7,'Error: property "format" is not a string.'];
						}
					} else{
						_return = [-6,'Error: property "name" is not a string.'];
					}
				} else{
					_return = [-5,'Error: property "level" is not a string.'];
				}
			} else{
				_return = [-4,'Error: property "type" is not string.'];
			}
		} else{
			_return = [-3,'Error: property "enabled" is not boolean.'];
		}
		if( _return[0] === 1 ){
			_return = [0,json_object];
		}
		return _return;
	}
	FromJSON( json_object ){
		_return = [1,null];
		const FUNCTION_NAME = 'Transport.FromJSON';
		//Variables
		if( json_object != null && typeof(json_object) === 'object' ){
			if( typeof(json_object.enabled) === 'boolean' ){
				this.enabled = json_object.enabled;
				if( typeof(json_object.type) === 'string' ){
					this.type = json_object.type;
					if( typeof(json_object.level) === 'string' ){
						this.level = json_object.level;
						if( typeof(json_object.name) === 'string' ){
							this.name = json_object.name;
							if( typeof(json_object.format) === 'string' ){
								this.format = json_object.format;
								if( typeof(json_object.directory) === 'string' ){
									this.directory = json_object.directory;
									if( typeof(json_object.header) === 'boolean' || typeof(json_object.header) === 'string' ){
										this.header = json_object.header;
										if( typeof(json_object.cycle_size) === 'number' ){
											this.cycle_size = json_object.cycle_size;
											if( typeof(json_object.file_limit) === 'number' ){
												this.file_limit = json_object.file_limit;
												if( typeof(json_object.colour) === 'boolean' ){
													this.colour = json_object.colour;
													if( typeof(json_object.callback_name) === 'string' ){
														this.callback_name = json_object.callback_name;
														if( Array.isArray(json_object.tracked_files) === true ){
															this.tracked_files = json_object.tracked_files;
														} else{
															_return = [-14, 'Error: property "tracked_files" is not an array.'];
														}
													} else{
														_return = [-13,'Error: property "callback_name" is not a string.'];
													}
												} else{
													_return = [-12,'Error: property "colour" is not a boolean.'];
												}
											} else{
												_return = [-11,'Error: property "file_limit" is not a number.'];
											}
										} else{
											_return = [-10,'Error: property "cycle_size" is not a number.'];
										}
									} else{
										_return = [-9,'Error: property "header" is neither boolean nor a string.'];
									}
								} else{
									_return = [-8,'Error: property "directory" is not a string.'];
								}
							} else{
								_return = [-7,'Error: property "format" is not a string.'];
							}
						} else{
							_return = [-6,'Error: property "name" is not a string.'];
						}
					} else{
						_return = [-5,'Error: property "level" is not a string.'];
					}
				} else{
					_return = [-4,'Error: property "type" is not string.'];
				}
			} else{
				_return = [-3,'Error: property "enabled" is not boolean.'];
			}
		} else{
			_return = [-2,'Error: parametre "json_object" is either null or not an object.'];
		}
		if( _return[0] === 1 ){
			_return = [0,this];
		}
		return _return;
	}
	TrackedFileIndex_Valid_R( tracked_file_index ){
		if( typeof(tracked_file_index) === 'number' ){
			if( tracked_file_index >= 0 ){
				if( tracked_file_index < this.tracked_files.length ){
					return true;
				}
			}
		}
		return false;
	}
	Header_Get( tracked_file_index ){
		var _return = [1,null];
		var function_return = [1,null];
		const FUNCTION_NAME = 'Transport.Header_Get';
		//Variables

		//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: '+arguments.toString());
		//Parametre checks
		if(tracked_file_index === undefined || typeof(tracked_file_index) !== 'number') tracked_file_index = null;
		
		//Function
		if( this.type === 'directory' ){
			if( tracked_file_index === null || !(this.TrackedFileIndex_Valid_R(tracked_file_index)) ){
				tracked_file_index = (this.tracked_files.length - 1);
			}
		}
		if( typeof(this.header_formatter) === 'function' ){
			function_return = this.header_formatter(tracked_file_index);
		} else if( this.header === true ){
			function_return = this.DefaultHeaderFormatter(tracked_file_index);
		} else{
			_return = [-2, 'Error: invalid "header_formatter" property: '+this.header];
		}
		if( _return[0] === 1 ){
			if( function_return[0] === 0 ){
				_return = [0,function_return[1]];
			} else{
				_return = [function_return[0], '"header" function: '+function_return[1]];
			}
		}
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
	Header_Write( tracked_file_index ){
		var _return = [1,null];
		var function_return = [1,null];
		const FUNCTION_NAME = 'Transport.Header_Write';
		//Variables
		var file_path = '';

		console.error(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug',Utility.format('received: %o',arguments));
		//Parametre checks
		if(tracked_file_index == undefined || typeof(tracked_file_index) !== 'number') tracked_file_index = null;
		
		//Function
		function_return = this.Header_Get( tracked_file_index );
		if( function_return[0] === 0 ){
			if( this.type === 'directory' ){
				if( this.TrackedFileIndex_Valid_R( tracked_file_index ) ){
					file_path = Path.join( this.directory, this.tracked_files[tracked_file_index].filename );
				} else{
					this.TrackedFiles_Add();
				}	
			} else if( this.type === 'file' ){
				file_path = Path.join( this.directory, this.name );
			}
			try{
				FileSystem.appendFileSync( file_path, function_return[1], 'utf8' );
				_return = [0, function_return[1]];
			} catch(error){
				_return = [-5, Utility.format('Error: FileSystem.appendFileSync threw and error when writing to file_path: %s: %s', file_path, error)];
			}
		} else{
			_return = [function_return[0], 'Transport.Header_Get: '+function_return[1]];
		}
		//Return
		console.error(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug',Utility.format('returned: %o', _return));
		return _return;
	}
	UpdateTransportTrackedFileFromFileSystemStat_CallbackUnbound( tracked_file_index, error, stats){
		var _return = [1,null];
		var function_return = [1,null];
		if( error == null ){
			if( stats != null ){
				if( tracked_file_index != null && this.TrackedFileIndex_Valid_R(tracked_file_index) ){
					this.tracked_files[tracked_file_index].size = stats.size;
					this.tracked_files[tracked_file_index].last_write = stats.mtime.toISOString();
					function_return = this.parent_logger.Metadata_Write();
					if( function_return[0] === 0 ){
						_return = [0,stats];
					} else{
						_return = [function_return[0], 'ApplicationLog_LogMetadata_Write: '+function_return[1]];
					}
				} else{
					_return = [-4, Utility.format('Error: bound tracked_file_index is either null, not a number, or not a valid tracked-file index: %o', tracked_file_index)];
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
	TrackedFiles_Stat( tracked_file_index ){
		var _return = [1,null];
		var function_return = [1,null];
		const FUNCTION_NAME = 'Transport.TrackedFiles_Stat';
		//Variables
		var file_path = '';

		//console.error(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: ',arguments);
		//Parametre checks
		if( tracked_file_index == undefined || !(this.TrackedFileIndex_Valid_R( tracked_file_index )) ){
			_return = [-2,'Error: invalid tracked_file_index: '+tracked_file_index];
		}
		//Function
		if( _return[0] === 1 ){
			//console.error(Transports[transport_index].tracked_files[tracked_file_index]);
			file_path = Path.join( this.directory, this.tracked_files[tracked_file_index].filename );
			FileSystem.stat(file_path, this.UpdateTransportTrackedFileFromFileSystemStat_CallbackUnbound.bind( this, tracked_file_index ));
			_return = [0,null];
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
	TrackedFiles_Add(){
		var _return = [1,null];
		var function_return = [1,null];
		const FUNCTION_NAME = 'Transport.TrackedFiles_Add';
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
		
		//Function
		if( this.tracked_files.length === 0 ){
			new_tracked_file.index = 0;
			new_tracked_file.filename = this.name + '0.log';
			new_tracked_file_index = (this.tracked_files.push(new_tracked_file) - 1);
		} else{
			new_tracked_file.index = (this.tracked_files[(this.tracked_files.length - 1)].index + 1);
			new_tracked_file.filename = this.name + new_tracked_file.index + '.log';
			if( this.tracked_files.length >= this.file_limit ){
				var former_tracked_file = this.tracked_files.shift();
				var former_tracked_file_path = Path.join(this.directory, former_tracked_file.filename);
				try{
					FileSystem.unlinkSync( former_tracked_file_path, 'utf8' );
				} catch(error){
					_return = [-8, Utility.format('Warn: error when removing former_tracked_file_path: %s', former_tracked_file_path)];
					console.error(_return[1]);
				}
			}
			new_tracked_file_index = (this.tracked_files.push(new_tracked_file) - 1);
		}
		//console.error(Transports[transport_index]);
		function_return = this.Header_Write( new_tracked_file_index );
		if( function_return[0] === 0 ){
			function_return = this.TrackedFiles_Stat( new_tracked_file_index );
			if( function_return[0] === 0 ){
				_return = [0,new_tracked_file_index];
			} else{
				_return = [function_return[0], 'Transport.TrackedFiles_Stat: '+function_return[1]];
			}
		} else{
			_return = [function_return[0], 'Transport.Header_Write: '+function_return[1]];
			console.error(_return[1]);
		}
		
		//Return
		//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','returned: '+_return.toString());
		return _return;
	}
	/**
	* @fn Transport.CycleBusiness
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
	CycleBusiness(){
		var _return = [1,null];
		var function_return = [1,null];
		const FUNCTION_NAME = 'Transport.CycleBusiness';
		//Variables
		var tracked_file_index = 0;

		//console.error(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: ',arguments);
		//Parametre checks
		
		//Function
		if( this.tracked_files.length < 1 ){
			function_return = this.TrackedFile_Add( transport_index );
		} else{
			tracked_file_index = (this.tracked_files.length - 1);
			if( this.tracked_files[tracked_file_index].size >= this.cycle_size ){
				function_return = this.TrackedFile_Add( transport_index );
			}
		}
		if( function_return[0] === 0 ){
			tracked_file_index = function_return[1];
		} else{
			_return = [function_return[0], 'ApplicationLog_TrackedFile_Add: '+function_return[1]];
		}
		if( _return[0] === 1 ){
			var current_file_path = Path.join( this.directory, this.tracked_files[tracked_file_index].filename );
			_return = [0,current_file_path];
		}

		//Return
		//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','returned: '+_return.toString());
		return _return;
	}
}

class ApplicationLogger {
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
	constructor( directory_path, file_path ){
		var _return = [1,null];
		const FUNCTION_NAME = 'ApplicationLog_Init';
		this.metadata = {
			absolute_path: Path.join( EnvironmentPaths.log, '.log_information.json')
		};
		this.transports = [];
		this.message_formatters_map = new Map(['default', DefaultMessageFormatter]);
		this.header_formatters_map = new Map(['default', function DefaultHeaderFormatter(){
				_return [1,null];
				const FUNCTION_NAME = 'Transport.DefaultHeaderFormatter';
				//Variables
				var date = new Date();
				var header_message = '';

				//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: '+arguments.toString());
				//Parametre checks
				if( tracked_file_index == undefined || typeof(tracked_file_index) !== 'number' ){
					tracked_file_index = null;
				}

				//Function
				if( this.type === 'directory' ){
					if( tracked_file_index === null || !(this.TrackedFileIndex_Valid_R(tracked_file_index)) ){
						tracked_file_index = (this.tracked_files.length - 1);
					}
					header_message = Utility.format('#Header %s\n%o\n%o\n', date.toISOString(), this.tracked_files[tracked_file_index], this);
					_return = [0,header_message];
				} else if( this.type === 'file' ){
					header_message = Utility.format('#Header %s\n%o\n', date.toISOString(), this);
					_return = [0,header_message];
				} else{
					_return = [-2, Utility.format('Error: Transport is neither a directory nor a file.')];
				}
				//Return
				//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','returned: '+_return.toString());
				return _return;
			}
		]);
		this.transport_callbacks_map = new Map();
		
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
			this.metadata.absolute_path = Path.join( directory_path, file_path );
			function_return = this.Metadata_Read();
			if( function_return[0] === 0 ){
				_return = [0,this];
			} else{
				_return = [function_return[0], 'ApplicationLog_LogMetadata_Read: '+function_return[1]];
			}
		} else{
			_return = [-8,'Error metadata file is not readable or cannot be created.'];
		}

		//Return
		return _return;
	}
	FileIO_Callback(error){ 
		if(error != null) console.error('FileIO_Callback error: ', error);
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
	Metadata_Read(){
		var _return = [1,null];
		const FUNCTION_NAME = 'ApplicationLogger.Metadata_Read';
		//Variables
		var function_return = [1,null];
		var metadata_object = null;

		console.error(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug',Utility.format('received: %o',arguments));
		//Parametre checks
		
		//Function
		if( this.metadata.absolute_path != null && typeof(this.metadata.absolute_path) === 'string' ){
			function_return = JSONICParse.ParseFilePath( this.metadata.absolute_path );
			if( function_return[0] === 0 ){
				metadata_object = function_return[1];
				if( metadata_object.transports != null){
					if( Array.isArray(metadata_object.transports) === true ){
						for(var i = 0; i < metadata_object.transports.length; i++){
							function_return = Transport.FromJSON(metadata_object.transports[i]);
							if( function_return[0] === 0 ){
								var transport_object = function_return[1];
								function_return = this.Transports_Add(transport_object);
								if( function_return[0] !== 0 ){
									i = metadata_object.transports.length;
									_return = [function_return[0],Utility.format('Error: adding transport[%d] (%o); this.Transports_Add: %s', i, transport_object, function_return[1])];
								}
							} else{
								i = metadata_object.transports.length;
								_return = [function_return[0],Utility.format('Error: parsing transport[%d] from json_object (%o); Transport.FromJSON: %s', i, metadata_object.transports[i], function_return[1])];
							}
						}
						if( _return[0] === 1 ){
							_return = [0,null];
						}
					} else{
						_return = [-16, Utility.format('Warn: metadata_object.transports is not an array: %o', metadata_object)];
					}
				} else{
					_return = [-8, Utility.format('Error: metadata_object.transports property is missing: %o', metadata_object)];
				}
			} else{
				_return = [function_return[0], 'JSONICParse.ParseFilePath: '+function_return[1]];
			}
		} else{
			_return = [-4, Utility.format('Warn: Metadata.absolute_path is either null or not a string: %o', this.metadata)];
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
	Metadata_Write(){
		var _return = [1,null];
		const FUNCTION_NAME = 'ApplicationLog_LogMetadata_Write';
		//Variables
		var function_return = [1,null];
		var metadata_string = null;

		console.error(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug',Utility.format('received: %o',arguments));
		//Parametre checks
		
		//Function
		if( this.metadata.absolute_path != null && typeof(this.metadata.absolute_path) === 'string' ){
			var temp_object = {
				transports: []
			};
			for(var i = 0; i < this.transports.length; i++){
				function_return = this.transports[i].ToJSON();
				if( function_return[0] === 0 ){
					temp_object.transports.push(function_return[1]);
				} else{
					i = this.transports.length;
					_return = [function_return[0], Utility.format('Error: retrieving JSON representation of transports[%d]; this.transports[i].ToJSON: %s', i, function_return[1])];
				}
			}
			if( _return[0] === 1 ){
				//console.error(temp_object);
				metadata_string = JSON.stringify( temp_object, null, '\t');
				if( metadata_string != null ){
					FileSystem.writeFileSync( this.metadata.absolute_path, '/*.log_information.json: Metadata file used by application-log; not intended to be directly edited by end users.*/\n'+metadata_string, 'utf8', FileIO_Callback );
					_return = [0,null];
				} else{
					_return = [-8, Utility.format('Error: couldn\'t stringify temp_object: %o', temp_object)];
				}
			}
		} else{
			_return = [-4, Utility.format('Warn: Metadata.absolute_path is either null or not a string: %o', Metadata)];
		}

		//Return
		console.error(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug',Utility.format('returned: %o', _return));
		return _return;
	}
	Transports_Add_Unsafe( transport ){
		var _return = [1,null];
		var function_return = [1,null];
		const FUNCTION_NAME = 'ApplicationLog_Transports_Add_Unsafe';
		//Variables
		var new_transport_index = null;
		//Function
		function_return = this.Metadata_Read();
		if( function_return[0] === 0 ){
			transport.metadataWriteCallback, this.Metadata_Write();
			if( typeof(transport.format) === 'string' ){
				transport.message_formatter = this.message_formatters_map(transport.format).bind(transport);
			}
			if( typeof(transport.header) === 'string' ){
				transport.header_formatter = this.header_formatters_map(transport.header).bind(transport);
			}
			if( typeof(transport.callback_name) === 'string' ){
				transport.transport_callback = this.transport_callbacks_map(transport.callback_name);
			}
			new_transport_index = (this.transports.push(transport) - 1);
			//console.error(new_transport_index);
			if( transport.header === true || typeof(transport.header) === 'function' ){
				function_return = this.transports[new_transport_index].Header_Write(); 
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
		return _return;
	}
	Transports_Add( transport ){
		var _return = [1,null];
		var function_return = [1,null];
		const FUNCTION_NAME = 'ApplicationLog_Transports_Add';
		//Variables

		//console.error(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: ',arguments);
		//Parametre checks
		if( transport == undefined || typeof(transport) !== 'object' ){
			_return = [-2, 'Error: given transport is either null or not an object: '+transport];
		}
		//Function
		if( _return[0] === 1 ){
			_return = this.Transports_Add_Unsafe( transport );
		}
		//Return
		//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','returned: '+_return.toString());
		return _return;
	}
	Transports_New( enabled, type, level, name, directory, header, cycle_size, file_limit, colour, callback ){
		var _return = [1,null];
		var function_return = [1,null];
		const FUNCTION_NAME = 'ApplicationLogger.Transports_New';
		//Variables
		var transport = null;
		//Parametre checks
		//Function
		function_return = new Transport( enabled, type, level, name, directory, header, cycle_size, file_limit, colour, callback );
		if( function_return[0] === 0 ){
			function_return = this.Transports_Add( function_return[1] );
			if( function_return[0] === 0 ){
				_return = [0,function_return[1]];
			} else{
				_return = [function_return[0], 'ApplicationLogger.Transports_Add: '+function_return[1]];
			}
		} else{
			_return = [function_return[0], 'new Transport: '+function_return[1]];
		}
		//Return
		return _return;
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
	Log( process_name, module_name, file_name, function_name, level_name, message ){
		var _return = [1,null];
		const FUNCTION_NAME = 'ApplicationLogger.Log';
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
		
		if( typeof(message) !== 'string' ){
			message = Utility.inspect(message);
		} 
		if(arguments.length > 6){
			for(var i = 6; i < arguments.length; i++){
				message += ('|'+Utility.inspect(arguments[i]));
			}
		}
		//Function
		for(var i = 0; i < this.transports.length; i++){
			if(this.transports[i].enabled === true){
				var transport_level = LogLevelsMap.get(this.transports[i].level);
				var message_level = LogLevelsMap.get(level_name);
				if(message_level <= transport_level){
					if(this.transports[i].type === 'directory'){
						function_return = this.transports[i].CycleBusiness();
						var target_file = null;
						if( function_return[0] === 0 ){
							target_file = function_return[1];
							FileSystem.appendFile(target_file, );
						} else{
							_return[1] += Utility.format('| ApplicationLog_CycleBusiness: %s |',function_return[1]);
						}
					} else if(this.transports[i].type === 'file'){
						if(this.transports[i].name != null){
							FileSystem.appendFile(this.transports[i].name, date.toISOString()+' '+process_name+':'+module_name+':'+file_name+':'+function_name+':'+level_name+': '+message+'\n', 'utf8', this.FileIO_Callback);
						} else{
							_return[1] += Utility.format('| Log error: this.transports[%d].name is not specified: %s |', i, this.transports[i].name);
						}
					} else if(this.transports[i].type === 'stream'){
						var string = '';
						if(this.transports[i].colour === true){
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
						if(this.transports[i].name === 'stdout'){
							console.log(string);
						} else if(this.transports[i].name === 'stderr'){
							console.error(string);
						} else{
							_return[1] += Utility.format('| Log error: Unknown stream for this.transports[%d]: %s |', i, this.transports[i].name);
						}
					} else{
						_return[1] += Utility.format('| Log error: Invalid transport type for this.transports[%d]: %s |', i, this.transports[i].type);
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
	DefaultMessageFormatter_All( process_name, module_name, file_name, function_name, level_name, message ){
		var _return = [1,null];
		const FUNCTION_NAME = 'DefaultMessageFormatter_All';
		//Variables
		var date = new Date();
		var format_string = '%s %s: %s: %s: %s: %s: ';

		//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: '+arguments.toString());
		//Parametre checks
		if(process_name == undefined) process_name = PROCESS_NAME;
		if(module_name == undefined) module_name = MODULE_NAME;
		if(file_name == undefined) file_name = FILENAME;
		if(function_name == undefined) function_name = FUNCTION_NAME;
		if(level_name == undefined) level_name = 'debug';
		if(message == undefined) message = null;
		
		if( typeof(message) === 'string' ){
			format_string += '%s';
		} else{
			format_string += '%o';
		}
		if(arguments.length > 6){
			format_string += ' %o';
			var extra_arguments = arguments.slice(6);
			message = Utility.format(format_string, date.toISOString(), process_name, module_name, file_name, function_name, level_name, message, extra_arguments);
		} else{
			message = Utility.format(format_string, date.toISOString(), process_name, module_name, file_name, function_name, level_name, message);
		}
		if( message != '' ){
			_return = [0,message];
		} else{
			_return = [1,null];
		}
		return _return;
	}
	DefaultMessageFormatter_Coloured(
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
	Test(){
		var _return = [1,null];
		const FUNCTION_NAME = 'this.Test';
		//Variables

		//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: '+arguments.toString());
		//Parametre checks
		
		//Function
		this.Log(PROCESS_NAME, MODULE_NAME, Path.basename(__filename), FUNCTION_NAME, 'error', 'yo');
		this.Log(PROCESS_NAME, MODULE_NAME, Path.basename(__filename), FUNCTION_NAME, 'warn', 'yo');
		this.Log(PROCESS_NAME, MODULE_NAME, Path.basename(__filename), FUNCTION_NAME, 'note', 'yo');
		this.Log(PROCESS_NAME, MODULE_NAME, Path.basename(__filename), FUNCTION_NAME, 'info', 'yo');
		this.Log(PROCESS_NAME, MODULE_NAME, Path.basename(__filename), FUNCTION_NAME, 'debug', 'yo');

		//Return
		//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','returned: '+_return.toString());
		return _return;
	}
}

//Functions

function ReturnObject(code, message){
	var return_message = code.toString()+': '+message;
	if(arguments.length > 2){
		for(var i = 2; i < arguments.length; i++){
			return_message += ('|'+Utility.inspect(arguments[i]));
		}
	}
	return [code,return_message];
}


//Exports and Execution
if(require.main === module){
	var _return = [1,null];
	var function_return = [1,null];
	function_return = new ApplicationLogger();
	console.error(function_return);
	if( function_return[0] === 0 ){
		var logger = function_return[1];
		if( logger.transports.length === 0 ){
			function_return = logger.Transports_New( true, 'directory', 'debug', null, null, true, null, null, false, null );
			if( function_return[0] === 0 ){
				function_return = logger.Transports_New( true, 'file', 'debug', 'test_log.log', null, true, null, null, false, null );
				if( function_return[0] === 0 ){
					function_return = logger.Transports_New( true, 'stream', 'debug', 'stderr', null, false, null, null, true, null );
					if( function_return[0] !== 0 ){
						_return = [function_return[0], 'logger.Transports_New: '+function_return[1]];
					}
				} else{
					_return = [function_return[0], 'logger.Transports_New: '+function_return[1]];
				}
			} else{
				_return = [function_return[0], 'logger.Transports_New: '+function_return[1]];
			}
		}
		if( _return[0] === 1 ){
			function_return = logger.Test();
			if( function_return[0] === 0 ){
				_return = [0,null];
			} else{
				_return = [function_return[1],'logger.Test: '+function_return[1]];
			}
		}
	} else{
		_return = [function_return[0], 'new ApplicationLogger: '+function_return[1]];
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
