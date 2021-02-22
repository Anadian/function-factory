# function-factory
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Semantic Versioning 2.0.0](https://img.shields.io/badge/semver-2.0.0-brightgreen?style=flat-square)](https://semver.org/spec/v2.0.0.html)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org)
[![License](https://img.shields.io/github/license/Anadian/function-factory)](https://github.com/Anadian/function-factory/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/v/function-factory)](https://www.npmjs.com/package/function-factory)
![David](https://david-dm.org/Anadian/function-factory.svg)

> Simple, minimalist templating from the command line.
# Table of Contents
- [Background](#Background)
- [Install](#Install)
- [Usage](#Usage)
- [API](#API)
- [Contributing](#Contributing)
- [License](#License)
# Background
# Install
To use it as a dependency in a NodeJS project, run:
```sh
npm install --save function-factory
```
To use it as a global command-line app, run:
```sh
npm install --global function-factory
```
# Usage
To use the command-line interface:
```sh
[npx] function-factory [options]
```
Remember to prepend `npx` to the command when you haven't installed it globally.
## CLI
```
function-factory

  Simple, minimalist templating from the command line. 

Options

  -h, --help                       Writes this help text to STDOUT.                                              
  -n, --noop                       [Reserved] Show what would be done without actually doing it.                 
  -v, --verbose                    Verbose output to STDERR.                                                     
  -V, --version                    Writes version information to STDOUT.                                         
  -x, --no-quick-exit              Don't immediately exit after printing help, version, and/or config            
                                   information.                                                                  
  -i, --stdin                      Read input from STDIN.                                                        
  -I, --input string               The path to the file to read input from.                                      
  -e, --edit string                Edit the input in $EDITOR, optionally specifying a file in the "defaults"     
                                   directory to use as a base.                                                   
  -a, --ask string                 [Reserved] Interactively prompt for input properties, optionally specifying a 
                                   file in the "defaults" directory to use as a base.                            
  -D, --do string                  [Reserved] Select a default input file and an output template based on a      
                                   signle string.                                                                
  -o, --stdout                     Write output to STDOUT.                                                       
  -O, --output string              The name of the file to write output to.                                      
  -p, --pasteboard                 Copy output to pasteboard (clipboard).                                        
  -c, --config                     Print search paths and configuration values to STDOUT.                        
  -C, --config-file string         Use the given config file instead of the default.                             
  -d, --defaults                   [Reserved] Print a list of the "defaults" files.                              
  -l, --templates                  [Reserved] Print a list of available templates to stdout.                     
  -T, --template-override string   Override the template to the file specified.                                  
```
# API
```js
const FunctionFactory = require('function-factory');
```
See [API.md](API.md) for full API.
# Contributing
Changes are tracked in [CHANGELOG.md](CHANGELOG.md).
# License
MIT ©2020 Anadian

SEE LICENSE IN [LICENSE](LICENSE)

[![Creative Commons License](https://i.creativecommons.org/l/by-sa/4.0/88x31.png)](http://creativecommons.org/licenses/by-sa/4.0/)\
This project's documentation is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).
