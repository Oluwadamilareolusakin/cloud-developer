import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS);
const S3Client = new XAWS.S3();
const todoFilesBucket = process.env.ATTACHMENT_S3_BUCKET;
// TODO: Handle Errors

export class AttachmentUtils {

  generateUploadUrl(Key: string){
    const Bucket = todoFilesBucket;
    const Expires = 3600

    const params = {
      Key,
      Bucket,
      Expires
    }

    return S3Client.getSignedUrl(
      'putObject',
      params
    )
  }
}

