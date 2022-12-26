import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import middy from '@middy/core'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import Todos from '../../helpers/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const todos = new Todos()

    try {
      const todo = todos.createTodo(userId, newTodo)

      return {
        statusCode: 201,
        body: JSON.stringify({ todo })
      }
    } catch (e) {
      return {
        statusCode: 201,
        body: e.message
      }
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
