import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import Todos from '../../helpers/todos'

import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    try {
      const todos = new Todos()

      await todos.deleteTodo(todoId, userId)

      return {
        statusCode: 200,
        body: 'Successfully deleted!'
      }
    } catch (e) {
      let statusCode = 400
      if (e.message.includes('Not found')) statusCode = 404
      return {
        statusCode,
        body: e.message
      }
    }
    return undefined
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
