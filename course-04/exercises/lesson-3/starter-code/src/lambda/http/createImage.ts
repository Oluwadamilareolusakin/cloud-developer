import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import "source-map-support/register";
import * as AWS from "aws-sdk";

import * as uuid from "uuid";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const docClient = new AWS.DynamoDB.DocumentClient();

const groupsTable = process.env.GROUPS_TABLE;
const imagesTable = process.env.IMAGES_TABLE;

const bucketRegion = process.env.IMAGES_S3_BUCKET_REGION;
const s3Bucket = process.env.IMAGES_S3_BUCKET;
const s3UrlExpiry = process.env.IMAGES_S3_URL_EXPIRY;
const s3BucketUrl = `https://${s3Bucket}.s3.amazonaws.com`;

const s3 = new S3Client({ region: bucketRegion });

const generatePresignedUrl = async (params) => {
  console.log("Generating url for: ", params);
  let command = new PutObjectCommand(params);

  const url = await getSignedUrl(s3, command, {
    expiresIn: parseInt(s3UrlExpiry),
  });

  console.log("Generated url: ", url);

  return url;
};

const getS3UrlParams = (imageId: string) => {
  return {
    Key: imageId,
    Bucket: s3Bucket,
  };
};

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Processing event", event);
  const groupId = event.pathParameters.groupId;
  const description = JSON.parse(event.body).description;
  const validGroupId = await groupExists(groupId);

  const timestamp = new Date().toISOString();

  if (!validGroupId) {
    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Group does not exist",
      }),
    };
  }

  const imageId = uuid();

  console.log("generating upload url");

  let imageUploadUrl = await generatePresignedUrl(getS3UrlParams(imageId));

  console.log("generated upload url", imageUploadUrl);

  const Image = {
    groupId,
    imageId,
    description,
    timestamp,
    url: `${s3BucketUrl}/${imageId}`,
  };

  await docClient
    .put({
      TableName: imagesTable,
      Item: Image,
    })
    .promise();

  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      entity: "group-image",
      item: Image,
      imageUploadUrl,
    }),
  };
};

async function groupExists(groupId: string) {
  const result = await docClient
    .get({
      TableName: groupsTable,
      Key: {
        id: groupId,
      },
    })
    .promise();

  console.log("Get group: ", result);
  return !!result.Item;
}
