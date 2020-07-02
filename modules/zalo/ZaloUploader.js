const FormData = require('form-data');

class ZaloUploader {
  constructor(request, config) {
    this.request = request;
    this.config = config;
  }

  uploadImage(file, owner) {
    const { accessToken } = owner.credential;
    const { zaloApi: { officialAccount: { upload: { uploadImage } } } } = this.config;
    const formdata = new FormData();
    formdata.append('file', file.data, {
      name: 'file',
      filename: file.filename,
    });
    const options = {
      method: 'POST',
      body: formdata,
    };
    return this.request(`${uploadImage}?access_token=${accessToken}`, options).then((res) => res.json());
  }

  uploadGif(file, owner) {
    const { accessToken } = owner.credential;
    const { zaloApi: { officialAccount: { upload: { uploadGif } } } } = this.config;
    const formdata = new FormData();
    formdata.append('file', file.data, {
      name: 'file',
      filename: file.filename,
    });
    const options = {
      method: 'POST',
      body: formdata,
    };
    return this.request(`${uploadGif}?access_token=${accessToken}`, options).then((res) => res.json());
  }

  uploadFile(file, owner) {
    const { accessToken } = owner.credential;
    const { zaloApi: { officialAccount: { upload: { uploadFile } } } } = this.config;
    const formdata = new FormData();
    formdata.append('file', file.data, {
      name: 'file',
      filename: file.filename,
    });
    const options = {
      method: 'POST',
      body: formdata,
    };
    return this.request(`${uploadFile}?access_token=${accessToken}`, options).then((res) => res.json());
  }
}

module.exports = ZaloUploader;
