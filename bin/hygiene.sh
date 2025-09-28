#!/bin/sh
export LOG=/var/log/liquidsoap/liquid.log
/bin/echo "Running Hygiene" | tee -a $LOG
cd /var/tmp
rm -vf liq.txt 
/bin/echo "### Active linked files" > /var/tmp/liq.txt
find . -type l -iname '*liq-pro*' -exec realpath {} >> liq.txt \; 
cat liq.txt | tee -a $LOG
/bin/echo -e "\n\n### Other files" >> /var/tmp/liq.txt

# No more than 20 temp files/downloads. Remove oldest first. This script can be retired if storage is plenty.
for file in `ls -lt /var/tmp | grep -v staticx | awk -e '$3 ~ /liquid/ { print "/var/tmp/"$9 }' | tee -a $LOG | tail -n +15`; 
do 
    if ! grep -q "$file" /var/tmp/liq.txt; then 
        test -f "$file" && /bin/rm -vf "$file" | tee -a $LOG;
    fi
done
