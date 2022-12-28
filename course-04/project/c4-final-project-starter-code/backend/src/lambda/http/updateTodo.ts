import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import Todos from '../../helpers/businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId: string = getUserId(event)

    const todosHelper = new Todos()

    await todosHelper.updateTodo(todoId, userId, updatedTodo)

    return {
      statusCode: 204,
      body: 'Updated succesfully!'
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
