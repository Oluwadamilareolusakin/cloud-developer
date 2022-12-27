import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

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

  async updateItem(
    id: string,
    userId: string,
    timestamp: string,
    item: TodoUpdate
  ) {
    try {
      this.log(
        `Updating item with id ${id}, for user: ${userId} using params ${item}`
      )

      await this.documentClient
        .update({
          TableName: todoTableName,
          Key: { userId, timestamp },
          ConditionExpression: 'todoId = :id',
          UpdateExpression: `set #name = :todoName, dueDate = :dueDate, done = :done`,
          ExpressionAttributeValues: {
            ':todoName': item.name,
            ':dueDate': item.dueDate,
            ':done': item.done,
            ':id': id
          },
          ExpressionAttributeNames: {
            '#name': 'name'
          }
        })
        .promise()
    } catch (e) {
      this.handleError(e)
    }
  }

  async deleteItem(id: string, timestamp: string, userId: string) {
    await this.documentClient
      .delete({
        TableName: todoTableName,
        Key: { userId, timestamp },
        ConditionExpression: `todoId = :id`,
        ExpressionAttributeValues: { ':id': id }
      })
      .promise()
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
