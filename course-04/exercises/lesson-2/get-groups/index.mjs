import AWS from "aws-sdk";

const docClient = new AWS.DynamoDB.DocumentClient({
  region: process.env.GROUPS_TABLE_REGION.toString(),
});

const tableName = process.env.GROUPS_TABLE;

export const handler = async (event) => {
  // TODO implement

  const result = await docClient
    .scan({
      TableName: tableName.toString(),
    })
    .promise();

  const items = result.Items;

  const response = {
    statusCode: 200,
    body: JSON.stringify({ items }),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
  return response;
};
