#!/usr/bin/env node

import { inspect } from 'node:util';

export default function insp( object, depth = 2, hidden = false ){
	return inspect( object, hidden, depth );
}
