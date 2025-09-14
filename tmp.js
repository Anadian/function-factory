{{#doc}}/**
### {{#if class}}{{&class}}.{{^static}}prototype.{{/static}}{{/if}}{{&name}}
> {{&description}}

{{#parametres}}#### Parametres
| name | type | description |
| --- | --- | --- |
{{#params}}| {{name}} | {{&type}} | {{&description}} {{#default}}\[default: {{&value}}\]{{/default}} |
{{/params}}

{{/parametres}}{{#options}}##### `options` Properties
{{#standardOptions}}> Includes [Standard Options](#StandardOptions).
{{/standardOptions}}| name | type | default | description |
| --- | --- | --- | --- |
{{#opts}}| {{name}} | {{&type}} | {{&default}} | {{&description}} |
{{/opts}}

{{/options}}{{#return}}#### Returns
| type | description |
| --- | --- |
| {{&type}} | {{&description}} |

{{/return}}
{{#throw}}#### Throws
| code | type | condition |
| --- | --- | --- |
{{#throws}}| '{{code}}' | {{&type}} | {{&description}} |
{{/throws}}

{{/throw}}
#### History
| version | change |
| --- | --- |
| 0.0.1 | WIP |
*/{{/doc}}
{{#func}}{{#if class}}{{&class}}.{{^static}}prototype.{{/static}}{{else}}{{#asynchronous}}async {{/asynchronous}}function {{/if}}{{&name}}{{#if class}} = {{#asynchronous}}async {{/asynchronous}}function{{/if}}({{#parametres}}{{#params}} {{name}}{{#default}} = {{&value}}{{/default}},{{/params}}{{/parametres}}){
{{#smartConstructor}}	if( !new.target ){
		return new {{&name}}({{#parametres}}{{#params}}{{name}}, {{/params}}{{/parametres}});
	}{{/smartConstructor}}
	const FUNCTION_NAME = '{{#if class}}{{&class}}.{{^static}}prototype.{{/static}}{{/if}}{{&name}}';
	{{#options}}const DEFAULT_OPTIONS = {
{{#opts}}		{{name}}: {{&default}}, // {{&description}}
{{/opts}}	};{{/options ~}}

	// Variables
{{#argumentsArray}}	var arguments_array = Array.from(arguments);
	this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `received: ${arguments_array}`});
{{/argumentsArray}}{{#return}}	var _return = null;
{{/return}}{{#throw}}	var return_error = null;
{{/throw}}{{#options}}	var options = {};
{{/options}}
{{#parametres}}	// Parametre checks
{{#params}}
	if( {{& CheckNotType type name}} ){
		return_error = new TypeError('Param "{{name}}" is not of type {{type}}.');
		return_error.code = 'ERR_INVALID_ARG_TYPE';
		throw return_error;
	}
{{/params}}{{/parametres}}
{{#options}}	// Options
{{^bedrock}}	if( input_options.noDefaults !== true ){
		if( input_options.noDynamic !== true ){
			var dynamic_defaults = {};
			options = Object.assign( {}, DEFAULT_OPTIONS, dynamic_defaults, input_options );
		} else{
			options = Object.assign( {}, DEFAULT_OPTIONS, input_options );
		} // noDynamic
	} else{
		options = Object.assign( {}, input_options );
	} // noDefaults
{{/bedrock}}{{#bedrock}}	var { options, log_function ?? this?.logger?.log, validation_function } = Bedrock.deriveOptions( input_options, DEFAULT_OPTIONS );
		if( validation_function( input_options
{{/bedrock}}	if( options.noop !== true ){
		// Function
	} // noop
{{/bedrock}}{{/options}}{{^options}}	// Function
{{/options}}
{{#return}}	// Return
	this?.logger?.log({file: FILENAME, function: FUNCTION_NAME, level: 'debug', message: `returned: ${_return}`});
{{^smartConstructor}}	return _return;
{{/smartConstructor ~}}
{{#smartConstructor}}	return this;
{{/smartConstructor ~}}
{{/return ~}} }{{/func}} // {{#if class}}{{&class}}.{{^static}}prototype.{{/static}}{{/if}}{{&name}}

