#!/usr/bin/python3
from logs import get_logger
from pprint import PrettyPrinter
from pathlib2 import Path
from data import live_meta
import time
import subprocess
from asyncio.subprocess import DEVNULL
import os
import fasteners
import threading
import asyncio

WAIT_SECONDS = 30
logger_name = "live.py"
script_file = "live.py"
socket_path = "/var/tmp/stream.socket"
try:
    logger_name = Path(__file__).name
    script_file = os.path.abspath(__file__)
except Exception:
    pass
lockfile = f"/var/tmp/{logger_name}.lock"
socat_cmd = f"/usr/bin/socat UNIX-LISTEN:{socket_path},fork,user=liquidsoap,group=liquidsoap,mode=777 TCP:localhost:8080"
socat = socat_cmd.split(" ")
logging = get_logger(LOG_NAME=logger_name)
logging.info("initializing live.py")

lock = fasteners.InterProcessLock(lockfile)  # for processes
current_thread = None

pp = PrettyPrinter(indent=4)


def hygiene():
    logging.debug("################# hygiene run")

    live_meta.create("expires", 0)
    live_meta.create("pid", -1)
    try:
        expires = live_meta["expires"]
        epoch_time = int(time.time())

        procs = get_procs()
        if expires > epoch_time:
            logging.debug("Socat should be alive")
            logging.debug("##############  procs %s '%s'", pp.pformat(procs), len(procs))
            if len(procs) < 1:
                logging.info(
                    "Live socket expires at %s, current time %s",
                    time.ctime(expires),
                    time.ctime(epoch_time),
                )
                asyncio.run(restart(socat))
        else:
            if len(procs) > 0:
                kill_all()

    except Exception:
        logging.exception("############ hygiene thread error")

    finally:
        current_thread = threading.Timer(WAIT_SECONDS, hygiene)
        current_thread.start()
        logging.debug("################# hygiene thread started")
        return current_thread


async def restart(cmd):
    try:
        kill_all()
        logging.info("Running socat")
        proc = await asyncio.create_subprocess_exec(*cmd, stdout=DEVNULL, stderr=DEVNULL)
        live_meta["pid"] = proc.pid
        logging.debug("############## socat pid %s", str(proc.pid))
        await proc.wait()
        # ret = proc.wait()
        # logging.info("############## socat exited %s",str(ret))
    except Exception:
        logging.exception("############# Error running shell")


def kill_all():
    logging.info("killing socat")
    try:
        p = subprocess.Popen(["pkill", "-f", "socat"], stdout=subprocess.PIPE)
        ret = p.wait(timeout=30)
        logging.info("pkill exit code %s", str(ret))
        live_meta["pid"] = -1
        os.remove(socket_path)
    except FileNotFoundError:
        logging.debug("Socket '%s' is gone", socket_path)
    except Exception:
        logging.exception("error killing socat")
        pass


def get_procs():
    try:
        p = subprocess.Popen(["pgrep", "-f", "socat", "-r", "S"], stdout=subprocess.PIPE)
        out, err = p.communicate(timeout=10)
        procs = out.decode().splitlines()
        procs.sort()
        logging.debug("========== Socat pids %s =========", pp.pformat(procs))
        meta_pid = live_meta["pid"]

        if len(procs) > 1:
            logging.debug("More than one socat running ")
        if len(procs) > 0 and meta_pid not in procs:
            logging.debug("socat pid '%s' not accurate", meta_pid)
            live_meta["pid"] = procs[-1]
            if not os.path.exists(socket_path):
                logging.error("Socket file '%s' is gone", socket_path)

        return procs
    except Exception:
        logging.exception("None")

    live_meta["pid"] = -1
    return []


def start_live():
    try:
        if lock.acquire(blocking=False, timeout=5):
            logging.info("live.py.lock acquired by pid '%s'", os.getpid())
            hygiene()
        else:
            logging.debug("live.py.lock unavailable")

    except Exception:
        logging.exception(None)


start_live()
