#!/usr/local/bin/node

/**
* @file function-factory.js
* @brief Quick, minimalist text-templating from the command line.
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
	const ApplicationLogStandard = require('./application-log-standard.js');
	//Standard
	const FileSystem = require('fs');
	const Path = require('path');
	//const ChildProcess = require('child_process');
	const Utility = require('util');
	//External
	const HandleBars = require('handlebars');
	const Inquirer = require('inquirer');
	const Clipboardy = require('clipboardy');
	const LogForm = require('logform');
	const Winston = require('winston');

//Constants
const FILENAME = 'function-factory.js';
const MODULE_NAME = 'FunctionFactory';
var PROCESS_NAME = '';
if(require.main === module){
	PROCESS_NAME = 'function-factory';
} else{
	PROCESS_NAME = process.argv0;
}

var ConfigObject = {
	template_directories: [
		Path.join( 'Resources', 'templates' )
	],
	defaults_directories: [
		Path.join( 'Resources', 'defaults' )
	]
};

var Logger = null;

//Functions
function Logger_Set( logger ){
	var _return = [1,null];
	const FUNCTION_NAME = 'Logger_Set';
	//Variables
	var function_return = [1,null];

	//Parametre checks
	if( logger == undefined || typeof(logger) !== 'object' ){
		_return = [-2,'Error: parametre "logger" is either null or not an object.'];
	}

	//Function
	if( _return[0] === 1 ){
		Logger = logger;
		_return = [0,null];
	}

	//Return
	return _return;
}

function Safe_Directory_Create_Sync( directory_path ){
	var _return = [1,null];
	if( directory_path != null && typeof(directory_path) === 'string' ){
		try{
			FileSystem.mkdirSync( directory_path, { recursive: true } );
			_return = [0,null];
		} catch(error){
			_return = [-3, Utility.format('Warn: %s', error)];
		}
	} else{
		_return = [-2, Utility.format('Error: directory_path is either null or not a string: %o', directory_path)];
	}
	return _return;
}
function ConfigObject_Load( config_filename ){
	var _return = [1,null];
	const FUNCTION_NAME = 'ConfigObject_Load';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('ConfigObject_Load received: %o', arguments)});
	var function_return = [1,null];
	if( config_filename != null && typeof(config_filename) === "string" ){
		try{
			FileSystem.accessSync( config_filename, (FileSystem.constants.R_OK | FileSystem.constants.W_OK) );
			function_return[0] = 0;
		} catch(error){
			_return = [-3, Utility.format('Error: can\'t access config file "%s": "%s"', config_filename, error)];
		}
		if( function_return[0] === 0 ){
			function_return = JSONICParse.ParseFilePath(config_filename);
			if( function_return[0] === 0 ){
				ConfigObject = function_return[1];
				_return = [0,function_return[1]];
			} else{
				_return = [function_return[0], 'JSONIC.ParseFilePath: '+function_return[1]];
			}
		}
	} else{
		_return = [-2, Utility.format('Error: config_filename is either null or not a string: %o', config_filename)];
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('ConfigObject_Load returned: %o', _return)});
	return _return;
}
function ConfigObject_Save( config_filename ){
	var _return = [1,null];
	var function_return = [1,null];
	if( config_filename != null && typeof(config_filename) === "string" ){
		var config_directory = Path.dirname( config_filename );
		try{
			FileSystem.mkdirSync( config_directory, { recursive: true } );
			function_return[0] = 0;
		} catch(error){
			function_return = [-3, Utility.format('Error: creating config directory "%s": "%s"', config_directory, error)];
		}
		if( function_return[0] === 0 ){
			try{
				FileSystem.writeFileSync( config_filename, JSON.stringify(ConfigObject, null, '\t'), 'utf8' );
				_return = [0,null];
			} catch(error){
				_return = [-4, Utility.format('Error: writing config file "%s": "%s"', config_filename, error)];
			}
		}
	} else{
		_return = [-2, Utility.format('Error: config_filename is either null or not a string: %o', config_filename)];
	}
	return _return;
}
	
function DefaultInputDataFromPath( path ){
	var _return = [1,null];
	const FUNCTION_NAME = 'DefaultInputDataFromPath';
	var function_return = [1,null];
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('received: %o', arguments)});
	if( path != null && typeof(path) === "string" ){
		function_return = JSONICParse.ParseFilePath(path);
		if( function_return[0] === 0 ){
			try{
				function_return = [0,JSON.stringify(function_return[1],null,'\t')];
			} catch(error){
				function_return = [-8, 'Error: JSON.stringify threw: '+error];
			}
			_return = function_return;
		} else{
			_return = [function_return[0], 'JSONICParse.ParseFilePath: '+function_return[1]];
		}
	} else{
		_return = [-2, Utility.format('Error: path is either null or not a string: %o', path)];
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('returned: %o', _return)});
	return _return;
}
function DefaultInputDataFromNameLiteral( name_literal ){
	var _return = [1,null];
	const FUNCTION_NAME = 'DefaultInputDataFromNameLiteral';
	var function_return = [1,null];
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('received: %o', arguments)});
	if( name_literal != null && typeof(name_literal) === "string" ){
		function_return = DefaultInputDataFromPath( name_literal );
		if( function_return[0] === 0 ){
			_return = [0,function_return[1]];
		} else{
			for( var i = 0; i < ConfigObject.defaults_directories.length; i++ ){
				var potential_path = Path.join( ConfigObject.defaults_directories[i], name_literal );
				function_return = DefaultInputDataFromPath( potential_path );
				if( function_return[0] === 0 ){
					i = ConfigObject.defaults_directories.length;
					_return = [0, function_return[1]];
				} else{
					_return = [-4, Utility.format('Warning: couldn\'t find a default input file for potential_path "%s": %o', potential_path, function_return)];
				}
			}
		}
		if( function_return[0] !== 0 ){
			_return = [-3, Utility.format('Error: couldn\'t find a default input file for name_literal "%s": %o', name_literal, function_return)];
		}
	} else{
		_return = [-2, Utility.format('Error: name_literal is either null or not a string "%o": %o', name_literal, function_return)];
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('returned: %o', _return)});
	return _return;
}

function DefaultInputDataFromGenericName( generic_name ){
	var _return = [1,null];
	const FUNCTION_NAME = 'DefaultInputDataFromGenericName';
	var function_return = [1,null];
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('received: %o', arguments)});
	if( generic_name != null && typeof(generic_name) === "string" ){
		var new_name = generic_name.replace( /[/\\]/g, ' ');
		var name_parts_array = new_name.split(' ');
		var properly_seperated_name = name_parts_array[0];
		for( var i = 1; i < name_parts_array.length; i++ ){
			properly_seperated_name = Path.join( properly_seperated_name, name_parts_array[i] );
		}
		if( Path.extname(properly_seperated_name) !== '.json' ){
			properly_seperated_name += '.json';
		}
		function_return = DefaultInputDataFromNameLiteral( properly_seperated_name );
		if( function_return[0] === 0 ){
			_return = [0,function_return[1]];
		} else{
			_return = [-3, Utility.format('Error: couldn\'t find a default input file for generic_name "%s": %o', generic_name, function_return)];
		}
	} else{
		_return = [-2, Utility.format('Error: generic_name is either null or not a string: "%s"', generic_name)];
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('returned: %o', _return)});
	return _return;
}

function TemplateFunctionFromPath( path ){
	var _return = [1,null];
	const FUNCTION_NAME = 'TemplateFunctionFromPath';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('received: %o', arguments)});
	var function_return = [1,null];
	if( path != null && typeof(path) === "string" ){
		try{
			FileSystem.accessSync( path, (FileSystem.constants.R_OK) );
			function_return[0] = 0;
		} catch(error){
			_return = [-3, Utility.format('Error: template "%s" cannot be read: %s', path, error)];
		}
		if( function_return[0] === 0 ){
			var template_data = FileSystem.readFileSync( path, 'utf8' );
			if( template_data != null ){
				var template_function = HandleBars.compile(template_data);
				if( template_function != null && typeof(template_function) === "function" ){
					_return = [0,template_function];
				} else{
					_return = [-8, Utility.format('Error: couldn\'t compile template_data "%s": %o', template_data, template_function)];
				}
			} else{
				_return = [-4, Utility.format('Error: couldn\'t read file "%s": "%s"', path, template_data)];
			}
		}
	} else{
		_return = [-2, Utility.format('Error: path is either null or not a string: %o', path)];
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('returned: %o', _return)});
	return _return;
}
function TemplateFunctionFromNameLiteral( name_literal ){
	var _return = [1,null];
	const FUNCTION_NAME = 'TemplateFunctionFromNameLiteral';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('received: %o', arguments)});
	var function_return = [1,null];
	if( typeof(name_literal) === "string" ){
		function_return = TemplateFunctionFromPath( name_literal );
		if( function_return[0] === 0 ){
			_return = [0, function_return[1]];
		} else{
			for( var i = 0; i < ConfigObject.template_directories.length; i++ ){
				var potential_path = Path.join( ConfigObject.template_directories[i], name_literal );
				function_return = TemplateFunctionFromPath( potential_path );
				if( function_return[0] === 0 ){
					i = ConfigObject.template_directories.length;
					_return = [0, function_return[1]];
				} else{
					_return = [-4, Utility.format('Waring: couldn\'t load template_function from potential_path "%s": %o: %o', potential_path, function_return, _return)];
				}
			}
		}
		if( function_return[0] !== 0 ){
			_return = [-3, Utility.format('Error: couldn\'t derive a template_function for name_literal "%s": %o', name_literal, function_return)];
		}
	} else{
		_return = [-2, Utility.format('Error: name_literal is not a string %o', name_literal)];
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('returned: %o', _return)});
	return _return;
}
function TemplateFunctionFromGenericName( generic_name ){
	var _return = [1,null];
	const FUNCTION_NAME = 'TemplateFunctionFromGenericName';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('received: %o', arguments)});
	var function_return = [1,null];
	if( generic_name != null && typeof(generic_name) === "string" ){
		var new_name = generic_name.replace( /[/\\]/g, ' ');
		var name_parts_array = new_name.split(' ');
		var properly_seperated_name = name_parts_array[0];
		for( var i = 1; i < name_parts_array.length; i++ ){
			properly_seperated_name = Path.join( properly_seperated_name, name_parts_array[i] );
		}
		if( Path.extname(properly_seperated_name) !== '.hbs' ){
			properly_seperated_name += '.hbs';
		}
		function_return = TemplateFunctionFromNameLiteral( properly_seperated_name );
		if( function_return[0] === 0 ){
			_return = [0,function_return[1]];
		} else{
			_return = [-3, Utility.format('Error: couldn\'t find a template_function for generic_name "%s": %o', generic_name, function_return)];
		}
	} else{
		_return = [-2, Utility.format('Error: generic_name is either null or not a string: "%s"', generic_name)];
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('returned: %o', _return)});
	return _return;
}

function OutputApplyPostRE( template_output, post_re ){
	var _return = [1,null];
	const FUNCTION_NAME = 'OutputApplyPostRE';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('received: %o', arguments)});
	if( template_output != null && typeof(template_output) === "string" ){
		if( post_re != null ){
			if( Array.isArray(post_re) === true ){
				for( var i = 0; i < post_re.length; i++ ){
					var regex = new RegExp(post_re[i].search, post_re[i].flags);
					template_output = template_output.replace(regex, post_re[i].replace);
				}
				_return = [0, template_output];
			} else{
				_return = [-3, Utility.format('Error: post_re is not an array: %o', post_re)];
			}
		} else{
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'warn', message: Utility.format('Warn: post_re is null: %o', post_re)});
			_return = [0, template_output];
		}
	} else{
		_return = [-2, Utility.format('Error: template_output is either null or not a string: %o', template_output)];
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('returned: %o', _return)});
	return _return;
}

function OutputFromInput( input_context, template_function ){
	var _return = [1,null];
	const FUNCTION_NAME = 'OutputFromInput';
	var function_return = [1,null];
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('OuputputFromInput received: %o %o', input_context, template_function)});
	if( input_context != null && typeof(input_context) === "object"){
		if( typeof(template_function) === "function" ){
			_return = [0,template_function(input_context)];
		} else if( template_function == null ){
			if( input_context.templatename != null ){
				function_return = TemplateFunctionFromNameLiteral( input_context.templatename );
				if( function_return[0] === 0 ){
					_return = [0,function_return[1]( input_context )];
				} else{
					_return = [-8, Utility.format('Error: couldn\'t find template from name literal "%s": %o', input_context.templatename, function_return)];
				}
			} else if( input_context.template != null ){
				function_return = TemplateFunctionFromGenericName( input_context.template );
				if( function_return[0] === 0 ){
					_return = [0,function_return[1]( input_context )];
				} else{
					_return = [-9, Utility.format('Error: couldn\'t find template from generic name "%s": %o', input_context.template, function_return)];
				}
			} else{
				_return = [-4, Utility.format('Error: neither templatename nor template is specified in the given input_context %o', input_context)];
			}
		} else{
			_return = [-3, Utility.format('Error: template_function is not a function or null %o', template_function)];
		}
	} else{
		_return = [-2, Utility.format('Error: input_context is either null or not an object %o', input_context)];
	}
	if( _return[0] === 0 ){
		function_return = OutputApplyPostRE( _return[1], input_context.post_re );
		if( function_return[0] === 0 ){
			_return = [0, function_return[1], function_return];
		} else{
			_return = [-16, Utility.format('Error: applying post_re %o on output "%s": %o', input_context.post_re, _return[1], function_return)];
		}
	} 
	if( _return[0] !== 0 ){
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('Error: %o', _return)});
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('OutputFromInput returned: %o', _return)});
	return _return;
}
function OutputFromInquirerEditorAnswer( answer ){
	var _return = [1,null];
	const FUNCTION_NAME = 'OutputFromInquirerEditorAnswer';
	var function_return = [1,null];
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('OutputFromInquirerEditorAnswer received: %o', arguments)});
	if( answer.editor_input != null ){
		function_return = JSONICParse.ParseFileData(answer.editor_input);
		if( function_return[0] === 0 ){
			function_return = OutputFromInput(function_return[1]);
			if( function_return[0] === 0 ){
				_return = [0, function_return[1]];
			} else{
				_return = [-4, Utility.format('Error: generating output from given input answer "%o": %o', answer, function_return)];
			}
		} else{
			_return = [function_return[0], Utility.format('JSONICParse.ParseFileData: '+function_return[1])];
		}
	} else{
		_return = [-2, Utility.format('Error: answer invalid: %o', answer)];
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('OutputFromInquirerEditorAnswer returned: %o', _return)});
	return _return;
}
function ProduceOutput( output, options ){
	var _return = [1,null];
	const FUNCTION_NAME = 'ProduceOutput';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('received: %o', arguments)});
	var function_return = [1,null];
	if( output != null && typeof(output) === "string" ){
		if( options != null && typeof(options) === "object" ){
			if( options.stdout != null ){
				console.log(output);
				function_return[0] = 0;
			} else if( options.output != null ){
				try{
					FileSystem.writeFileSync( options.output, output, 'utf8' );
					function_return[0] = 0;
				} catch(error){
					function_return = [-4, Utility.format('Error: couldn\'t write output "%s" to options.output "%s": %o', output, options.output, error)];
				}
			} else if( options.pasteboard != null ){
				try{
					Clipboardy.writeSync(output);
					function_return[0] = 0;
				} catch(error){
					function_return = [-5, Utility.format('Error: error copying output "%s" to clipboard: "%s"', output, error)];
				}
			}
			if( function_return[0] === 0 ){
				_return = [0,null];
			} else{
				_return = function_return;
			}
		} else{
			_return = [-3, Utility.format('Error: options is either null or not an object: %o', options)];
		}
	} else{
		_return = [-2, Utility.format('Error: output is either null or not a string: %o', output)];
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('returned: %o', _return)});
	return _return;
}
async function Input_Inquirer_Editor( options ){
	var _return = [1,null];
	const FUNCTION_NAME = 'Input_Inquirer_Editor';
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('Input_Inquirer_Editor received: %o', options)});
	var function_return = [1,null];
	var output = null;
	if( options != null && typeof(options) === "object" ){
		var default_input_data = null;
		if( options.edit != null ){
			function_return = DefaultInputDataFromGenericName( options.edit );
			if( function_return[0] === 0 ){
				default_input_data = function_return[1];
			} else{
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'warn', message: Utility.format('DefaultInputDataFromGenericName: %o',function_return)});
			}
		}
		var inquirer_questions = [
			{
				type: 'editor',
				name: 'editor_input',
				message: 'Enter input context (JSON).',
				default: default_input_data
			}
		];
		try{
			var inquirer_answer = await Inquirer.prompt( inquirer_questions );
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('inquirer_answer: %o', inquirer_answer)});
			function_return = OutputFromInquirerEditorAnswer( inquirer_answer );
			if( function_return[0] === 0 ){
				output = function_return[1];
				function_return = ProduceOutput( output, options );
				if( function_return[0] === 0 ){
					_return = [0,null];
				} else{
					_return = [-16, Utility.format('Error: couldn\'t produce output "%s" wth options %o: %o', output, options, function_return)];
				}
			} else{
				_return = [-8, Utility.format('Error: couldn\'t construct output from inquirer_editor_answer %o: %o', inquirer_answer, function_return)];
			}
		} catch(error){
			_return = [-4, Utility.format('Error: inquirer_questions %o causes Inquirer.prompt to throw an error: "%s"', inquirer_questions, error)];
		}
	} else{
		_return = [-2, Utility.format('Error: options is either null or not an object: %o', options)];
	}
	if( _return[0] !== 0 ){
		Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: Utility.format('%o',_return)});
	}
	process.exitCode = _return[0];
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: Utility.format('Input_Inquirer_Editor returned: %o', _return)});
	return _return;
}

//Exports and Execution
if(require.main === module){
	var _return = [1, null];
	const FUNCTION_NAME = 'MainExecutionFunction';
	//Dependencies
		//Internal
		//Standard
		//External
		const CommandLineArguments = require('command-line-args');
		const CommandLineUsage = require('command-line-usage');
		const EnvPaths = require('env-paths');
	//Constants
	const EnvironmentPaths = EnvPaths('function-factory');
	//Variables
	var function_return = [1,null];
	//Logger
	function_return = Logger_Set( Winston.createLogger({
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
	}) );

	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'Start of execution block.'});
	//Options
	const OptionDefinitions = [
		//UI
		{ name: 'help', alias: 'h', type: Boolean, description: 'Writes this help text to stdout.' },
		{ name: 'verbose', alias: 'v', type: Boolean, description: 'Verbose output to stderr.' },
		//Input
		{ name: 'stdin', alias: 'i', type: Boolean, description: 'Read input from stdin.' },
		{ name: 'input', alias: 'I', type: String, description: 'The name of a JSON file to be used as input for the template.'},
		{ name: 'edit', alias: 'e', type: String, description: 'Edit the input in $EDITOR, optionally specifying a file in the "defaults" directory to use as a base.'},
		{ name: 'ask', alias: 'a', type: String, description: 'Interactively prompt for input properties, optionally specifying a file in the "defaults" directory to use as a base.'},
		{ name: 'do', alias: 'D', type: String, defaultOption: true, description: 'Select a default input file and an output template based on a signle string.' },
		//Output
		{ name: 'stdout', alias: 'o', type: Boolean, description: 'Write output to stdout.' },
		{ name: 'output', alias: 'O', type: String, description: 'The name of the file to write output to.' },
		{ name: 'pasteboard', alias: 'p', type: Boolean, description: 'Copy output to pasteboard (clipboard).'},
		//Config
		{ name: 'config', alias: 'c', type: Boolean, description: 'Print configuration values and information to stdout.' },
		{ name: 'config-file', alias: 'C', type: String, description: 'Use the given config file instead of the default.' },
		{ name: 'defaults', alias: 'd', type: Boolean, description: 'Print a list of the "defaults" files.' },
		{ name: 'templates', alias: 't', type: Boolean, description: 'Print a list of available templates to stdout.' },
		{ name: 'template-override', alias: 'T', type: String, description: 'Override the template to the file specified.' }
	];
	var Options = CommandLineArguments( OptionDefinitions );
	//Config
	ConfigObject.template_directories.push( Path.join( EnvironmentPaths.data, 'templates' ) );
	ConfigObject.defaults_directories.push( Path.join( EnvironmentPaths.data, 'defaults' ) );
	var config_filename = Path.join( EnvironmentPaths.config, 'config.json' );
	if( Options['config-file'] != null ){
		config_filename = Options['config-file'];
	}
	if( config_filename != null ){
		function_return = ConfigObject_Load( config_filename );
		if( function_return[0] !== 0 ){
			function_return = ConfigObject_Save( config_filename );
			if( function_return[0] !== 0 ){
				Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'error', message: Utility.format('Error: writing config_filename "%s": %o', config_filename, function_return)});
			}
		}
	}

	if(Options.help === true){
		const help_sections_array = [
			{
				header: 'function-factory',
				content: 'Quick, minimalist text-templating from the command line.',
			},
			{
				header: 'Options',
				optionList: OptionDefinitions
			}
		]
		var help_message = CommandLineUsage(help_sections_array);
		console.log(help_message);
	}
	if(Options.config === true){
		console.log('Config file: "%s"\n%o\n', config_filename, ConfigObject);
	}
	if(Options.defaults === true){
	}
	if(Options.templates === true){
	}

	if( _return[0] === 1 ){
		if( Options.edit !== undefined ){
			Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'info', message: 'In editor mode.'});
			_return = Input_Inquirer_Editor( Options );
		} /*else if( Options.ask !== undefined ){
			

		var input_filename = './input.json';
		if(Options.input != null) input_filename = Options.input;
		var input_data = FileSystem.readFileSync(input_filename, 'utf8');
		if(input_data != null){
			var json_input = StripJSONComments(input_data);
			if(json_input != null){
				var json_object = ParseJSON(json_input);
				if(json_object != null){
					var template_filename = json_object.templatename;
					if(json_object.template != null) template_filename = Path.join( template_directory, json_object.template );
					if(Options.template != null) template_filename = Options.template;
					if(template_filename != null){
						var template_data = FileSystem.readFileSync(template_filename, 'utf8');
						if(template_data != null){
							var template_function = HandleBars.compile(template_data);
							if(template_function != null){
								var output_data = template_function(json_object);
								if(output_data != null){
									if(json_object.post_re != null){
										var regex = new RegExp(json_object.post_re[0].search,json_object.post_re[0].flags);
										output_data = output_data.replace(regex,json_object.post_re[0].replace);
									}
									var output_filename = 'output';
									if(Options.output != null) output_filename = Options.output;
									FileSystem.writeFileSync(output_filename, output_data);
								} else _return = [1,'Problem with template_function.'];
							} else _return = [1,'Problem with compiling template_data: '+template_data];
						} else _return = [1,'Problem couldn\'t open template_filename: '+template_filename];
					} else _return = [1,'Property \'templatename\' invalid: '+json_object.toString()];
				} else _return = [1,'Problem with parsing json_input: '+json_input];
			} else _return = [1,'Problem with stripping JSON comments: '+input_data];
		} else _return = [1,'Couldn\'t open input file: '+input_filename];
		console.log(_return[1]);
	}
	process.exitCode = _return[0];*/
	}
	Logger.log({process: PROCESS_NAME, module: MODULE_NAME, file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: 'End of execution block.'});
} else{
	
}
