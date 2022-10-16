#!/usr/bin/env node
/**
# [install-resources.js](scripts/install-resources.js)
> Install the local resources (<PackageDirectory>/Resources/**) to their system default locations.

Author: Anadian

Code license: MIT
```
	Copyright 2022 Anadian
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

*/

//# Dependencies
	//## Internal
	//## Standard
	//## External
	import getPackageMeta from 'simple-package-meta';
	import cpy from 'cpy';
	
//# Constants
const FILENAME = 'install-resources.js';
//## Errors

//# Global Variables
/**## Functions*/

var pm_promise = getPackageMeta( import.meta ).then(
	( package_meta ) => {
		var cpy_promise = cpy( package_meta.paths.packageDirectory+'/Resources/**', package_meta.paths.data ).then(
			( destination_path ) => {
				console.log(`Installed to ${destination_path}`);
				return destination_path;
			},
			( error ) => {
				console.error(`cpy threw an error: ${error}`);
				if( error.code === 'EEXIST' ){
					return null;
				} else{
					throw error;
				}
			}
		);
		return cpy_promise;
	},
	( error ) => {
		console.error(`getPackageMeta threw an error: ${error}`);
		throw error;
	}
);
await pm_promise;
