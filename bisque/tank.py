#!/usr/bin/python3
from data import meta, next_meta, live_meta
import live
import urllib.request
import json

from fastapi import FastAPI, Depends, status  # File, Form, UploadFile,
from fastapi.encoders import jsonable_encoder
from IPython.lib.pretty import pretty

from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


# from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from pprint import PrettyPrinter
from starlette.middleware.sessions import SessionMiddleware

# from fastapi_etag import Etag, add_exception_handler

import time
import uvicorn
from google.oauth2 import id_token
from google.auth.transport import requests
import requests as proxy

from pathlib2 import Path

from google.oauth2 import service_account

#
# TODO access data var periodically to force updates?
#
from logs import get_logger
from decouple import config
from decouple import Csv
import os
import fasteners
import vectorgrep

logger_name = "tank.py"
script_file = "tank.py"
socket_path = "/tmp/stream.socket"
try:
    logger_name = Path(__file__).name
    script_file = os.path.abspath(__file__)
except Exception:
    pass

lockfile = f"/tmp/{logger_name}.lock"
lock = fasteners.InterProcessLock(lockfile)


logging = get_logger(LOG_NAME=logger_name)

HOST = str(config("HOST", "127.0.0.1"))
PORT = int(config("PORT", 10000))
SHOUT_WINDOW = int(config("SHOUT_WINDOW", 180))
WISDOM_WINDOW = int(config("WISDOM_WINDOW", 604800))
SAY_WORD_LIMIT = int(config("SAY_WORD_LIMIT", 250))
GOODBYE = str(config("GOODBYE", "Owe one, two one, do one."))
THROTTLE = str(config("THROTTLE", "Stop pestering Gary, try again later"))
SAY_PARSE = str(config("SAY_PARSE", "You baffled Gary"))
OLD_WISDOM = str(config("OLD_WISDOM", "Away, you trifler, say something new..."))
JSON_WISDOM = jsonable_encoder({"success": False, "message": OLD_WISDOM})
JSON_SAY_PARSE = jsonable_encoder({"success": False, "message": SAY_PARSE})
JSON_THROTTLE = jsonable_encoder({"success": False, "message": THROTTLE})
JSON_GOODBYE = jsonable_encoder({"success": False, "message": GOODBYE})
GOOGLE_APPLICATION_CREDENTIALS = config(
    "GOOGLE_APPLICATION_CREDENTIALS",
    "Provide GOOGLE_APPLICATION_CREDENTIALS via bisque/settings.ini",
)
GET_SKIP_URL = str(config("GET_SKIP_URL", "http://127.0.0.1:8015/skip"))
POST_SAY_URL = str(config("POST_SAY_URL", "http://127.0.0.1:8015/say"))
REQUEST_SIGNAL_URL = str(config("REQUEST_SIGNAL_URL", "http://127.0.0.1:8015/req"))
CLIENT_ID = config("GOOGLE_CLIENT_ID", "Provide GOOGLE_CLIENT_ID via bisque/settings.ini")
LOBSTER_STREAM_ROOT = config("LOBSTER_STREAM_ROOT", default="/var/tmp/stream")
LOBSTER_REQUESTS = config("LOBSTER_REQUESTS", default="/var/tmp/stream/requests.m3u")
JSON_404 = jsonable_encoder({"success": False, "message": "Dubplate not found"})
NOT_FOUND = "Hash not found"
HASHES = f"{LOBSTER_STREAM_ROOT}/hbase.json"
ENDPOINT = config(
    "ENDPOINT",
    "data:text/plain,settings.ini file not configured - \
    indicate a URL with host/port of the liquidsoap input.harbour",
)
allowed = config("ALLOWED_EMAILS", cast=Csv())

# try:
#     credentials = service_account.Credentials.from_service_account_file(
#         GOOGLE_APPLICATION_CREDENTIALS
#     )
# except Exception:
#     logging.exception(
#         "service.json not at '%s' - service account auths will fail", GOOGLE_APPLICATION_CREDENTIALS
#     )


app = FastAPI()
# add_exception_handler(app)
app.add_middleware(
    SessionMiddleware,
    secret_key=CLIENT_ID,
    https_only=True,
    max_age=86400,
    same_site="none",
)

pp = PrettyPrinter(indent=4)


def decodeJWT(token: str):
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests

        request = requests.Request()
        # target_audience = ""
        logging.debug("Token %s", pretty(token))
        decoded_token = id_token.verify_token(token, request)
        logging.debug("We have decoded token %s", pretty(decoded_token))

        return decoded_token if ((decoded_token["exp"] >= time.time())) else {}
    except Exception:
        # logging.exception("Error decoding token")
        logging.info("Error decoding token - probably expired")
        return {}


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)
        self.data = None

    async def __call__(self, request: Request) -> HTTPAuthorizationCredentials:
        email = None
        try:
            logging.debug("cookie data -> %s", pretty(request.session))
            email = None
            if "email" in request.session:
                email = request.session["email"]
            if email is not None and len(email) > 0:
                return HTTPAuthorizationCredentials(scheme="Bearer", credentials="spoof")

        except Exception:
            logging.exception("No session cookie present")

        credentials = await super(JWTBearer, self).__call__(request)
        logging.debug("Credentials -> %s", pretty(credentials))
        self.data = request
        self.data._json = {"email": "init"}

        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication scheme.",
                )
            if not self.verify_jwt(credentials.credentials, request):
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")
            return credentials
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")

        return None

    def verify_jwt(self, jwtoken: str, request: Request) -> bool:
        isTokenValid: bool = False
        try:
            try:
                # Specify the CLIENT_ID of the app that accesses the backend:

                idinfo = id_token.verify_oauth2_token(jwtoken, requests.Request(), CLIENT_ID)
                logging.debug("idinfo data -> %s", pretty(idinfo))
                # logging.debug("jwtoken data -> %s", pretty(jwtoken))

            except ValueError:
                logging.exception("Error decoding token")
                pass

            payload = decodeJWT(jwtoken)
            # logging.debug("payload data -> %s", pretty(payload))
            logging.debug(
                "Email -> %s | Allowed emails -> %s"
                % (pp.pformat(payload["email"]), pp.pformat(allowed))
            )
            email = payload["email"]

            if email not in allowed:
                raise Exception("Not in allowed list")

            logging.info("Wesley welcomes %s", payload["name"])
            request.session["email"] = email
            request.session["name"] = payload["name"]
        except Exception:
            payload = None
        if payload is not None:
            isTokenValid = True
        return isTokenValid


@app.exception_handler(Exception)
def validation_exception_handler(request: Request, exc):
    boo = "\n".join(str(i) for i in request.items())
    logging.error("HTTP 500 Error -----> \n\n %s", pretty({"boo": boo, "request": request}))
    logging.exception(str(exc))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=jsonable_encoder({}),
    )


@app.post("/bisque/auth", dependencies=[Depends(JWTBearer())])
async def auth(request: Request):
    content = {}
    logging.debug("request -> %s", pretty(vars(request)))
    if content is not None:
        response = JSONResponse(status_code=status.HTTP_200_OK, content=content)
        return response
    return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"fuck": "off"})


@app.get("/bisque/now")
async def now(request: Request):
    """Concatenate all *.json data files to a single response and return them"""
    response = jsonable_encoder(
        {
            "meta": meta,
            "next": next_meta,
            "queue": [{"url": "None", "date": "", "user": ""}],
        }
    )
    logging.debug("request -> %s", pretty(vars(request)))
    return JSONResponse(status_code=status.HTTP_200_OK, content=response)


@app.get("/bisque/live", dependencies=[Depends(JWTBearer())])
async def set_live_expiry(request: Request):
    """Set live metadata, open live endpoint"""
    live.start_live()
    try:
        expires = int(time.time()) + 10800
        live_meta["expires"] = expires
        live_meta["last_user"] = request.session["name"]
        response = jsonable_encoder(
            {"session": live_meta, "endpoint": ENDPOINT, "expires": time.ctime(expires)}
        )
        return JSONResponse(status_code=status.HTTP_200_OK, content=response)
    except Exception:
        logging.exception("error starting live endpoint")
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=JSON_GOODBYE)


@app.get("/bisque/skip", dependencies=[Depends(JWTBearer())])
async def skip(request: Request):
    logging.debug("request -> %s", pretty(vars(request)))
    try:
        contents = urllib.request.urlopen(GET_SKIP_URL).read()
        return JSONResponse(status_code=status.HTTP_200_OK, content=jsonable_encoder(contents))
    except Exception:
        logging.exception("Skip failed")

    return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content=JSON_GOODBYE)


@app.post("/bisque/say", dependencies=[Depends(JWTBearer())])
async def speak(request: Request):
    """
    Register shoutout in live.json and check the shoutout is unique and not spamming,
    the POST it to the liquidsoap backend.
    """
    if "name" not in request.session:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content=JSON_GOODBYE)
    logging.info("Flick thy wicked tongue")
    logging.debug("request -> %s", pretty(vars(request)))
    try:
        if "lastShout" in request.session:
            nextShout = int(request.session["lastShout"]) + SHOUT_WINDOW
            if nextShout > int(time.time()):
                logging.error(
                    THROTTLE + " (%s)",
                    time.ctime(nextShout),
                )
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content=JSON_THROTTLE,
                )
        content = await request.json()
        parsed = str(content["words"]).split()
        spoken = " ".join(parsed)

        if len(spoken) < SAY_WORD_LIMIT and (x.isalnum() for x in parsed):
            try:
                from hashlib import blake2b

                h = blake2b(digest_size=16)
                wisdom = dict()
                wisdom["name"] = str(request.session["name"])
                wisdom["words"] = spoken
                # json_wisdom = jsonable_encoder(wisdom)
                h.update(json.dumps(wisdom).encode("UTF-8"))
                hash = h.hexdigest()
                logging.info("Words of wisdom '%s' [hash: %s]", spoken, hash)
                wisdom["time"] = str(time.time())
                live_meta.create("wisdom", dict())
                if hash in live_meta["wisdom"] and "time" in live_meta["wisdom"][hash]:
                    said_time = int(float(str(live_meta["wisdom"][hash]["time"])))
                    said = int(said_time + WISDOM_WINDOW)
                    said_on = time.ctime(said_time)
                    logging.info("You said '%s' [hash: %s] (%s)", spoken, hash, said_on)
                    if said > int(time.time()):
                        return JSONResponse(
                            status_code=status.HTTP_425_TOO_EARLY, content=JSON_WISDOM
                        )
                latest_wisdom = jsonable_encoder(wisdom)
                live_meta["wisdom"][hash] = latest_wisdom
            except Exception:
                logging.exception("Wonky wisdom not evaluated")

            r = proxy.post(POST_SAY_URL, json={"words": spoken})
            logging.info("Gary has an announcement...")
            request.session["lastShout"] = time.time()
            jso = JSON_GOODBYE
            try:
                jso = r.json()
            except Exception:
                logging.exception("No upstream JSON")

            if r.status_code is not status.HTTP_202_ACCEPTED:
                logging.error("Wesley was not best impressed => %s", pretty(r))

            return JSONResponse(status_code=r.status_code, content=jso)

        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=JSON_SAY_PARSE,
        )

    except Exception:
        logging.exception("heard yet not regarded")

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=JSON_GOODBYE,
    )


lockfile = f"/tmp/{logger_name}.lock"
lock = fasteners.InterProcessLock(lockfile)


def verify_request_queue(hash=None):
    """
    Accept a hash identifying the show to play, insert contents of m3u key in
    hbase.json to requests.m3u file
    """
    logging.info("Checking hash [%s]", pretty(hash))
    if hash is None:
        raise KeyError(NOT_FOUND)
    if not lock.acquire(blocking=True, timeout=5):
        raise Exception("lock not acquired on '%s' ... timed out", lockfile)
    try:
        with open(LOBSTER_REQUESTS, "a") as reqs:
            logging.info("Requests file '%s'", LOBSTER_REQUESTS)
            with open(HASHES, "r") as hashes:
                logging.info("Scanning file '%s'", HASHES)

                catalog = json.load(hashes)
                if hash not in catalog:
                    raise KeyError(NOT_FOUND)
                if "m3u" not in catalog[hash]:
                    raise KeyError(f"No m3u key for hash [{hash}]")

                results, return_code = vectorgrep.grep(LOBSTER_REQUESTS, [hash])

                if len(results) < 1:
                    logging.info("Writing new request for hash '%s' >> ", hash)
                    logging.debug(pretty(catalog[hash]))
                    reqs.write(catalog[hash]["m3u"])
                    reqs.flush()
                    return True

                for index, line in results:
                    logging.info(f"Already queued [{hash}] {index}: {line}")

                return False
    except KeyError as e:
        raise e
    except Exception as e:
        logging.exception("check_request_queue failed")
        raise e
    finally:
        lock.release()


@app.get("/bisque/queue/{hash}", dependencies=[Depends(JWTBearer())])
async def queue(request: Request, hash):
    """Trigger liquidsoap to reload the requests.m3u"""
    logging.debug("request -> %s", pretty(vars(request)))
    try:
        if verify_request_queue(hash):
            try:
                r = proxy.get(REQUEST_SIGNAL_URL)
                logging.debug("Signalled request playlist reload")
                #                jso = r.json()
                if r.status_code is not status.HTTP_200_OK:
                    logging.error("Wesley's cooked => %s", pretty(r))
                    return JSONResponse(
                        status_code=r.status_code,
                        content=jsonable_encoder(
                            {"success": False, "message": f"Dubplate Stalled [{hash}]"}
                        ),
                    )
                logging.info("Signalled request playlist reload for [%s]", hash)
                return JSONResponse(
                    status_code=status.HTTP_200_OK,
                    content=jsonable_encoder(
                        {"success": True, "message": f"Dubplate Ready [{hash}]", "body": r.json()}
                    ),
                )
            except Exception:
                logging.exception("Upstream signal failed")

        logging.error("")
        return JSONResponse(
            status_code=status.HTTP_425_TOO_EARLY,
            content=jsonable_encoder(
                {"success": True, "message": f"Dubplate already queued [{hash}]"}
            ),
        )
    except KeyError as e:
        logging.exception(e)
        return JSONResponse(
            status_code=status.HTTP_451_UNAVAILABLE_FOR_LEGAL_REASONS,
            content=jsonable_encoder(
                {"success": False, "message": f"Dubplate unavailable [{hash}]"}
            ),
        )
    except Exception as e:
        logging.exception(e)
        return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content=JSON_GOODBYE)

    return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content=JSON_GOODBYE)


if __name__ == "__main__":
    logging.info("Start uvicorn")
    uvicorn.run(app, host=HOST, port=PORT)


logging.info("Tank Loaded")
