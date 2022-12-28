import { generateUploadUrl as generateS3UploadUrl } from '../dataLayer/attachmentUtils'

export const generateUploadUrl = (key: string, contentType: string) => {
  return generateS3UploadUrl(key, contentType)
}
