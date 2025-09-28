#!/bin/bash
set +e

chmod a+rx /var/app/bin -R
touch /var/log/liquidsoap/liquid.log /var/log/liquidsoap/error.log
chmod a+rwx /var/log/liquidsoap -R
rm -vf /var/tmp/gunicorn.pid
/var/app/bin/activate
cd /var/app/bisque
touch /var/tmp/stream/meta.json
touch /var/tmp/stream/next.json
touch /var/tmp/stream/data.json
touch /var/tmp/stream/live.json
chmod a+rwx /var/tmp -R
/var/app/bin/python3 -m gunicorn tank:app --chdir /var/app/bisque/ --workers 4 -k uvicorn.workers.UvicornWorker --bind "0.0.0.0:10000" --pid /var/tmp/gunicorn.pid 2>&1 &
/usr/bin/websocketd --address=0.0.0.0 --port=8013 tail -n 100 -F /var/log/liquidsoap/liquid.log 2>&1 &
tail -f /var/log/liquidsoap/liquid.log /var/log/liquidsoap/error.log