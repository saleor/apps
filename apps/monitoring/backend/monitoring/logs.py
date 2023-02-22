import logging.config


def configure_logging(debug=False):
    config = {
        "version": 1,
        "disable_existing_loggers": False,
        "root": {
            "level": "INFO",
            "handlers": ["default"],
        },
        "formatters": {
            "json": {
                "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
                "datefmt": "%Y-%m-%dT%H:%M:%SZ",
                "format": (
                    "%(asctime)s %(levelname)s %(lineno)s %(message)s %(name)s "
                    + "%(pathname)s %(process)d %(threadName)s"
                ),
            },
            "verbose": {
                "format": (
                    "%(levelname)s %(name)s %(message)s [PID:%(process)d:%(threadName)s]"
                )
            },
            "uvicorn": {
                "()": "uvicorn.logging.DefaultFormatter",
                "fmt": "%(levelprefix)s %(message)s [PID:%(process)d:%(threadName)s]",
                "use_colors": None,
            },
        },
        "handlers": {
            "default": {
                "level": "DEBUG",
                "class": "logging.StreamHandler",
                "formatter": "verbose" if debug else "json",
            },
            "uvicorn": {
                "class": "logging.StreamHandler",
                "formatter": "uvicorn" if debug else "json",
            },
            "null": {
                "class": "logging.NullHandler",
            },
        },
        "loggers": {
            "uvicorn": {
                "propagate": False,
                "handlers": ["uvicorn"],
                "level": "INFO",
            },
            "uvicorn.access": {
                "propagate": False,
                "handlers": ["null"],
            },
            "saleor_app_observability": {
                "level": "DEBUG" if debug else "INFO",
                "propagate": True,
            },
        },
    }
    logging.config.dictConfig(config)
