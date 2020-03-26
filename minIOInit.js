const config = require('./config');
const minio = require('./services/minio');

const minioClient = minio(config);

const publicPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Principal: '*',
      Action: [
        's3:GetObject',
      ],
      Resource: 'arn:aws:s3:::upload/*',
    },
    {
      Effect: 'Allow',
      Principal: {
        AWS: [
          '*',
        ],
      },
      Action: [
        's3:GetBucketLocation',
        's3:ListBucket',
        's3:ListBucketMultipartUploads',
      ],
      Resource: [
        'arn:aws:s3:::upload',
      ],
    },
    {
      Effect: 'Allow',
      Principal: {
        AWS: [
          '*',
        ],
      },
      Action: [
        's3:PutObject',
        's3:AbortMultipartUpload',
        's3:DeleteObject',
        's3:GetObject',
        's3:ListMultipartUploadParts',
      ],
      Resource: [
        'arn:aws:s3:::upload/*',
      ],
    },
  ],
};

(async () => {
  const uploadExist = await minioClient.bucketExists('upload');
  if (!uploadExist) {
    await minioClient.makeBucket('upload');
    minioClient.setBucketPolicy('upload', JSON.stringify(publicPolicy));
  }
  minioClient.bucketExists('logs').then((exist) => {
    if (!exist) {
      minioClient.makeBucket('logs');
    }
  });
// eslint-disable-next-line no-console
})().catch((e) => console.error(e));
