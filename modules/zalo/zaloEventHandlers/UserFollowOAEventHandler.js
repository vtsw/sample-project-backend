class UserFollowOAEventHandler {
  /**
   *
   * @param zaloInterestedUserProvider
   * @param http
   * @param userProvider
   * @param config
   */
  constructor(zaloInterestedUserProvider, http, userProvider, config) {
    this.zaloInterestedUserProvider = zaloInterestedUserProvider;
    this.http = http;
    this.userProvider = userProvider;
    this.config = config;
  }

  /**
   *
   * @param data
   * @returns {Promise<*>}
   */
  async handle(data) {
    const user = await this.userProvider.findByZaloId(data.oa_id);
    const { zaloApi: { officialAccount: { getInterestedUserProfile } } } = this.config;
    const interestedUser = await this.zaloInterestedUserProvider.findByZaloId(data.user_id_by_app);
    if (interestedUser) {
      return this.zaloInterestedUserProvider.update(interestedUser.id, {
        followings: interestedUser.followings.push({ id: user.id, zaloId: data.oa_id, OAFollowerId: data.follower.id }),
      });
    }
    const userInfo = await this.http(`${getInterestedUserProfile}?access_token=${user.zaloOA.accessToken}&data={"user_id":"${data.follower.id}"}`, {
      method: 'GET',
    }).then((response) => response.json());
    return this.zaloInterestedUserProvider.create({
      zaloId: data.user_id_by_app,
      displayName: userInfo.data.display_name,
      dob: userInfo.data.birth_date,
      gender: userInfo.data.user_gender === 1 ? 'male' : 'female',
      avatar: userInfo.data.avatar,
      avatars: userInfo.data.avatars,
      timestamp: data.timestamp,
      followings: [{ id: user.id, zaloId: data.oa_id, OAFollowerId: data.follower.id }],
      info: userInfo.data.shared_info,
    });
  }

  static getEvent() {
    return 'follow';
  }
}

module.exports = UserFollowOAEventHandler;
