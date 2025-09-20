#!/bin/bash
#
# Hack to get gtts into the liquidsoap image
#

mkdir -p /usr/local/bin
/usr/bin/apt-get update && /usr/bin/apt-get install -y --no-install-recommends python3 wget
ln -sf /usr/bin/python3 /usr/local/bin/python3
/usr/bin/apt-get clean -y 
/usr/bin/apt-get purge -y --auto-remove && rm -rf /var/lib/apt/lists/* 
/var/app/bin/activate
/var/app/bin/pip3 install --no-cache gtts