const FormData = require('form-data');

class ZaloUploader {
  constructor(request, config) {
    this.request = request;
    this.config = config;
  }

  async uploadImage(imageFile, owner) {
    const { accessToken } = owner.zaloOA;
    const { zaloApi: { officialAccount: { upload: { uploadImage } } } } = this.config;
    const formdata = new FormData();
    formdata.append('file', imageFile.readableSteam, {
      name: 'file',
      filename: imageFile.filename,
    });
    const options = {
      method: 'POST',
      body: formdata,
    };
    return this.request(`${uploadImage}?access_token=${accessToken}`, options).then((res) => res.json());
  }
}

module.exports = ZaloUploader;
