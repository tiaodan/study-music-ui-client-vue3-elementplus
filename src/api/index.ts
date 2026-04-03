import { getBaseURL, get, post, deletes } from "./request";

const HttpManager = {
  // 获取图片信息
  attachImageUrl: (url) => {
    // 如果为空，返回空字符串（由调用方处理默认图）
    if (!url || url.trim() === "") {
      return "";
    }
    // 去掉 \r\n 等空白字符
    const cleanUrl = url.trim();
    // 如果已经是完整 URL，直接返回
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl;
    }
    // 否则加上后端前缀，去掉开头多余的 /
    const path = cleanUrl.replace(/^\/+/, '');
    return `${getBaseURL()}/capi/${path}`;
  },
  // =======================> 用户 API 完成
  // 登录
  signIn: ({username,password}) => post(`capi/user/login/status`, {username,password}),
  signInByemail: ({email,password})=>post(`capi/user/email/status`, {email,password}),
  // 注册
  SignUp: ({username,password,sex,phoneNum,email,birth,introduction,location}) => post(`capi/user/add`, {username,password,sex,phoneNum,email,birth,introduction,location}),
  // 删除用户
  deleteUser: (id) => get(`capi/user/delete?id=${id}`),
  // 更新用户信息
  updateUserMsg: ({id,username,sex,phoneNum,email,birth,introduction,location}) => post(`capi/user/update`, {id,username,sex,phoneNum,email,birth,introduction,location}),
  updateUserPassword: ({id,username,oldPassword,password}) => post(`capi/user/updatePassword`, {id,username,oldPassword,password}),
  // 返回指定ID的用户
  getUserOfId: (id) => get(`capi/user/detail?id=${id}`),
  // 更新用户头像
  uploadUrl: (userId) => `${getBaseURL()}/capi/user/avatar/update?id=${userId}`,

  // =======================> 歌单 API 完成
  // 获取全部歌单
  getSongList: () => get("capi/songList"),
  // 获取歌单类型
  getSongListOfStyle: (style) => get(`capi/songList/style/detail?style=${style}`),
  // 返回标题包含文字的歌单
  getSongListOfLikeTitle: (keywords) => get(`capi/songList/likeTitle/detail?title=${keywords}`),
  // 返回歌单里指定歌单ID的歌曲
  getListSongOfSongId: (songListId) => get(`capi/listSong/detail?songListId=${songListId}`),

  // =======================> 歌手 API  完成
  // 返回所有歌手
  getAllSinger: () => get("capi/singer"),
  // 通过性别对歌手分类
  getSingerOfSex: (sex) => get(`capi/singer/sex/detail?sex=${sex}`),
  // 通过地区和性别对歌手分类
  getSingerOfAreaAndSex: (area, sex) => get(`capi/singer/area/sex/detail?area=${area}&sex=${sex}`),
  // 通过地区、性别和字母筛选歌手
  getSingerByCondition: (area, sex, initial) => get(`capi/singer/condition?area=${area}&sex=${sex}&initial=${initial}`),
  // 获取歌手专辑列表（简版，不含歌曲）
  getSingerAlbums: (singerId) => get(`capi/singer/albums?singerId=${singerId}`),

  // =======================> 收藏 API 完成
  // 返回的指定用户ID的收藏列表
  getCollectionOfUser: (userId) => get(`capi/collection/detail?userId=${userId}`),
  // 添加收藏的歌曲 type: 0 代表歌曲， 1 代表歌单
  setCollection: ({userId,type,songId}) => post(`capi/collection/add`,{userId,type,songId}),

  deleteCollection: (userId, songId) => deletes(`capi/collection/delete?userId=${userId}&&songId=${songId}`),

  isCollection: ({userId, type, songId}) => post(`capi/collection/status`, {userId, type, songId}),

  // =======================> 评分 API 完成
  // 提交评分
  setRank: ({songListId,consumerId,score}) => post(`capi/rankList/add`, {songListId,consumerId,score}),
  // 获取指定歌单的评分
  getRankOfSongListId: (songListId) => get(`capi/rankList?songListId=${songListId}`),
  // 获取指定用户的歌单评分
  getUserRank: (consumerId, songListId) => get(`capi/rankList/user?consumerId=${consumerId}&songListId=${songListId}`),

  // =======================> 评论 API 完成
  // 添加评论
  setComment: ({userId,content,songId,songListId,nowType}) => post(`capi/comment/add`, {userId,content,songId,songListId,nowType}),
  // 删除评论
  deleteComment: (id) => get(`capi/comment/delete?id=${id}`),
  // 点赞
  setSupport: ({id,up}) => post(`capi/comment/like`, {id,up}),
  // 返回所有评论
  getAllComment: (type, id) => {
    let url = "";
    if (type === 1) {
      url = `capi/comment/songList/detail?songListId=${id}`;
    } else if (type === 0) {
      url = `capi/comment/song/detail?songId=${id}`;
    }
    return get(url);
  },

  // =======================> 歌曲 API
  // 返回指定歌曲ID的歌曲
  getSongOfId: (id) => get(`capi/song/detail?id=${id}`),
  // 返回指定歌手ID的歌曲
  getSongOfSingerId: (id) => get(`capi/song/singer/detail?singerId=${id}`),
  // 返回指定歌手名的歌曲
  getSongOfSingerName: (keywords) => get(`capi/song/singerName/detail?name=${keywords}`),
  // 获取专辑详情（含歌曲列表）
  getAlbumDetail: (albumId) => get(`capi/song/album/detail?albumId=${albumId}`),
  // 下载音乐
  downloadMusic: (url) => get(url, { responseType: "blob" }),

  //======================> 点赞api的优化 避免有些是重复的点赞！新增数据表了得

  testAlreadySupport:({commentId,userId}) => post(`capi/userSupport/test`, {commentId,userId}),

  deleteUserSupport:({commentId,userId}) => post(`capi/userSupport/delete`, {commentId,userId}),

  insertUserSupport:({commentId,userId}) => post(`capi/userSupport/insert`, {commentId,userId}),

  //获取所有的海报
  getBannerList: () => get("capi/banner/getAllBanner")
};



export { HttpManager };
