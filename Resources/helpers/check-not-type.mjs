#!/usr/bin/env node

export const helperName = 'CheckNotType'; 
export function helperFunction( type, name ){
	var _return = null;
	if( type === 'Array' ){
		_return = `Array.isArray(${name}) === false`;
	} else if( type === 'Buffer' ){
		_return = `Buffer.isBuffer(${name}) === false`;
	} else{
		_return = `typeof(${name}) !== '${type.replace(/[?!| ]/g, '').toLowerCase()}'`;
	}
	return _return;
}
