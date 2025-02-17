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

  const Key = {
    connectionId,
  };

  await docClient
    .delete({
      TableName: connectionsTable,
      Key,
    })
    .promise();

  return {
    statusCode: 200,
    body: "Successfully disconnected!",
  };
};
