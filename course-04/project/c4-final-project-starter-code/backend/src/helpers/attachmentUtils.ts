import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const S3Client = new XAWS.S3()
const todoFilesBucket = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
// TODO: Handle Errors

export class AttachmentUtils {
  generateUploadUrl(Key: string) {
    const Bucket = todoFilesBucket
    const Expires = urlExpiration

    const params = {
      Key,
      Bucket,
      Expires
    }

    return S3Client.getSignedUrl('putObject', params)
  }
}
