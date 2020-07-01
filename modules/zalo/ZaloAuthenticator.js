module.exports = class ZaloAuthenticator {
  constructor(sha) {
    this.sha = sha;
  }

  verifySignature(signature, data, oa) {
    const generatedSignature = this.sha('sha256')
      .update(oa.credential.appId)
      .update(JSON.stringify(data))
      .update(data.timestamp)
      .update(oa.credential.oaSecretKey)
      .digest('hex');
    // if (generatedSignature !== signature.replace('mac=', '')) {
    //   throw new Error('signature is invalid');
    // }
  }
};
