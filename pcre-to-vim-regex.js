#!/usr/local/bin/node

if( process.argv.length >= 2 ){
	var input_string = process.argv[2];
	var intermediary_string = input_string.replace(/\\\(/g, '<LOP>');
		var intermediary_string = intermediary_string.replace( /\\\)/g, '<LCP>' );
	//Convert magic params to intermediary
	intermediary_string = intermediary_string.replace( /\(/g, '<MOP>' );
	intermediary_string = intermediary_string.replace( /\)/g, '<MCP>' );
	//Convert new lines to carriage returns
	intermediary_string = intermediary_string.replace( /\\n/g, '\\r' );
	//Convert pluses to intermediary
	intermediary_string = intermediary_string.replace( /\\\+/g, '<LPS>' );
	intermediary_string = intermediary_string.replace( /([^\\])\+/, '$1<OMQ>' );
	console.log('Marked-up intermediary: ', intermediary_string);
	//Convert plus intermediaries to vim-regex syntax
	intermediary_string = intermediary_string.replace( /<OMQ>/g, '\\+' );
	intermediary_string = intermediary_string.replace( /<LPS>/g, '+' );
	//Convert Magic params
	intermediary_string = intermediary_string.replace( /<MOP>/g, '\\(' );
	intermediary_string = intermediary_string.replace( /<MCP>/g, '\\)' );
	//Convet literal params
	intermediary_string = intermediary_string.replace( /<LOP>/g, '(' );
	intermediary_string = intermediary_string.replace( /<LCP>/g, ')' );
	console.log(intermediary_string);
}
