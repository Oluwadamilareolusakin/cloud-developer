import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'

import { generateUploadUrl } from '../../helpers/businessLogic/images'
import { getUserId } from '../utils'
import Todos from '../../helpers/businessLogic/todos'

const bucketUrl = process.env.ATTACHMENT_S3_BUCKET_URL

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoHelper = new Todos()
    const todoId = event.pathParameters.todoId
    const body = JSON.parse(event.body)
    const { filename, filetype } = body
    const userId = getUserId(event)
    const key = `${userId}/${todoId}/${filename}`
    const uploadUrl = generateUploadUrl(key, filetype)

    const attachmentUrl = `${bucketUrl}/${key}`

    try {
      await todoHelper.updateTodo(todoId, userId, {
        attachmentUrl
      })

      return {
        statusCode: 200,
        body: JSON.stringify({
          uploadUrl
        })
      }
    } catch (e) {
      return {
        statusCode: 200,
        body: `Problem generating your upload url ${e.message}`
      }
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
