#!/usr/bin/env bash
# Pre-build configuration and container assembly
#
# Parses all the templated source with config.yaml values 
# 
# 
# After parsing runs docker compose 

cd "$(dirname "$0")"
FAIL=false
which npm
if [[ $? -ne 0 ]]; then
    echo "Please install npm and docker compose." 
    FAIL=true
fi

which docker 
if [[ $? -ne 0 ]]; then
    echo "Please install docker and docker compose." 
    FAIL=true
fi

which jinja2 
if [[ $? -ne 0 ]]; then
    echo "Please install jinja2 -> pip install jinja2-cli" 
    FAIL=true
fi

echo "Did you edit config.yaml?"
arg1="${1:-templates/config.yaml}"
if grep -q "yourdomain" $arg1; then
    echo "Nope. Please pay attention to README.md."
    FAIL=true
fi

if [ $FAIL = true ]
then
    exit 1
fi

rm -rvf config
mkdir -p config
cp -Rvf templates/* config
for f in $(find config -type f -name "*.j2"); do
    echo -e "Evaluating templates\n\tSource: $f\n\tDest: ${f%.j2}"
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

npm install
npm run build
                     # Remove -d and Uncomment for full logs
docker compose up -d # 2>&1 | tee build.log
echo "Waiting 30 seconds for containers to start..."
sleep 30

# Fine tune the image
echo "Installing additional liquidsoap dependencies and committing changes to docker image..."
docker exec --user root -it liquidsoap /bin/bash -c /var/app/bin/setup.sh
docker commit liquidsoap savonet/liquidsoap:v2.2.5

echo "Restarting containers..."
docker compose down
docker compose up -d

echo "Waiting 15 seconds for containers to start..."
sleep 15

echo "Cleaning up."
docker system prune -a -f

if [ $? -ne 0 ]
then
    echo "Leaky tank. Aborting the bisque build. No lobster for you today."
    exit 1
fi

echo -e "\n### To stop run\n\ndocker compose down\n\n### nginx certificate configs may need to be refreshed if your browser reports and invalid cert, run: \n\ndocker compose restart\n\nYou do not need to run this script again unless you wish to rebuild the Lobster Tank."
