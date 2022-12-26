import { S3Event, SNSHandler, SNSEvent } from "aws-lambda";
import * as AWS from "aws-sdk";

const docClient = new AWS.DynamoDB.DocumentClient();
const connectionsTable = process.env.WEBSOCKETS_CONNECTION_TABLE;

const stage = process.env.STAGE;
const websocketApiId = process.env.WEBSOCKETS_API_ID;
const region = process.env.REGION;
const connectionUrl = `${websocketApiId}.execute-api.${region}.amazonaws.com/${stage}`;

const websocketConnectionParams = () => {
  return {
    endpoint: connectionUrl,
    apiVersion: "2018-11-29",
  };
};

const apiGateway = new AWS.ApiGatewayManagementApi(websocketConnectionParams());

export const handler: SNSHandler = async (event: SNSEvent) => {
  for (const snsRecord of event.Records) {
    const s3EventJson = snsRecord.Sns.Message;

    console.log("Processing images sns event", s3EventJson);

    await processS3Event(JSON.parse(s3EventJson));
  }
};

const processS3Event = async (event: S3Event) => {
  let result = await docClient
    .scan({
      TableName: connectionsTable,
    })
    .promise();

  let connections = result.Items;

  console.log("Processing s3 Notification for connections:", connections);
  console.log("Processing s3 Notification for records:", event.Records);

  for (const record of event.Records) {
    let payload = JSON.stringify({
      Key: record.s3.object.key,
    });

    for (let connection of connections) {
      await sendPayload(connection.connectionId, payload);
    }
  }
};

const sendPayload = async (ConnectionId, Data) => {
  try {
    console.log(
      "Sending ws payload to connection",
      connectionUrl,
      ConnectionId,
      Data
    );
    let res = await apiGateway
      .postToConnection({
        ConnectionId,
        Data,
      })
      .promise();

    console.log("Res", res);
  } catch (e) {
    console.log("handling error with sending ws payload", e);
    if (e.statusCode === 410) {
      let Key = {
        connectionId: ConnectionId,
      };

      await docClient
        .delete({
          TableName: connectionsTable,
          Key,
        })
        .promise();
      console.log("deleted stale connection", ConnectionId);
    }
  }
};
