import uvicorn


def main():
    uvicorn.run(
        "monitoring.app:app",
        host="0.0.0.0",
        port=5001,
        reload=True,
        forwarded_allow_ips="*",
    )


if __name__ == "__main__":
    main()
