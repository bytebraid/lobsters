#!/bin/bash

echo "**** Custom NGINX config in main context ****"
cp -av /config/nginx/conf.d/* /etc/nginx/conf.d/
mkdir -p /var/log/nginx
chmod 777 /var/log/nginx -R