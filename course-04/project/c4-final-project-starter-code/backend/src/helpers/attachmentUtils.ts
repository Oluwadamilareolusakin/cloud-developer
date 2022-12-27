import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const S3Client = new XAWS.S3()
const todoFilesBucket = process.env.ATTACHMENT_S3_BUCKET

export const generateUploadUrl = (Key: string, ContentType: string) => {
  const Bucket = todoFilesBucket

  const params = {
    Key,
    Bucket,
    ContentType
  }

  return S3Client.getSignedUrl('putObject', params)
}
