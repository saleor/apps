from typing import Dict

from jwt.api_jwk import PyJWKSet
from jwt.api_jws import PyJWS
from jwt.api_jwt import PyJWT


class CryptoException(Exception):
    """
    Base exception for the crypto module errors.
    """


class JWKSKeyMissing(CryptoException):
    """
    Raised when a requested kid is missing from a keyset.
    """


class KeyIDMissing(CryptoException):
    """
    Raised when a JWT without a 'kid' header is received.
    """


jwt_global_obj = PyJWT(options={"verify_signature": True})
jws_global_obj = PyJWS(options={"verify_signature": True})
get_unverified_header = jws_global_obj.get_unverified_header


def get_kid(sig_header: Dict[str, str]):
    try:
        return sig_header["kid"]
    except KeyError as err:
        raise KeyIDMissing() from err


def get_key_from_jwks(kid: str, jwks: PyJWKSet):
    try:
        jwks_key = jwks[kid]
    except KeyError as err:
        raise JWKSKeyMissing(f"The JWKS does not hold the key: {kid}") from err
    return jwks_key.key


def decode_webhook_payload(jws: str, jwks: PyJWKSet, webhook_payload: bytes):
    sig_header = get_unverified_header(jws)
    key = get_key_from_jwks(kid=get_kid(sig_header), jwks=jwks)

    return jws_global_obj.decode(
        jws,
        algorithms=[sig_header["alg"]],
        key=key,
        detached_payload=webhook_payload,
    )


def decode_jwt(jwt: str, jwks: PyJWKSet):
    sig_header = get_unverified_header(jwt)
    key = get_key_from_jwks(kid=get_kid(sig_header), jwks=jwks)

    return jwt_global_obj.decode(
        jwt,
        algorithms=[sig_header["alg"]],
        key=key,
    )
