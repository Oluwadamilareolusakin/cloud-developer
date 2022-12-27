import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'

import { generateUploadUrl } from '../../helpers/attachmentUtils'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const body = JSON.parse(event.body)
    const { filename, filetype } = body
    const userId = getUserId(event)
    const key = `${userId}/${todoId}/${filename}`
    const uploadUrl = generateUploadUrl(key, filetype)
    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
