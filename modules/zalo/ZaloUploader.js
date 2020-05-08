const util = require('util');

class ZaloUploader {
  constructor(request, config) {
    this.request = request;
    this.config = config;
  }

  async uploadImage(imageFile, owner) {
    const { accessToken } = owner.zaloOA;
    const { zaloApi: { officialAccount: { upload: { uploadImage } } } } = this.config;
    const options = {
      method: 'POST',
      url: `${uploadImage}?access_token=${accessToken}`,
      formData: {
        file: {
          value: imageFile.readableSteam,
          options: {
            filename: imageFile.filename,
          },
        },
      },
    };
    return util.promisify(this.request)(options).then((res) => JSON.parse(res.body));
  }
}

module.exports = ZaloUploader;
