import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

const todoTableName = process.env.TODOS_TABLE
const todoIndexName = process.env.TODOS_USER_ID_INDEX

export class TodosAccess {
  documentClient: DocumentClient

  constructor() {
    this.documentClient = new XAWS.DynamoDB.DocumentClient()
  }

  async createItem(item: TodoItem) {
    try {
      this.log(`Creating item with using attributes ${item}`)

      let result = await this.documentClient
        .put({
          TableName: todoTableName,
          Item: item
        })
        .promise()

      return result
    } catch (e) {
      this.handleError(e)
    }
  }

  async getTodosForUser(userId: string) {
    const result = await this.documentClient
      .query({
        TableName: todoTableName,
        IndexName: todoIndexName,
        KeyConditionExpression: `userId = :userId`,
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    return result.Items
  }

  async updateItem(id: string, userId: string, item: UpdateTodoRequest) {
    try {
      this.log(
        `Updating item with id ${id}, for user: ${userId} using params ${item}`
      )

      await this.documentClient
        .update(
          this.removeEmptyKeysFromObject({
            TableName: todoTableName,
            Key: { userId, todoId: id },
            UpdateExpression: this.buildUpdateExpression({ ...item }),
            ExpressionAttributeValues:
              this.buildUpdateExpressionAttributeValues({
                ...item
              }),
            ExpressionAttributeNames: this.buildExpressionAttributeNames(item)
          })
        )
        .promise()
    } catch (e) {
      this.handleError(e)
    }
  }

  buildExpressionAttributeNames(item: UpdateTodoRequest) {
    if (item['name']) return { '#name': 'name' }

    return null
  }

  removeEmptyKeysFromObject(object) {
    const result = object

    for (const key in result) {
      if (result[key] === null) {
        delete result[key]
      }
    }

    return result
  }

  buildUpdateExpression(params) {
    let result = 'set '
    const expressions = []
    if (params['name']) expressions.push('#name = :name')
    if (params['dueDate']) expressions.push('dueDate = :dueDate')
    if (params['done']) expressions.push('done = :done')
    if (params['attachmentUrl'])
      expressions.push('attachmentUrl = :attachmentUrl')

    if (expressions.length === 0) return

    result += expressions.join(', ')

    return result
  }

  buildUpdateExpressionAttributeValues(params) {
    const result = {}

    for (const key in params) {
      if (params[key]) {
        result[`:${key}`] = params[key]
      }
    }

    if (Object.keys(result).length === 0) return

    return result
  }

  async deleteItem(id: string, userId: string) {
    await this.documentClient
      .delete({
        TableName: todoTableName,
        Key: { userId, todoId: id }
      })
      .promise()
  }

  async getItem(todoId: string, userId: string) {
    const result = await this.documentClient
      .query({
        TableName: todoTableName,
        IndexName: todoIndexName,
        KeyConditionExpression: `userId = :userId and todoId = :todoId`,
        ExpressionAttributeValues: {
          ':userId': userId,
          ':todoId': todoId
        }
      })
      .promise()

    return result.Items[0]
  }

  handleError(e: Error) {
    const message = `An error has occurred ${e.message}`
    this.log(message, 'error')

    throw new Error(message)
  }

  log(message, level = 'info') {
    logger.log({
      level,
      message
    })
  }
}
