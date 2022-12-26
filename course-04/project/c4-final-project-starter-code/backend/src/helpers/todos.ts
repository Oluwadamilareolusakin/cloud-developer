import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { timestamp } from './timestamp'

const logger = createLogger('Todos')

export default class Todos {
  TodosClient: TodosAccess
  AttachmentUtils: AttachmentUtils

  constructor() {
    this.TodosClient = new TodosAccess()
    this.AttachmentUtils = new AttachmentUtils()
  }

  createTodo(
    userId: string,
    attributes: CreateTodoRequest,
    attachmentUrl?: string
  ): TodoItem {
    try {
      const todoId = uuid()

      const todoItem = {
        todoId,
        userId,
        createdAt: timestamp(),
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
      return this.TodosClient.createItem(todoItem)
    } catch (e) {
      this.log(`Failed to create todo`)

      throw createError(e)
    }
  }

  updateTodo(id: string, todo: UpdateTodoRequest): void {
    try {
      this.log(`Updating todo with id ${id}, attributes: ${todo}`)
      this.TodosClient.updateItem(id, todo)
    } catch (e) {
      this.log(`Failed to update todo with id ${id}`)
      throw createError(e)
    }
  }

  // Todo Handle Errors
  generateUploadUrl(id: string) {
    return this.AttachmentUtils.generateUploadUrl(id)
  }

  log(message, level = 'info') {
    logger.log({
      level,
      message
    })
  }
}
