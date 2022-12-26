import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

const todoTableName = process.env.TODO_TABLE

// TODO: Implement the dataLayer logic

// takes a todo item
// puts it into the db

export class TodosAccess {
  documentClient: DocumentClient

  constructor() {
    this.documentClient = new XAWS.DynamoDB.DocumentClient()
  }

  createItem(item: TodoItem) {
    try {
      this.log(`Creating item with using attributes ${item}`)

      this.documentClient.put({
        TableName: todoTableName,
        Item: item
      })

      return item
    } catch (e) {
      this.handleError(e)
    }
  }

  updateItem(id: string, item: TodoUpdate) {
    try {
      this.log(`Updating item with id ${id}, using params ${item}`)

      this.documentClient.update({
        TableName: todoTableName,
        Key: { id },
        UpdateExpression: 'set name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues: { ...item }
      })
    } catch (e) {
      this.handleError(e)
    }
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
