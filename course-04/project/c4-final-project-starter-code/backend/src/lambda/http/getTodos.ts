import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import cors from '@middy/http-cors'

import Todos from '../../helpers/todos'
import { getUserId } from '../utils'

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const todos = new Todos()
    const userId = getUserId(event)

    const results = todos.getTodos(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        todos: results
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
