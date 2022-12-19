import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const docClient = new AWS.DynamoDB.DocumentClient({
  region: process.env.GROUPS_TABLE_REGION,
});

const tableName = process.env.GROUPS_TABLE;

export const handler = async (event) => {
  // TODO implement

  const id = uuidv4();

  const { description, name } = JSON.parse(event.body);

  console.log(description, name);
  let statusCode, body;

  const Item = {
    name,
    description,
    id,
  };

  try {
    await docClient
      .put({
        TableName: tableName,
        Item,
      })
      .promise();

    body = Item;
    statusCode = 201;
  } catch (e) {
    body = e.message;
    statusCode = 400;
  } finally {
    const response = {
      statusCode,
      body: JSON.stringify(body),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
    return response;
  }
};
