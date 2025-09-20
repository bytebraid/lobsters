#!/bin/bash
set +e
echo "**** Custom NGINX config in main context ****"
cp -av /config/nginx/conf.d/* /etc/nginx/conf.d/
chmod 600 /config/nginx/certs -R
mkdir -p /var/log/nginx
chmod 777 /var/log/nginx -R