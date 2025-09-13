

<h1 align="center">THE LOBSTER TANK</h1>

<p align="center">

<img src="public/images/THRESHOLD_TEST_CARD.png" width="250"/>

</p>

<h4 align="center">Internet Radio, Community Dubplates</h4>

<p align="center">
  <a href="https://reactjs.org/">
    <img src="https://badgen.net/badge/React/18.2.0/cyan" 
         alt="React version" />
  </a>

               
  <a href="./LICENSE">
    <img src="https://badgen.net/badge/license/MIT/blue"
         alt="License">
  </a>
</p>


<p align="center">

</p>

# 🦞 What's all this then?

Welcome Lobsters. The tank is web portal that delivers live audio streaming. Independently broadcast your content or restream any other media from a URL.
The tank is fully contained and primed for self-hosting on cloud or VPS resource. Make your internet presence 24/7 and share the sounds you love.

The magical Lobster Bisque web portal serves up your curated music, podcasts and playlists, and exposes an [IceCast](https://icecast.org/) endpoint
should you wish to waylay your radio station with a live event or show. 

Novel features provided from the Bisque Kitchen interface allow skipping over content, interrupting the stream with items from your custom catalogue and delivering text-to-speech shout outs over your very own airwaves.

Powered by [LiquidSoap](http://www.liquidsoap.info/) and [nginx](https://nginx.org/) via [SWAG](https://hub.docker.com/r/linuxserver/swag)
  
Tacky UI design comes for free, by courtesy of [React.js](https://react.dev/) - built with [react-scripts](https://github.com/facebook/create-react-app) 
and [npm](https://www.npmjs.com/).

# 🤦‍♀ The "situation"

This was a personal adventure into the briar and wetlands surrounding modern web development and the saturated landscape of tooling and frameworks, whatever happened to be vogue at the time. It is currently unmaintained and reliant on deprecated dependencies. This is not likely to change. See [the license](LICENSE). 

If you want to actually use this software in earnest, be my willing guest, however do prepare yourself with a little patience, and expect to grind through some basic data entry to get off the ground.

# 🐧 Penguins only, please

Currently no Windows / [Docker Desktop](https://learn.microsoft.com/en-us/virtualization/windowscontainers/deploy-containers/set-up-linux-containers) support. 

If you have [cygwin](https://cygwin.org/) + [python3](https://python.org) + [jinja2](https://pypi.org/project/Jinja2/) locally you might be able to run [docker.sh](docker.sh) for the pre-build config/templates. I wish you much success.

# 🔴 Prerequisites for Docker setup 

- Your flavour of Linux... 
- ...about 5-6GB of free space
- ...at least 2GB of RAM
- ...with [python3 (3.12 or above)](https://python.org), [jinja2](https://pypi.org/project/Jinja2/), [docker and docker compose](https://docs.docker.com/compose/) packages installed
- ...connected to the internet i.e. an externally routable IP address
- ...with public DNS records i.e. **yourdomain.com** can be resolved by CNAME, A or AAAA records set for yourdomain.com
- ...port 80 on the docker host machine must be free -> to conduct [letsencrypt](https://letsencrypt.org/) ACME challenges for domain ownership verification
- ...and if you don't have a personal domain that's fine, [SWAG](https://hub.docker.com/r/linuxserver/swag) will self-sign a certificate. Your favourite web browsers will then manifest ballache upon you for all the reasons.

# ✨ Install

## 
## ⏭ Use Docker 

Clone this repo.

```bash
$ git clone https://github.com/bytebraid/lobsters.git
```

- You must edit [templates/config.yaml](templates/config.yaml). Replace all mandatory values
  - Change https_port to 443 if it is free on your host
  - Provide your public domain name, [Google API key (client ID)](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#get_your_google_api_client_id) for OAuth2
    - Specify https://yourdomain.com:8443 **NOTE the 8443 port** in your **Authorised JavaScript origins** and **Authorised redirect URIs** in your client ID configuration. You can only omit the port if you set https_port to 443.
  - Set privileged email accounts (for access to admin features)  

- Optionally
  - Set playlist_mode to your preference
  - Customize limits and messages

### 🎶 Add your content (OPTIONAL)
- Edit the default [media.csv](playlists/media.csv)
```bash
# Run csv2liquid.py
$ cd playlists
$ ./csv2liquid.py -a Rankin media.csv # Omit the --alternative arg for a single playlist
$ ./finalize.sh
```

### 💾 Build the container(s)
```bash
# Navigate to the root of your local repo
#
# +++ Build, compose and start the docker containers +++
#
$ ./docker.sh

# First time starting the containers? 
# Wait a minute for SWAG ACME client to get your TLS certificates...
# ...Then SWAG nginx might need to reload certificate configs, so run:
$ docker compose restart # ONLY NEEDED ONCE, OR IF YOU docker system prune and rebuild new containers


#######################
# ==== How TO ... === #

# Start the Lobster Tank 🦞
$ docker compose up

# Shell into the containers  🦞
$ docker exec --user root -it tank /bin/bash
$ docker exec --user root -it swag /bin/bash

# Stop the Lobster Tank 🛑
$ docker compose down

# ^^^ To delete the containers, make sure they are down, and then
$ docker system prune -a 

# Update the playlists and databases in the containers
$ cd playlists
$ # Modify media.csv, regenerate playlists
$ ./csv2liquid.py --help
$ # Finalize
$ ./finalize.sh
$ # Install into the docker container
$ ./update-docker.sh
```

## 
## ⏭ Linux native installation (because you dabble in the dark arts)

🚀 Choose your own adventure. With any luck it's not rocket science...

💾 Not-so-concise instructions follow. What could possibly go wrong?

- install jinja2 and other dependencies using your distro's package manager (align with what apt gets from [the Dockerfile](./Dockerfile) )
- edit [config.yaml](./templates/config.yaml) and modify the mandatory top section
- comment out the compose step in [docker.sh](./docker.sh) and run it to generate a directory /configs/ with variables adjusted to your specific deployment
- install nginx and add the generated [default.conf](./templates/nginx/site-confs) to your /sites-enabled/ 
- get [dehydrated](https://dehydrated.io/) to acquire and manage TLS certificates and renewals via [letsencrypt](https://letsencrypt.org/)
- install python3 and all the [app dependencies](./requirements.txt)
- examine [lobster.sh](bin/lobster.sh) for how to start services manually
- gunicorn/uvicorn backend runs tank.py (FastAPI) on port 10000
- liquidsoap must be version 2.2.4 [staticx binary provided](./bin/liquidsoap)
- go through the [the Dockerfile](./Dockerfile) and reproduce the layout
- install npm and react-scripts, then `npm run build` in the repo root
- unpack the app to /var/app and mkdir -p /var/tmp/stream/hls, creaete all the required directories like /var/log/liquidsoap
- adduser liquidsoap and chown locations under /var to the liquidsoap user, chmod a+rx your /build directory so nginx can serve up your build
- [setup](./etc/logrotate.d/liquidsoap) [logrotate](https://linux.die.net/man/8/logrotate) 
- take appropriate action to install process management for bin/liquidsoap, gunicorn+tank.py, and websocketd (sample systemd unit configs in [/etc](./etc/)) 
- perhaps bang your head against the wall for taking the hard route and nothing is working
- reflect on the choices that led you to read this

### Option 1: It's not working

- Repent all your sins and follow the docker instructions.

### Option 2: Seek help

#### Contact a therapist as you may require help for deeper issues that led you here

- "Any man who goes to a psychiatrist ought to have his head examined"

### Option 3: So far so good, and it seems to work? 
- congratulate yourself on being a prodigy
- edit the boilerplate csv with data about your content. local media or web URLs can be referenced
- if you provide web URLs, /var/tmp will swell
- your file must not take more than five minutes to download
- use the tooling provided to generate dbase.json and hbase.json
- generate your m3u playlists with metadata annotations -> liquidsoap uses the in-file annotations to 
  generate the "now playing" information state (json files are updated in the web root, and polled by client-side React components)- 


# ❓ What next
Visit https://yourdomain.com:8443 (or whatever port you specified in the config)

# 📝 License
Licensed under the [MIT License](./LICENSE).
