import fetch from "node-fetch";
import * as jwt from "jsonwebtoken";

export const extractUserId = (tokenObject: string): string => {
  return decodeJWT(tokenObject).payload.sub as string;
};

export const getJWK = async (jwtToken: string) => {
  const jwks = await getJWKS();

  if (!jwks?.length) throw new Error("Invalid JWKS");

  const signingKeys = jwks
    .filter(
      (key) =>
        key.use === "sig" && // JWK property `use` determines the JWK is for signature verification
        key.kty === "RSA" && // We are only supporting RSA (RS256)
        key.kid && // The `kid` must be present to be useful for later
        ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
    )
    .map((key) => {
      return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };
    });

  const decodedToken = decodeJWT(jwtToken);

  return signingKeys.find((key) => {
    return key.kid === decodedToken.header.kid;
  }).publicKey;
};

export const getJWKCert = async (jwtToken: string) => {
  return await getJWK(jwtToken);
};

export const verifyToken = async (jwtToken: string) => {
  const publicKey = await getJWKCert(jwtToken);

  jwt.verify(jwtToken, publicKey, {
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER,
    algorithms: ["RS256"],
  });
};

export const decodeJWT = (token): jwt.Jwt => {
  return jwt.decode(token, { complete: true });
};

export const getJWKS = async () => {
  const tenantId = process.env.AUTH0_TENANT_ID;
  const jwksEndpoint = process.env.JWKS_ENDPOINT;

  const jwksUrl = `${tenantId}/${jwksEndpoint}`;

  const response = await fetch(jwksUrl, { method: "GET" });

  const jsonResponse = await response.text();

  return JSON.parse(jsonResponse).keys;
};

export function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join("\n");
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}
