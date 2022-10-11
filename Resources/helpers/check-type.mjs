#!/usr/bin/env node

export const helperName = 'CheckType';
export function helperFunction( type, name ){
	var _return = null;
	if( type === 'Array' ){
		_return = `Array.isArray(${name}) === true`;
	} else if( type === 'Buffer' ){
		_return = `Buffer.isBuffer(${name}) === true`;
	} else{
		_return = `typeof(${name}) === '${type.replace(/[?!| ]/g, '').toLowerCase()}'`;
	}
	return _return;
}
