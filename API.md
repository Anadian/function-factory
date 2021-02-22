
# [function-factory.js](source/main.js)
> Simple, minimalist templating from the command line.

Internal module name: `FunctionFactory`

Author: Anadian

Code license: MIT
```
	Copyright 2020 Anadian
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
```
Documentation License: [![Creative Commons License](https://i.creativecommons.org/l/by-sa/4.0/88x31.png)](http://creativecommons.org/licenses/by-sa/4.0/)
> The source-code comments and documentation are written in [GitHub Flavored Markdown](https://github.github.com/gfm/).

> The type notation used in this documentation is based off of the [Google Closure type system](https://github.com/google/closure-compiler/wiki/Types-in-the-Closure-Type-System).

> The status and feature lifecycle keywords used in this documentation are based off of my own standard [defined here](https://github.com/Anadian/FeatureLifeCycleStateStandard).


## Functions


### setLogger
> Allows this module's functions to log the given logger object.

Parametres:
| name | type | description |
| --- | --- | --- |
| logger | {?object} | The logger to be used for logging or `null` to disable logging. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if `logger` is neither an object nor `null` |

Status:
| version | change |
| --- | --- |
| 0.0.0 | Introduced |


### loadConfigObjectFromFilePath
> Reads the given filepath and sets the global configuration object to the contained JSON value.

Parametres:
| name | type | description |
| --- | --- | --- |
| config_filepath | {string} | The path of the JSON file to be parsed for config values.  |
| options | {?Object} | Additional run-time options. \[default: {}\] |


Returns:
| type | description |
| --- | --- |
| {object} | The current config object value, after attempting to parse the given file. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

History:
| version | change |
| --- | --- |
| 2.1.1 | Moved to HJSON |
| 1.9.0 | Experimental |


### saveConfigObjectToFilePath
> Saves the current ConfigObject to the given filepath.

Parametres:
| name | type | description |
| --- | --- | --- |
| filepath_string | {string} | The filepath destination to save the configuration to.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Experimental |


### getNameLiteralFromGenericName
> Ensures the given input_string is a generic name and returns a string guaranteed to be a name literal.

Parametres:
| name | type | description |
| --- | --- | --- |
| input_string | {string} | The generic name input string to be coverted to a name literal string.  |
| extension_string | {?string} | An optional string which, if specified, is used as a file extension to be appended to the name literal string if it's not already present. \[default: ''\] |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {string} | The name literal string. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Introduced |


### getTemplateFunctionFromFilePath (private)
> Returns the template function from the given file path or `null` if not found.

Parametres:
| name | type | description |
| --- | --- | --- |
| file_path | {string} | The file path of the [HandleBars](https://handlebarsjs.com/) template to load.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {?Function} | The template function or `null` if it can't be found. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Introduced |


### getTemplateFunctionFromNameLiteral (private)
> Returns the template function from the given name literal string or `null` if none are found.

Parametres:
| name | type | description |
| --- | --- | --- |
| name_literal_string | {string} | The name literal as a string.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {?Function} | The found template function or `null` otherwise. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Introduced |


### getTemplateFunctionfromGenericName
> Returns the template function matching the given generic name or `null` if none are found.

Parametres:
| name | type | description |
| --- | --- | --- |
| generic_name_string | {string} | The generic name to use to find the template function.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {?Function} | The template function if found or `null` otherwise. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Introduced |


### getTemplateFunctionFromInputContextObject
> Returns the template function derived from either the given input context object or the run-time options object.

Parametres:
| name | type | description |
| --- | --- | --- |
| input_context_object | {Object} | The input context object.  |
| options | {?Object} | Additional run-time options. If a property `template-override` is specified, its value will be used to lookup the template function instead of the input context object. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {?Function} | The template function if found, or `null` otherwise. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |
| 'ERR_INVALID_ARG_VALUE' | {Error} | Thrown if no options or properties in the given objects specify a template to lookup. |
| 'ERR_INVALID_RETURN_VALUE' | {Error} | Thrown if this function receives an invalid return value from `getTemplateFunctionFromGenericName` or `getTemplateFunctionFromFilePath`. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Introduced |


### getDefaultInputStringFromFilePath
> Returns the default input string after parsing the JSON file at the given path.

Parametres:
| name | type | description |
| --- | --- | --- |
| file_path | {string} | The path of the file to read and parse.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {string} | The file contents as a string. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

Status:
| version | change |
| --- | --- |
| 2.1.1 | Moved to HJSON |
| 1.9.0 | Introduced |


### getDefaultInputStringFromNameLiteral
> Returns the default input file data as a string or null if there is no default input file found.

Parametres:
| name | type | description |
| --- | --- | --- |
| name_literal | {string} | The name literal to lookup the default input for.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {string} | The default input string or not `null` if a default input file could not be found. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Introduced |


### getDefaultInputStringFromGenericName
> Returns the default input string matching the given template generic name.

Parametres:
| name | type | description |
| --- | --- | --- |
| template_generic_name | {string} | The template's generic name to lookup the default input string with.  |
| options | {?Object} | [Reserved] Additional run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {?string} | The default input string, likely in the Resources/defaults directory, matching the given generic name or null if not default-input file is found. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Introduced |


### getInputStringFromInquirerEditor
> Prompts the user to edit the input with $EDITOR, optionally loading default input data beforehand, and then returns the final input string.

Parametres:
| name | type | description |
| --- | --- | --- |
| options | {Object} | Run-time options. \[default: {}\] |

Returns:
| type | description |
| --- | --- |
| {string} | The input string obtained from the editor. |

Throws:
| code | type | condition |
| --- | --- | --- |
| 'ERR_INVALID_ARG_TYPE' | {TypeError} | Thrown if a given argument isn't of the correct type. |
| 'ERR_INVALID_RETURN_VALUE' | {TypeError} | Thrown if Inquirer.prompt returns an invalid `inquirer_answer` object, missing a string `editor_input` property or otherwise malformatted. |

Status:
| version | change |
| --- | --- |
| 1.9.0 | Experimental |


### main_Async (private)
> The main function when the script is run as an executable without the `--test` command-line option. Not exported and should never be manually called.

Parametres:
| name | type | description |
| --- | --- | --- |
| options | {?options} | An object representing the command-line options. \[default: {}\] |

Status:
| version | change |
| --- | --- |
| 0.0.1 | Introduced |

