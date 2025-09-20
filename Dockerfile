FROM python:3.13.7-slim-trixie

USER root 
WORKDIR /var/app
# Install dependencies   
# gunicorn python3-gunicorn python3-uvicorn python3-gtts python3-decouple 
RUN mkdir -p /config \
    && mkdir -p /var/log/liquidsoap \
    && touch /var/log/liquidsoap/liquid.log \
    && touch /var/log/liquidsoap/error.log \
    && chmod a+rwx /var/log/liquidsoap -R \
    && mkdir -p /var/tmp/stream/hls \
    && chmod a+rwx,o+t /var/tmp/stream -R \
    && apt-get update \
    && apt-get install --no-install-recommends -y websocketd sudo procps wget socat vim \
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
    && chmod a+rx /var/app/build -R \
    && chmod a+rx /var/app/bisque/*.py \
    && groupadd -g 10001 liquidsoap \
    && useradd -u 10000 -g liquidsoap liquidsoap -ms /bin/bash \
    && rm -vf /var/app/bin/bash \
    && /var/app/bin/activate \
    && /var/app/bin/pip install --no-cache-dir -r requirements.txt \
    && apt-get clean -y \
    && apt-get purge -y --auto-remove && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp \
    && ln -sf /var/tmp /tmp \
    && ln -sf /var/app/playlists/dbase.json /var/tmp/stream/dbase.json \
    && ln -sf /var/app/playlists/hbase.json /var/tmp/stream/hbase.json \
    && chmod a+rx /var/app/playlists -R \
    && chown liquidsoap:liquidsoap /var/log/liquidsoap -R \
    && chown liquidsoap:liquidsoap /var/tmp -R \
    && chown liquidsoap:liquidsoap /var/app -R



# Custom monitoring script to check container health
# HEALTHCHECK --interval=3m CMD python /src/docker-healthcheck.py

USER liquidsoap
# Command to run
CMD [ "/var/app/bin/lobster.sh" ]
