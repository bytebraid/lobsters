FROM python:3.12.8-slim-bookworm

USER root 
WORKDIR /var/app
# Install dependencies   
RUN mkdir -p /config \
    && mkdir -p /var/app/log \
    && mkdir -p /var/log/liquidsoap \
    && mkdir -p /usr/share/liquidsoap/ \
    && mkdir -p /var/tmp/stream/hls \
    && apt-get update \
    && apt-get install --no-install-recommends -y apt coreutils psmisc curl gunicorn python3-gunicorn python3-uvicorn python3-gtts python3-decouple websocketd iproute2 sudo procps ffmpeg wget socat vim \
    && chmod a=rwx,o+t /var/tmp && python3 -m venv /var/app
# Copy the app into the container

COPY . /var/app
COPY config /config
COPY config/custom-cont-init.d /custom-cont-init.d

ENV PATH="/var/app/bin:$PATH"
# mkdir for all needed paths
# TODO is /tmp mounted to a big enough fs?
RUN cp -rvf /var/app/config / \
    && cp -rvf /config/custom-cont-init.d / \
    && chmod a+rx /custom-cont-init.d -R \
    && chmod a+rx /var/app/bin -R \
    && chmod a+rx /var/app/bisque/*.py \
    && ln -sf /var/app/libs /usr/share/liquidsoap/libs \
    && /var/app/bin/pip install --no-cache-dir -r requirements.txt \
    && groupadd -g 1300 liquidsoap \
    && useradd -u 1300 -g liquidsoap liquidsoap -ms /bin/bash \
    && chown -R liquidsoap /var/app \
    && chown -R liquidsoap /var/tmp \
    && chown -R liquidsoap /var/log/liquidsoap \
    && apt-get -y --no-install-recommends install npm \
    && cd /var/app/ \
    && npm install && echo -e "\nBuilding app, please wait while the bisque cooks...\n"  && npm run build \
    && /bin/rm -rf /var/app/node_modules \
    && apt-get -y remove npm \
    && apt-get clean -y \
    && apt-get purge -y --auto-remove && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp \
    && ln -sf /var/tmp /tmp \
    && ln -sf /var/app/playlists/dbase.json /var/tmp/stream/dbase.json \
    && ln -sf /var/app/playlists/hbase.json /var/tmp/stream/hbase.json \
    && chmod a+rx /var/app/playlists -R

# Custom monitoring script to check container health
# HEALTHCHECK --interval=3m CMD python /src/docker-healthcheck.py

USER liquidsoap
# Command to run
CMD [ "/var/app/bin/lobster.sh" ]
