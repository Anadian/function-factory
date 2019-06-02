#!/bin/bash
echo 'OddsandEnds/cron.sh';
date;
git checkout master;
git add --all .;
if git commit -m 'Cron.sh auto commit.' ; then
	git push origin master;
else
	git pull origin master;
fi
