class UserFollowOAEventHandler {
  constructor(zaloInterestedUserProvider, http, userProvider, config) {
    this.zaloInterestedUserProvider = zaloInterestedUserProvider;
    this.http = http;
    this.userProvider = userProvider;
    this.config = config;
  }

  async handle(data) {
    const { zaloApi: { officialAccount: { getInterestedUserProfile } } } = this.config;
    const interestedUser = await this.zaloInterestedUserProvider.findByZaloId(data.follower.id);
    if (interestedUser) {
      return interestedUser;
    }
    const user = await this.userProvider.findByZaloId(data.oa_id);
    const userInfo = await this.http(`${getInterestedUserProfile}?access_token=${user.zaloOA.accessToken}&data={"user_id":"${data.follower.id}"}`, {
      method: 'GET',
    }).then((response) => response.json());
    return this.zaloInterestedUserProvider.create({
      zaloId: data.follower.id,
      displayName: userInfo.data.display_name,
      dob: userInfo.data.birth_date,
      gender: userInfo.data.user_gender === 1 ? 'male' : 'female',
      avatar: userInfo.data.avatar,
      avatars: userInfo.data.avatars,
      timestamp: data.timestamp,
      followings: [{ id: user.id, zaloId: data.oa_id }],
      info: userInfo.data.shared_info,
    });
  }

  static getEvent() {
    return 'follow';
  }

  // eslint-disable-next-line class-methods-use-this
  async mapDataFromZalo(data) {
    return data;
  }
}

module.exports = UserFollowOAEventHandler;
