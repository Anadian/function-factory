#!/bin/bash
echo 'function-factory/cron.sh';
date -uI'seconds';
git checkout wip;
git add --all .;
if git commit -m 'Cron.sh auto commit.' ; then
	git push origin master;
else
	git pull origin master;
fi
