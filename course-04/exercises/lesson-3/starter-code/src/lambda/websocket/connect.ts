import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import "source-map-support/register";
import * as AWS from "aws-sdk";

const docClient = new AWS.DynamoDB.DocumentClient();
const connectionsTable = process.env.WEBSOCKETS_CONNECTION_TABLE;

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Processing websocket event", event);

  const connectionId = event.requestContext.connectionId;
  const timestamp = new Date().toISOString();

  const Item = {
    connectionId,
    timestamp,
  };

  await docClient
    .put({
      TableName: connectionsTable,
      Item,
    })
    .promise();

  return {
    statusCode: 200,
    body: "Connection established!",
  };
};
