import "./env";

let env = process.env;
const config = {
  development: {
    username: env.PG_USERNAME,
    password: env.PGPASSWORD.toString(),
    database: env.PG_DATABASE,
    host: env.PG_HOST,
    dialect: "postgres",
    aws_region: env.S3_REGION,
    awsSecretAccessKey: env.S3_SECRET_KEY,
    awsAccessKeyId: env.S3_ACCESS_ID,
    aws_media_bucket: env.S3_BUCKET,
  },
  jwt: {
    secret: "",
  },
  test: {
    username: env.PG_USERNAME,
    password: env.PGPASSWORD.toString(),
    database: env.PG_DATABASE,
    host: env.PG_HOST,
    dialect: "postgres",
    aws_region: env.S3_REGION,
    awsSecretAccessKey: env.S3_SECRET_KEY,
    awsAccessKeyId: env.S3_ACCESS_ID,
    aws_media_bucket: env.S3_BUCKET,
  },
  production: {
    username: env.PG_USERNAME,
    password: env.PGPASSWORD.toString(),
    database: env.PG_DATABASE,
    host: env.PG_HOST,
    dialect: "postgres",
    aws_region: env.S3_REGION,
    awsSecretAccessKey: env.S3_SECRET_KEY,
    awsAccessKeyId: env.S3_ACCESS_ID,
    aws_media_bucket: env.S3_BUCKET,
  },
};

module.exports = config;
