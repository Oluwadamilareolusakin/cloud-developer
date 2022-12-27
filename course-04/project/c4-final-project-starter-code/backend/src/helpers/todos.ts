import { TodosAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { timestamp } from './timestamp'

const logger = createLogger('Todos')

export default class Todos {
  TodosClient: TodosAccess

  constructor() {
    this.TodosClient = new TodosAccess()
  }

  async getTodos(userId: string) {
    return await this.TodosClient.getTodosForUser(userId)
  }

  async createTodo(
    userId: string,
    attributes: CreateTodoRequest,
    attachmentUrl?: string
  ): Promise<TodoItem> {
    try {
      const todoId = uuid()

      const todoItem = {
        todoId,
        userId,
        timestamp: timestamp(),
        attachmentUrl,
        done: false,
        ...attributes
      }

      this.log(
        `Creating todo for user ${userId}, attributes: ${{
          ...attributes,
          attachmentUrl
        }}`
      )

      await this.TodosClient.createItem(todoItem)

      return todoItem
    } catch (e) {
      this.log(`Failed to create todo: ${e.message}`)

      throw new Error(`Failed to update todo with: ${e.message}`)
    }
  }

  async getTodo(todoId: string, userId: string) {
    try {
      return await this.TodosClient.getItem(todoId, userId)
    } catch (e) {
      this.log(`Failed to fetch todo with id ${todoId}, for user ${userId}`)
      throw e
    }
  }

  async updateTodo(id: string, userId: string, todo: UpdateTodoRequest) {
    try {
      this.log(`Updating todo with id ${id}, attributes: ${todo}`)
      await this.TodosClient.updateItem(id, userId, todo)
    } catch (e) {
      this.log(`Failed to update todo with id ${id}: ${e.message}`)
      throw new Error(`Failed to update todo with id ${id}: ${e.message}`)
    }
  }

  async deleteTodo(todoId: string, userId: string) {
    try {
      this.log(`Deleting todo with id ${todoId} for user with id ${userId}`)
      await this.TodosClient.deleteItem(todoId, userId)
    } catch (e) {
      this.log(`Failed to delete todo with id ${todoId}`)
      throw e
    }
  }

  log(message, level = 'info') {
    logger.log({
      level,
      message
    })
  }
}
