import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import Todos from '../../helpers/businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const todos = new Todos()

    try {
      if (newTodo.name.length === 0 || newTodo.dueDate.length === 0)
        throw new Error(
          'Invalid parameters, ensure you enter a name and due date'
        )
      const todo = await todos.createTodo(userId, newTodo)

      return {
        statusCode: 201,
        body: JSON.stringify({ todo })
      }
    } catch (e) {
      return {
        statusCode: 400,
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
