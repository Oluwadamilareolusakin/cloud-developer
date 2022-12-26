import type { AWS } from "@serverless/typescript";

import getGroups from "@functions/get-groups";

const serverlessConfiguration: AWS = {
  service: "serverless-udagram",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    stage: "dev",
    region: "us-east-1",
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      GROUPS_TABLE: "${self:service}-groups-${self:custom.stage}-table",
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["dynamodb:Scan"],
        Resource: [{ "Fn::GetAtt": ["GroupsTable", "Arn"] }],
      },
    ],
  },
  // import the function via paths
  functions: {
    getGroups,
  },
  resources: {
    Resources: {
      GroupsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:provider.environment.GROUPS_TABLE}",
          AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
          BillingMode: "PAY_PER_REQUEST",
          KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        },
      },
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    stage: "${opt:stage, self:provider.stage}",
    region: "${opt:region, self:provider.region}",
  },
};

module.exports = serverlessConfiguration;
