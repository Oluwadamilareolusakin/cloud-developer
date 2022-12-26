import { SNSEvent, SNSHandler, S3Event } from 'aws-lambda';
import Jimp from 'jimp'
import * as AWS from 'aws-sdk'
 

const region = process.env.REGION
const s3 = new AWS.S3({region})

const thumbnailsBucket = process.env.IMAGE_THUMBNAILS_S3_BUCKET;
const imageBucket = process.env.IMAGES_S3_BUCKET;

export const handler: SNSHandler = async(event: SNSEvent) => {
  for(const snsRecord of event.Records) {
    const jsonMessage = snsRecord.Sns.Message;

    await processS3Record(JSON.parse(jsonMessage))
  }
}

const processS3Record = async(event: S3Event) => {
  for(const s3Record of event.Records) {
    const s3ObjectKey = s3Record.s3.object.key

    const resizedImage = await resizeImage(s3ObjectKey);


    const res = await s3.putObject({
      Key: `${s3ObjectKey}.jpeg`,
      Bucket: thumbnailsBucket,
      Body: resizedImage
    }).promise();

    console.log("Resizing, resizing, resized:", resizedImage, res)
  }
}

const getImage = async(key: string): Promise<Buffer> => {
  const response = await s3.getObject(
    {
      Bucket: imageBucket,
      Key: key
    }
  ).promise()

  return Buffer.from(response.Body);
}

const resizeImage = async (key) => {
  const rawImage = await getImage(key);

  const image = await Jimp.read(rawImage)

  image.resize(150, Jimp.AUTO)

  return await image.getBufferAsync(Jimp.MIME_JPEG)
}
