#!/usr/bin/python3
import logging
import logging.handlers
from decouple import config
from logging.handlers import WatchedFileHandler

LOG_INFO = config("LOG_INFO")
LOG_ERROR = config("LOG_ERROR")
DEBUG = config("DEBUG", default=False, cast=bool)


def get_logger(
    LOG_FORMAT="%(asctime)s,%(msecs)03d %(levelname)-8s [%(filename)s:%(lineno)d] %(message)s",
    # LOG_FORMAT="%(asctime)s %(name)-12s %(lineno)d %(levelname)-8s %(message)s",
    LOG_NAME="bisque",
    LOG_LEVEL=logging.INFO if not DEBUG else logging.DEBUG,
    LOG_FILE_INFO=str(LOG_INFO),
    LOG_FILE_ERROR=str(LOG_ERROR),
):
    log = logging.getLogger(LOG_NAME)
    log_formatter = logging.Formatter(LOG_FORMAT)

    # comment this to suppress console output
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(log_formatter)
    log.addHandler(stream_handler)
    try:
        file_handler_info = WatchedFileHandler(LOG_FILE_INFO, mode="a")
        file_handler_info.setFormatter(log_formatter)
        file_handler_info.setLevel(logging.INFO)
        log.addHandler(file_handler_info)

        file_handler_error = WatchedFileHandler(LOG_FILE_ERROR, mode="a")
        file_handler_error.setFormatter(log_formatter)
        file_handler_error.setLevel(logging.ERROR)
        log.addHandler(file_handler_error)
    except Exception:
        print("Logging to console only")
        pass
    # Dynamic debug switch?
    log.setLevel(LOG_LEVEL)

    return log
