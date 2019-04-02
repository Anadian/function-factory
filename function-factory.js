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
	//External

//Constants
const FILENAME = 'function-factory.js';
const MODULE_NAME = 'FunctionFactory';
var PROCESS_NAME = '';
if(require.main === module){
	PROCESS_NAME = 'function-factory';
} else{
	PROCESS_NAME = process.argv0;
}

//Functions

//Exports and Execution
if(require.main === module){
	var _return = [-1, null];
	const CommandLineArguments = require('command-line-args');
	const CommandLineUsage = require('command-line-usage');
	const EnvPaths = require('env-paths');
	const StripJSONComments = require('strip-json-comments');
	const ParseJSON = require('parse-json');
	const HandleBars = require('handlebars');

	const EnvironmentPaths = EnvPaths('function-factory');

	const OptionDefinitions = [
		{ name: 'help', alias: 'h', type: Boolean, description: 'Writes this help text to stdout.' },
		{ name: 'verbose', alias: 'v', type: Boolean, description: 'Verbose output to stderr.' },
		{ name: 'stdin', alias: 'i', type: Boolean, description: 'Read input from stdin.' },
		{ name: 'input', alias: 'I', type: String, description: 'The name of a file which will be uploaded; can be specified multiple times if the operation supports it.', multiple: true, defaultOption: true },
		{ name: 'stdout', alias: 'o', type: Boolean, description: 'Write output to stdout.' },
		{ name: 'output', alias: 'O', type: String, description: 'The name of the file to write output to.' },
		{ name: 'template-override', alias: 'T', type: String, description: 'Override the template to the file specified.' },
		{ name: 'templates', alias: 't', type: Boolean, description: 'Print a list of available templates to stdout.' },
		{ name: 'config', alias: 'c', type: Boolean, description: 'Print configuration values and information to stdout.' },
		{ name: 'config-file', alias: 'C', type: String, description: 'Use the given config file instead of the default.' }
	];
	var Options = CommandLineArguments( OptionDefinitions );
	var function_return = null;
	var config_object = {
	};
	
	if( Options['config-file'] != null ){
		function_return = FileSystem.existsSync( Options['config-file'] );
		if( function_return === true ){
			function_return = FileSystem.readFileSync( Options['config-file'], 'utf8' );
			if( function_return != null ){
				function_return = StripJSONComments( function_return );
				if( function_return != null ){
					function_return = ParseJSON( function_return );
					if( function_return != null ){
						config_object = function_return;
					} else{ //Error parsing given config-file JSON.
					}
				} else{ //Error stripping JSON comments from given config file.
					_return = [];
				}
			} else{ //Error reading given config file.
			}
		} else{ //Error: given config file does not exist.
		}
	} else{ //No config file specified so load the default.
		function_return = FileSystem.existsSync( EnvironmentPaths.config );
		if( function_return === true ){
			function_return = FileSystem.existsSync( Path.join(EnvironmentPaths.config, 'config.json') );
			if( function_return === true ){
				function_return = FileSystem.readFileSync( Path.join(EnvironmentPaths.config, 'config.json'), 'utf8' );
				if( function_return != null ){
					function_return = StripJSONComments( function_return );
					if( function_return != null ){
						function_return = ParseJSON( function_return );
						if( function_return != null ){
							config_object = function_return;
						} else{ //Error parsing standard config-file JSON.
						}
					} else{ //Error stripping JSON comments from standard config file.
					}
				} else{ //Error reading standard config file.
				}
			} else { //Error: standard config file does not exist.
			}
		} else{ //Error: standard config directory does not exist.
			Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'warn','The standard config directory, '+EnvironmentPaths.config+', doesn\'t exists so we\'re going to try and create it.');
			try{
				FileSystem.mkdirSync( EnvironmentPaths.config, { recursive: true } );
				function_return = 0;
			} catch(error){
				Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'error','Error, '+error+', when trying to make directory, '+EnvironmentPaths.config+'.');
				function_return = -1;
			}
		}
	}

	if(Options.help === true){
		const help_sections_array = [
			{
				header: 'FunctionFactory',
				content: 'Quick, minimalist text-templating from the command line.',
			},
			{
				header: 'Options',
				optionList: OptionDefinitions
			}
		]
		var help_message = CommandLineUsage(help_sections_array);
		console.log(help_message);
	} else{
		var input_filename = './input.json';
		if(Options.input != null) input_filename = Options.input;
		var input_data = FileSystem.readFileSync(input_filename, 'utf8');
		if(input_data != null){
			var json_input = StripJSONComments(input_data);
			if(json_input != null){
				var json_object = ParseJSON(json_input);
				if(json_object != null){
					var template_filename = json_object.templatename;
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
	process.exitCode = _return[0];
} else{
	
}
