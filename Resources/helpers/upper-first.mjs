#!/usr/bin/env node

export const helperName = 'UpperFirst'; 
export function helperFunction( short_description ){
	var _return = null;
	if( typeof(short_description) === 'string' ){
		var first_letter = short_description.charAt(0);
		var rest_of_string = short_description.substring(1);
		_return = first_letter.toUpperCase()+rest_of_string;
	}
	return _return;
}
