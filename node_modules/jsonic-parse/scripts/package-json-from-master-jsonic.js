#!/usr/local/bin/node

/**
* @file package-json-from-master-jsonic.js
* @brief Generate a Node/npm 'package.json' from a Pacter 'master.jsonic' file.
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
	//External

//Constants
const FILENAME = 'package-json-from-master-jsonic.js';
const MODULE_NAME = 'PackageJSONFromMasterJSONIC';
var PROCESS_NAME = '';
if(require.main === module){
	PROCESS_NAME = 'package-json-from-master-jsonic';
} else{
	PROCESS_NAME = process.argv0;
}

//Functions
/**
* @fn PackageJSONDataFromMasterJSONObject
* @brief Interpret and return the data for the 'package.json' file from the given object.
* @param input_object
*	@type Object
*	@brief The object to derive the 'package.json' data from.
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
function PackageJSONDataFromMasterJSONObject( input_object ){
	var _return = [1,null];
	const FUNCTION_NAME = 'PackageJSONDataFromMasterJSONObject';
	//Variables
	var package_json_object = {
		name: '',
		version: '',
		description: '',
		keywords: '',
		homepage: '',
		bugs: '',
		license: '',
		author: {
			name: ''
		},
		contributiors: [
		],
		files: [],
		main: ''.
		browser: false,
		bin: {},
		man: '',
		directories: {
			lib: '',
			bin: '',
			man: '',
			doc: '',
			example: '',
			test: ''
		},
		repository: {
			type: '',
			url: ''
		},
		scripts: {
			prepublish: '',
			prepare: '',
			prepublishOnly: '',
			prepack: '',
			postpack: '',
			publish: '',
			postpublish: '',
			preinstall: '',
			install: '',
			postinstall: '',
			preuninstall: '',
			uninstall: '',
			postuninstall: '',
			preversion: '',
			version: '',
			postversion: '',
			pretest: '',
			test: '',
			posttest: '',
			prestop: '',
			stop: '',
			poststop: '',
			prestart: '',
			start: '',
			poststart: '',
			prerestart: '',
			restart: '',
			postrestart: '',
			preshrinkwrap: '',
			shrinkwrap: '',
			postshrinkwrap: ''
		},
		config: {},
		dependencies: {},
		devDependencies: {},
		peerDependencies: {},
		bundledDependencies: {},
		optionalDependencies: {},
		engines: {},
		engineStrict: {},
		os: [],
		cpu: [],
		private: false,
		publishConfig: {}
	};


	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','received: '+arguments.toString());
	//Parametre checks
	if(input_object == undefined) input_object = null;
	
	//Function
	if( input_object != null && typeof(input_object) === 'object' ){
		if( input_object.node.npm.name != null ){
			package_json_object.name = input_object.node.npm.name;
		} else if( input_object.name != null ){
			package_json_object.name = input_object.name;
		} else{
			console.error('Error: can\'t derive a value for the "name" field from input object: %o', input_object);
		}
		if( input_object.node.npm.version != null ){
			package_json_object.version = input_object.node.npm.version;
		} else if( input_object.version != null ){
			package_json_object.version = input_object.version;
		} else{
			console.error('Error: can\'t derive a value for the "version" field from input object: %o', input_object);
		}
		if( input_object.node.npm.description != null ){
			package_json_object.description = input_object.node.npm.description;
		} else if( input_object.description != null ){
			package_json_object.description = input_object.description;
		} else{
			console.error('Error: can\'t derive a value for the "description" field from input object: %o', input_object);
		}
		if( input_object.node.npm.keywords != null ){
			package_json_object.keywords = input_object.node.npm.keywords;
		} else if( input_object.keywords != null ){
			package_json_object.keywords = input_object.keywords;
		} else{
			console.error('Error: can\'t derive a value for the "keywords" field from input object: %o', input_object);
		}
		if( input_object.node.npm.homepage != null ){
			package_json_object.homepage = input_object.node.npm.homepage;
		} else if( input_object.homepage != null ){
			package_json_object.homepage = input_object.homepage;
		} else{
			console.error('Error: can\'t derive a value for the "homepage" field from input object: %o', input_object);
		}
		if( input_object.node.npm.bugs != null ){
			package_json_object.bugs = input_object.node.npm.bugs;
		} else if( input_object.bugs != null ){
			package_json_object.bugs = input_object.bugs;
		} else{
			console.error('Error: can\'t derive a value for the "bugs" field from input object: %o', input_object);
		}
		if( input_object.node.npm.license != null ){
			package_json_object.license = input_object.node.npm.license;
		} else if( input_object.license != null ){
			package_json_object.license = input_object.license;
		} else{
			console.error('Error: can\'t derive a value for the "license" field from input object: %o', input_object);
		}
		if( input_object.node.npm.author != null ){
			if( input_object.node.npm.author.name != null ){
				package_json_object.author.name = input_object.node.npm.author.name;
			} 
			if( input_object.node.npm.author.email != null ){
				package_json_object.author.email = input_object.node.npm.author.email
		} else if( input_object.author != null ){
			package_json_object.author = input_object.author;
		} else{
			console.error('Error: can\'t derive a value for the "author" field from input object: %o', input_object);
		}
		if( input_object.node.npm.contributors != null ){
			package_json_object.contributors = input_object.node.npm.contributors;
		} else if( input_object.contributors != null ){
			package_json_object.contributors = input_object.contributors;
		} else{
			console.error('Error: can\'t derive a value for the "contributors" field from input object: %o', input_object);
		}
		if( input_object.node.npm.files != null ){
			package_json_object.files = input_object.node.npm.files;
		} else if( input_object.files != null ){
			package_json_object.files = input_object.files;
		} else{
			console.error('Error: can\'t derive a value for the "files" field from input object: %o', input_object);
		}
		if( input_object.node.npm.main != null ){
			package_json_object.main = input_object.node.npm.main;
		} else if( input_object.main != null ){
			package_json_object.main = input_object.main;
		} else{
			console.error('Error: can\'t derive a value for the "main" field from input object: %o', input_object);
		}
		if( input_object.node.npm.bin != null ){
			package_json_object.bin = input_object.node.npm.bin;
		} else if( input_object.bin != null ){
			package_json_object.bin = input_object.bin;
		} else{
			console.error('Error: can\'t derive a value for the "bin" field from input object: %o', input_object);
		}
		if( input_object.node.npm.man != null ){
			package_json_object.man = input_object.node.npm.man;
		} else if( input_object.man != null ){
			package_json_object.man = input_object.man;
		} else{
			console.error('Error: can\'t derive a value for the "man" field from input object: %o', input_object);
		}
pnn()
pnn()
pnn()
pnn()
pnn(



	//Return
	//Log.log(PROCESS_NAME,MODULE_NAME,FILENAME,FUNCTION_NAME,'debug','returned: '+_return.toString());
	return _return;
}

//Exports and Execution
if(require.main === module){
	
} else{
	
}
