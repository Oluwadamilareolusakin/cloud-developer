import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";

const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();

const groupsTable = process.env.GROUPS_TABLE;

export const getGroups: ValidatedEventAPIGatewayProxyEvent<typeof schema> =
  async (event) => {
    console.log("Processing event: ", event);

    // TODO: Read and parse "limit" and "nextKey" parameters from query parameters
    // let nextKey // Next key to continue scan operation if necessary
    // let limit // Maximum number of elements to return

    // HINT: You might find the following method useful to get an incoming parameter value
    // getQueryParameter(event, 'param')

    // TODO: Return 400 error if parameters are invalid

    let startKey = getQueryParameter(event, "nextKey");
    startKey = decodeNextKey(startKey);
    const limit = getQueryParameter(event, "limit");

    try {
      if (parseInt(limit) < 0) throw "Invalid limit";
    } catch (e) {
      return {
        statusCode: 400,
        body: "Invalid limit parameter",
      };
    }

    // Scan operation parameters
    const scanParams = {
      TableName: groupsTable,
      // TODO: Set correct pagination parameters
      Limit: limit,
      ExclusiveStartKey: startKey,
    };
    console.log("Scan params: ", scanParams);

    const result = await docClient.scan(scanParams).promise();

    const items = result.Items;

    console.log("Result: ", result);

    // Return result
    return formatJSONResponse(
      {
        items,
        // Encode the JSON object so a client can return it in a URL as is
        nextKey: encodeNextKey(result.LastEvaluatedKey),
      },
      200,
      {
        "Access-Control-Allow-Origin": "*",
      }
    );
  };

/**
 * Get a query parameter or return "undefined"
 *
 * @param {Object} event HTTP event passed to a Lambda function
 * @param {string} name a name of a query parameter to return
 *
 * @returns {string} a value of a query parameter value or "undefined" if a parameter is not defined
 */
function getQueryParameter(event, name) {
  const queryParams = event.queryStringParameters;
  if (!queryParams) {
    return undefined;
  }

  return queryParams[name];
}

/**
 * Encode last evaluated key using
 *
 * @param {Object} lastEvaluatedKey a JS object that represents last evaluated key
 *
 * @return {string} URI encoded last evaluated key
 */
function encodeNextKey(lastEvaluatedKey) {
  if (!lastEvaluatedKey) {
    return null;
  }

  return encodeURIComponent(JSON.stringify(lastEvaluatedKey));
}

function decodeNextKey(lastEvaluatedKey) {
  if (!lastEvaluatedKey) {
    return null;
  }

  return JSON.parse(decodeURIComponent(lastEvaluatedKey));
}

// const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
//   event
// ) => {
//   return formatJSONResponse({
//     message: `Hello ${event.body.name}, welcome to the exciting Serverless world!`,
//     event,
//   });
// };

export const main = middyfy(getGroups);
