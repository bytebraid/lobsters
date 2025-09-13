#!/usr/bin/python3
import json

from fastapi.encoders import jsonable_encoder

import sys

from IPython.lib.pretty import pretty
from pathlib2 import Path


#
# TODO access data var periodically to force updates?
#
from logs import get_logger
from decouple import config

import vectorgrep
import fasteners
import os

logger_name = "request.py"
script_file = "request.py"
try:
    logger_name = Path(__file__).name
    script_file = os.path.abspath(__file__)
except Exception:
    pass

lockfile = f"/var/tmp/{logger_name}.lock"
lock = fasteners.InterProcessLock(lockfile)


logging = get_logger(LOG_NAME=Path(__file__).name)
LOBSTER_STREAM_ROOT = config("LOBSTER_STREAM_ROOT", default="/var/tmp/stream")
LOBSTER_REQUESTS = config("LOBSTER_REQUESTS", default="/var/tmp/stream/requests.m3u")
JSON_404 = jsonable_encoder({"success": False, "message": "Dubplate not found"})
NOT_FOUND = "Hash not found"
HASHES = f"{LOBSTER_STREAM_ROOT}/hbase.json"


def verify_request_queue(hash=None):
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


if __name__ == "__main__":
    for x in sys.argv[1:]:
        verify_request_queue(hash=x)
