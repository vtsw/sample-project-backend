const { merge } = require('lodash');
const { GraphQLUpload } = require('graphql-upload');
const config = require('../config');
const userResolver = require('./user/graphql/resolver');
const messageResolver = require('./message/graphql/resolver');

const baseResolver = {
  Upload: GraphQLUpload,
  Mutation: {
    hello: (_, { name }) => `hello ${name}`,
    uploadImage: async (source, { file }, { minio, userProvider, req }) => {
      const bucketName = 'upload';
      const {
        filename, mimetype, encoding, createReadStream,
      } = await file;

      if (
        !mimetype.includes('jpeg')
        && !mimetype.includes('jpg')
        && !mimetype.includes('png')
        && !mimetype.includes('gif')
      ) {
        throw new Error('Only images are allowed');
      }

      const etag = await minio.putObject(bucketName, filename, createReadStream(), { mimetype, encoding });
      const link = await minio.presignedUrl('GET', bucketName, filename);
      const url = new URL(link);
      url.search = '';
      url.host = config.minio.publicEndPoint;
      const { user: loggedUser } = req;
      await userProvider.update(loggedUser.id, { avatar: url.href });
      return {
        filename,
        mimetype,
        encoding,
        link: url.href,
        etag,
      };
    },
  },
  Query: {
    hello: () => 'world',
  },
};

module.exports = merge(baseResolver, userResolver, messageResolver);
