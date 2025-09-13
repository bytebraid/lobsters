#!/bin/bash
export LOG=/var/log/liquidsoap/liquid.log
/bin/echo "Running Hygiene" | tee -a $LOG
cd /tmp
rm -vf liq.txt 
/bin/echo "### Active linked files" > /tmp/liq.txt
find . -type l -iname '*liq-pro*' -exec realpath {} >> liq.txt \; 
/bin/echo -e "\n\n### Other files" >> /tmp/liq.txt
cat liq.txt | tee -a $LOG

# No more than 20 temp files/downloads. Remove oldest first. This script can be retired if storage is plenty.
for file in `ls -lt /tmp | awk '$3=="liquidsoap" { print "/tmp/"$9 }' | tee -a $LOG | tail -n +15`; 
do 
    if ! grep -q "$file" /tmp/liq.txt; then 
        test -f "$file" && /bin/rm -vf "$file" | tee -a $LOG;
    fi
done
# for i in `ls -t /tmp/*.mp3* | tail -n +13`;  do
#     if ! grep -qxFe "$i" /tmp/liq.txt; then        
#        /bin/rm -vf "$i" | tee -a $LOG;
#     fi
# done
