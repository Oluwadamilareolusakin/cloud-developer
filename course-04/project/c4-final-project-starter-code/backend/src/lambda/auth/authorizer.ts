import {
  CustomAuthorizerEvent,
  CustomAuthorizerResult,
  CustomAuthorizerHandler
} from 'aws-lambda'
import * as AWS from 'aws-sdk'
import 'source-map-support/register'

import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'
import { verify } from 'jsonwebtoken'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
//
const secretsManager = new AWS.SecretsManager()
const Auth0SecretId = process.env.AUTH0_SECRET_ID

export const handler: CustomAuthorizerHandler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    await verifyToken(event.authorizationToken)
    const userId = parseUserId(getToken(event.authorizationToken))
    logger.info('User was authorized', userId)

    return {
      principalId: userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string) {
  const token = getToken(authHeader)
  const secret = await getSecretAuth0()

  await verify(token, secret)
}

async function getSecretAuth0() {
  const secret = await secretsManager
    .getSecretValue({
      SecretId: Auth0SecretId
    })
    .promise()

  return secret.SecretString
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
