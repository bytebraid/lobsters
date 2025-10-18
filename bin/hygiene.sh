#!/bin/bash
export LOG=/var/log/liquidsoap/liquid.log
/bin/echo "Running Hygiene" | tee -a $LOG
cd /var/tmp
rm -vf liq.txt

cat << EOF > /var/tmp/liq.txt
=== ignored files
/var/tmp/live.py.lock
/var/tmp/tank.py.lock
/var/tmp/gunicorn.pid
/var/tmp/liq.txt
=== active linked files
EOF

find . -type l -iname '*liq-pro*' -exec realpath {} >> /var/tmp/liq.txt \;

cat liq.txt | tee -a $LOG

# No more than 13 temp files/downloads. Remove oldest first. This script can be retired if storage is plenty.
mapfile -d '' files < <(
    find /var/tmp -maxdepth 1 -type f -size +2M -printf '%T@ %p\0' \
    | sort -zn \
    | cut -z -d' ' -f2-
)

total=${#files[@]}

if (( total > 13 )); then
    remove_count=$(( total - 13 ))
    echo "Total files: $total - removing $remove_count oldest files:" | tee -a $LOG
    for (( i=0; i<remove_count; i++ )); do
        file=${files[i]}
        if ! grep -q "$file" /var/tmp/liq.txt; then
            rm -vf -- "$file" | tee -a $LOG
        fi
    done
else
    echo "Only $total files found - nothing to remove." | tee -a $LOG
fi
