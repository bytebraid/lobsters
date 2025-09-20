#!/bin/bash
#
# Hack to get gtts into the liquidsoap image
#

mkdir -p /usr/local/bin/
ln -sf /usr/bin/python3 /usr/local/bin/python3
apt-get update
apt-get install -y --no-install-recommends python3 wget
/var/app/bin/activate
/var/app/bin/pip3 install --no-cache gtts