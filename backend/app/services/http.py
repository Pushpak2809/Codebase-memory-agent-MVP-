from __future__ import annotations

import ssl

import httpx
import truststore


def ssl_context() -> ssl.SSLContext:
    return truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT)


def async_client(*, timeout: float) -> httpx.AsyncClient:
    return httpx.AsyncClient(timeout=timeout, verify=ssl_context())
