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
	//Standard
	const FileSystem = require('fs');
	const Path = require('path');
	const ChildProcess = require('child_process');
	const Utility = require('util');
	//External
	const HandleBars = require('handlebars');
	const StripJSONComments = require('strip-json-comments');
	const ParseJSON = require('parse-json');
	const Inquirer = require('inquirer');
	const Clipboardy = require('clipboardy');

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


//Functions
function ConfigObject_Load( config_filename ){
	var _return = [1,null];
	var function_return = [1,null];
	if( config_filename != null && typeof(config_filename) === "string" ){
		try{
			FileSystem.accessSync( config_filename, (FileSystem.constants.R_OK | FileSystem.constants.W_OK) );
			function_return[0] = 0;
		} catch(error){
			_return = [-3, Utility.format('Error: can\'t access config file "%s": "%s"', config_filename, error)];
		}
		if( function_return[0] === 0 ){
			function_return = FileSystem.readFileSync( config_filename, 'utf8' );
			if( function_return != null ){
				function_return = StripJSONComments( function_return );
				if( function_return != null ){
					function_return = ParseJSON( function_return );
					if( function_return != null ){
						config_object = function_return;
					} else{ //Error parsing given config-file JSON.
						_return = [-16, Utility.format('Error: parsing JSON data: %s', function_return)];
					}
				} else{ //Error stripping JSON comments from given config file.
					_return = [-8, Utility.format('Error: stripping comments from file data: %s', function_return)];
				}
			} else{ //Error reading given config file.
				_return = [-4, Utility.format('Error: couldn\'t read config_filename "%s": %o', config_filename, function_return)];
			}
		}
	} else{
		_return = [-2, Utility.format('Error: config_filename is either null or not a string: %o', config_filename)];
	}
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
	var function_return = [1,null];
	if( path != null && typeof(path) === "string" ){
		try{
			FileSystem.accessSync( path, (FileSystem.constants.R_OK) );
			function_return[0] = 0;
		} catch(error){
			function_return = [-3, Utility.format('Error: default input file "%s" cannot be read: %o', path, error)];
		}
		if( function_return[0] === 0 ){
				var file_data = FileSystem.readFileSync( path, 'utf8' );
				if( file_data != null ){
					var stripped_file_data = StripJSONComments(file_data);
					if( stripped_file_data != null ){
						var json_object = ParseJSON(stripped_file_data);
						if( json_object != null ){
							_return = [0,json_object];
						} else{
							_return = [-16, Utility.format('Error: couldn\'t parse stripped_file_data "%s": %o', stripped_file_data, json_object)];
						}
					} else{
						_return = [-8, Utility.format('Error: couldn\'t strip comments from file_data "%s": %o', file_data, stripped_file_data)];
					}
				} else{
					_return = [-4, Utility.format('Error: couldn\'t read file path "%s": %o', path, file_data)];
				}
		}
	} else{
		_return = [-2, Utility.format('Error: path is either null or not a string: %o', path)];
	}
	return _return;
}
function DefaultInputDataFromNameLiteral( name_literal ){
	var _return = [1,null];
	var function_return = [1,null];
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
	return _return;
}

function DefaultInputDataFromGenericName( generic_name ){
	var _return = [1,null];
	var function_return = [1,null];
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
	return _return;
}

function TemplateFunctionFromPath( path ){
	var _return = [1,null];
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
	return _return;
}
function TemplateFunctionFromNameLiteral( name_literal ){
	var _return = [1,null];
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
	return _return;
}
function TemplateFunctionFromGenericName( generic_name ){
	var _return = [1,null];
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
	return _return;
}

function OutputApplyPostRE( template_output, post_re ){
	var _return = [1,null];
	if( template_output != null && typeof(template_output) === "string" ){
		if( post_re != null ){
			if( Array.isArray(post_re) === true ){
				for( var i = 0; i < post_re.length; i++ ){
					var regex = new RegExp(post_re[i].search, post_re[i].flags);
					output = output.replace(regex, post_re[i].replace);
				}
				_return = [0, output];
			} else{
				_return = [-3, Utility.format('Error: post_re is not an array: %o', post_re)];
			}
		} else{
			_return = [0, output, Utility.format('Warn: post_re is null: %o', post_re)];
		}
	} else{
		_return = [-2, Utility.format('Error: template_output is either null or not a string: %o', template_output)];
	}
	return _return;
}

function OutputFromInput( input_context, template_function ){
	var _return = [1,null];
	var function_return = [1,null];
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
		console.error(_return);
	}
	return _return;
}
function OutputFromInquirerEditorAnswer( answer ){
	var _return = [1,null];
	var function_return = [1,null];
	if( answer.editor_input != null ){
		function_return = OutputFromInput(answer.editor_input);
		if( function_return[0] === 0 ){
			_return = [0, function_return[1]];
		} else{
			_return = [-3, Utility.format('Error: generating output from given input answer "%o": %o', answer, function_return)];
		}
	} else{
		_return = [-2, Utility.format('Error: answer invalid: %o', answer)];
	}
	return _return;
}
function ProduceOutput( output, options ){
	var _return = [1,null];
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
	return _return;
}
async function Input_Inquirer_Editor( options ){
	var _return = [1,null];
	var function_return = [1,null];
	if( options != null && typeof(options) === "object" ){
		var default_input_data = null;
		if( options.edit != null ){
			function_return = DefaultInputDataFromGenericName( options.edit );
			if( function_return[0] === 0 ){
				default_input_data = function_return[1];
			} else{
				console.error(function_return);
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
			function_return = OutputFromInquirerEditorAnswer( inquirer_answer );
			if( function_return[0] === 0 ){
				function_return = ProduceOutput( output, options );
				if( function_return[0] === 0 ){
					_return = [0,null];
				} else{
					_return = [-16, Utility.format('Error: couldn\'t produce output "%s" wth options %o: %o', output, options, function_return)];
				}
			} else{
				_return = [-8, Utility.format('Error: couldn\'t construct output from inquirer_editor_answer %o: %o', answer, function_return)];
			}
		} catch(error){
			_return = [-4, Utility.format('Error: inquirer_questions %o cause Inquirer.prompt to throw an error: "%s"', inquirer_question, error)];
		}
	} else{
		_return = [-2, Utility.format('Error: options is either null or not an object: %o', options)];
	}
	if( _return[0] !== 0 ){
		console.error(_return);
	}
	process.exitCode = _return[0];
	return _return;
}

//Exports and Execution
if(require.main === module){
	var _return = [-1, null];
	const CommandLineArguments = require('command-line-args');
	const CommandLineUsage = require('command-line-usage');
	const EnvPaths = require('env-paths');

	const EnvironmentPaths = EnvPaths('function-factory');

	const OptionDefinitions = [
		{ name: 'help', alias: 'h', type: Boolean, description: 'Writes this help text to stdout.' },
		{ name: 'verbose', alias: 'v', type: Boolean, description: 'Verbose output to stderr.' },
		{ name: 'stdin', alias: 'i', type: Boolean, description: 'Read input from stdin.' },
		{ name: 'input', alias: 'I', type: String, description: 'The name of a JSON file to be used as input for the template.'},
		{ name: 'edit', alias: 'e', type: String, description: 'Edit the input in $EDITOR, optionally specifying a file in the "defaults" directory to use as a base.'},
		{ name: 'ask', alias: 'a', type: String, description: 'Interactively prompt for input properties, optionally specifying a file in the "defaults" directory to use as a base.'},
		{ name: 'stdout', alias: 'o', type: Boolean, description: 'Write output to stdout.' },
		{ name: 'output', alias: 'O', type: String, description: 'The name of the file to write output to.' },
		{ name: 'pasteboard', alias: 'p', type: Boolean, description: 'Copy output to pasteboard (clipboard).'},
		{ name: 'config', alias: 'c', type: Boolean, description: 'Print configuration values and information to stdout.' },
		{ name: 'config-file', alias: 'C', type: String, description: 'Use the given config file instead of the default.' },
		{ name: 'defaults', alias: 'd', type: Boolean, description: 'Print a list of the "defaults" files.' },
		{ name: 'do', alias: 'D', type: String, defaultOption: true, description: 'Select a default input file and an output template based on a signle string.' },
		{ name: 'templates', alias: 't', type: Boolean, description: 'Print a list of available templates to stdout.' },
		{ name: 'template-override', alias: 'T', type: String, description: 'Override the template to the file specified.' }
	];
	var Options = CommandLineArguments( OptionDefinitions );
	var function_return = [1,null];

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
				console.error('Error: writing config_filename "%s": %o', config_filename, function_return);
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
			/*var temp_filename = Path.join(EnvironmentPaths.temp, 'function-factory_input.temp');
			var default_input_filename = null;
			if( Options.edit != null ){
				default_input_filename = LookupInputDefaultsFile( Options.edit );
			}
			var temp_filedata = FileSystem.readFileSync(default_input_filename, 'utf8');
			if( temp_filedata == null ){
				temp_filedata = ' ';
			}
			try{
				FileSystem.writeFileSync( temp_filename, temp_filedata, 'utf8' );
				function_return = 0;
			} catch(error){
				console.error('Error: can\'t create temporary file "%s": "%s"', temp_filename, error);
				function_return = -1;
			}
			if( function_return === 0 ){
				function_return = ChildProcess.spawnSync('$EDITOR', temp_filename);
				if( function_return.status === 0 && function_return.error == null ){
					input_data = FileSystem.readFileSync( temp_filename, 'utf8' );
				} else{
					console.error('Critical: $EDITOR child process failed with status %d signal %s and error "%s"', function_return.status, function_return.signal, function_return.error);
				}
			}*/
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
} else{
	
}
