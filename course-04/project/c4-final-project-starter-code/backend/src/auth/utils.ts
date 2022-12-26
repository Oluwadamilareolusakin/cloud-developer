import Axios from 'axios'

import { JwtPayload } from './JwtPayload'
import { JWK } from './JWK'

import { Jwt } from './Jwt'
import { verify, decode } from 'jsonwebtoken'

const jwksUrl = process.env.JWKS_ENDPOINT
const auth0Issuer = process.env.AUTH0_ISSUER
const auth0Audience = process.env.AUTH0_AUDIENCE
const JWT_ALGORITHM = 'RS256'
/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

async function getJWKPublicKey(kid: string): Promise<string> {
  const jwk = await getJWK(kid)

  return jwk.publicKey
}

const getJWK = async (kid: string): Promise<JWK> => {
  const jwks = await getJWKS()

  const result = jwks.find((jwk) => jwk.kid === kid)

  if (!!result) throwError('Invalid JWK')

  return result
}

const throwError = (message: string) => {
  throw new Error(message)
}

const getJWKS = async () => {
  const response = await Axios.get(jwksUrl)

  let jwks = response.data.keys

  return jwks.filter((jwk) => {
    if (validJWK(jwk)) return formattedJWK(jwk)
  })
}

const validJWK = (jwk) => {
  return (
    !!jwk.kty &&
    !!jwk.use &&
    !!jwk.n &&
    !!jwk.e &&
    !!jwk.kid &&
    !!jwk.x5t &&
    !!jwk.x5c &&
    jwk.alg === JWT_ALGORITHM
  )
}

const formattedJWK = (jwk) => {
  return {
    kid: jwk.kid,
    publicKey: certToPublicKey(jwk.x5c)
  }
}

const certToPublicKey = (x5cert: string): string => {
  let cert = x5cert.match(/.{1,64}/g).join('\n')
  return `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
}

export const verifyJWK = async (token: string) => {
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  const kid = jwt.header.kid

  const publicKey = await getJWKPublicKey(kid)

  verify(token, publicKey, {
    issuer: auth0Issuer,
    audience: auth0Audience,
    algorithms: ['RS256']
  })
}
