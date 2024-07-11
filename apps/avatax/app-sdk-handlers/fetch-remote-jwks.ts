export const getJwksUrlFromSaleorApiUrl = (saleorApiUrl: string): string =>
  `${new URL(saleorApiUrl).origin}/.well-known/jwks.json`;

export const fetchRemoteJwks = async (saleorApiUrl: string) => {
  try {
    const jwksResponse = await fetch(getJwksUrlFromSaleorApiUrl(saleorApiUrl));

    const jwksText = await jwksResponse.text();

    return jwksText;
  } catch (err) {
    throw err;
  }
};
