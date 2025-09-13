#!/usr/bin/python3

from copy import Error

from logs import get_logger


# pf = PrettyPrinter(indent=4).pformat
from pathlib2 import Path
from syjson import SyJson
import sys
import time
from IPython.lib.pretty import pretty

from decouple import config

lobster_stream_root = config("LOBSTER_STREAM_ROOT", default="/var/tmp/stream")

logging = get_logger(LOG_NAME=Path(__file__).name)
logging.info("Syncing global json")
this = sys.modules[__name__]
live_meta = SyJson(
    f"{lobster_stream_root}/live.json",  # Path of the json file
    create_file=True,  # If the file does not exists,
    # this will automatically create that file
    pretty=True,  # If setted to a number, the file will have an
    # indentation of 'pretty' spaces
    cache=False,  # The file is readed only the first time with this option set to
    # True, if your file have to be modified during the execution set this to false
    # (Useful for debugging)
    encoding="utf-8",  # JSON file encoding
)
this.live_meta = live_meta

data = SyJson(
    f"{lobster_stream_root}/data.json",  # Path of the json file
    create_file=True,  # If the file does not exists,
    # this will automatically create that file
    pretty=True,  # If setted to a number, the file will have an
    # indentation of 'pretty' spaces
    cache=False,  # The file is readed only the first time with this option set to
    # True, if your file have to be modified during the execution set this to false
    # (Useful for debugging)
    encoding="utf-8",  # JSON file encoding
)
this.data = data

meta = SyJson(
    f"{lobster_stream_root}/meta.json",  # Path of the json file
    create_file=True,  # If the file does not exists,
    # this will automatically create that file
    pretty=True,  # If setted to a number, the file will have an
    # indentation of 'pretty' spaces
    cache=False,  # The file is readed only the first time with this option set to
    # True, if your file have to be modified during the execution set this to false
    # (Useful for debugging)
    encoding="utf-8",  # JSON file encoding
)
this.meta = meta
#
next_meta = SyJson(
    f"{lobster_stream_root}/next.json",  # Path of the json file
    create_file=True,  # If the file does not exists,
    # this will automatically create that file
    pretty=True,  # If setted to a number, the file will have an
    # indentation of 'pretty' spaces
    cache=False,  # The file is readed only the first time with this option set to
    # True, if your file have to be modified during the execution set this to false
    # (Useful for debugging)
    encoding="utf-8",  # JSON file encoding
)
this.next_meta = next_meta

logging.info("initializing data.py")

if __name__ == "__main__":
    try:
        logging.info(f"json.data loaded [sync test] -> {pretty(this.data.items())}")
        tstr = time.ctime()
        obj = this.data.create("updated", tstr)
        if tstr not in obj:
            logging.info(f"value present -> {pretty(obj)}")
            this.data["updated"] = tstr
            check = this.data.create("updated", "nope")
            if tstr not in check:
                raise Error(f"check -> {check} | tstr -> {tstr}")
        else:
            logging.info("data.json updated with tstr -> {tstr}")
        logging.info(f"data.json update success -> {pretty(this.data.items())}")
    except Exception:
        logging.exception("syjson test failed")
