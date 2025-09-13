#!/bin/bash
set +e
cd /var/app/bisque
# clean out /tmp/
find /tmp/ -iname '*pid*' -exec /bin/rm -rvf {} \;
find /tmp/ -iname '*mp3*' -exec /bin/rm -rvf {} \;
find /tmp/ -iname '*staticx*' -exec /bin/rm -rvf {} \;
/usr/bin/websocketd --address=0.0.0.0 --port=8013 tail -n 100 -F /var/log/liquidsoap/liquid.log 2>&1 &
/var/app/bin/python3 -m gunicorn tank:app --chdir /var/app/bisque/ --workers 4 -k uvicorn.workers.UvicornWorker --bind "0.0.0.0:10000" --pid /var/tmp/gunicorn.pid 2>&1 &
/var/app/bin/liquidsoap /var/app/bin/stream.liq 2>&1 &
touch /var/log/liquidsoap/liquid.log /var/log/liquidsoap/error.log
tail -f /var/log/liquidsoap/liquid.log /var/log/liquidsoap/error.log