#!/usr/bin/env bash
# Pre-build configuration and container assembly
#
# Parses all the templated source with config.yaml values 
# 
# 
# After parsing runs docker compose 

cd "$(dirname "$0")"

which docker 
if [[ $? -ne 0 ]]; then
    echo "Please install docker and docker compose." 
    exit 1
fi

echo "Did you edit config.yaml?"
arg1="${1:-templates/config.yaml}"
if grep -q "yourdomain" $arg1; then
    echo "Nope. Please pay attention to README.md."
    exit 1
fi



rm -rvf config
mkdir -p config
cp -Rvf templates/* config
for f in $(find config -type f -name "*.j2"); do
    echo -e "Evaluating template\n\tSource: $f\n\tDest: ${f%.j2}"
    cat $arg1 | jinja2 $f > ${f%.j2}
    rm -vf $f
done


cp -vf config/stream.liq bin/
cp -vf config/docker-compose.yml .
cp -vf config/config.sh .

cp -vf config/settings.ini bisque/
cp -vfR config/src .

chmod a+rx bin
chmod a+rx bisque/*.py
chmod a+rx config.sh

. config.sh

                     # Uncomment for logs
docker compose up -d # 2>&1 | tee build.log
echo "Fresh containers are initializing, please wait at least a minute before restarting."
sleep 2 # Grace time for start + ACME challenges for swag certs
echo -e "\n### To stop run\n\ndocker compose down\n\n### If you're running for the first time you may need to refresh nginx certificate configs with\n\ndocker compose restart\n\n"
