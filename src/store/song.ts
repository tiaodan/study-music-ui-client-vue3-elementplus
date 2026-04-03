import { Icon } from "@/enums";

// 播放列表最大容量
const MAX_PLAYLIST_SIZE = 100;

export default {
  state: {
    /** 音乐信息 */
    songId: "", // 音乐 ID
    songTitle: "", // 歌名
    songUrl: "", // 音乐 URL
    songPic: `/img/songPic/tubiao.jpg`, // 歌曲图片
    singerName: "", //  歌手名
    lyric: [], // 处理后的歌词数据
    isLoading: false, // 音乐加载中

    /** 音乐播放信息 */
    isPlay: false, // 播放状态
    playBtnIcon: Icon.BOFANG, // 播放状态的图标
    volume: 0, // 音量
    duration: 0, // 音乐时长
    curTime: 0, // 当前音乐的播放位置
    changeTime: 0, // 指定播放时刻
    autoNext: true, // 用于触发自动播放下一首
    playMode: 0, // 播放模式：0=列表循环, 1=单曲循环, 2=随机播放

    /** 音乐列表信息 */
    currentPlayList: [], // 当前播放列表
    songDetails: null, // 单个歌单信息
    currentPlayIndex: -1, // 当前歌曲在歌曲列表的位置
  },
  getters: {
    songId: (state) => state.songId,
    songTitle: (state) => state.songTitle,
    songUrl: (state) => state.songUrl,
    songPic: (state) => state.songPic,
    singerName: (state) => state.singerName,
    lyric: (state) => state.lyric,
    isLoading: (state) => state.isLoading,

    isPlay: (state) => state.isPlay,
    playBtnIcon: (state) => state.playBtnIcon,
    volume: (state) => state.volume,
    duration: (state) => state.duration,
    curTime: (state) => state.curTime,
    changeTime: (state) => state.changeTime,
    autoNext: (state) => state.autoNext,
    playMode: (state) => state.playMode,

    currentPlayList: (state) => state.currentPlayList,
    songDetails: (state) => state.songDetails,
    currentPlayIndex: (state) => state.currentPlayIndex,
  },
  mutations: {
    setSongId: (state, songId) => {
      state.songId = songId;
    },
    setSongTitle: (state, songTitle) => {
      state.songTitle = songTitle;
    },
    setSongUrl: (state, songUrl) => {
      state.songUrl = songUrl;
    },
    setSongPic: (state, songPic) => {
      state.songPic = songPic;
    },
    setSingerName: (state, singerName) => {
      state.singerName = singerName;
    },
    setAutoNext: (state, autoNext) => {
      state.autoNext = autoNext;
    },
    setPlayMode: (state, playMode) => {
      state.playMode = playMode;
    },
    setLyric: (state, lyric) => {
      state.lyric = lyric;
    },
    setIsLoading: (state, isLoading) => {
      state.isLoading = isLoading;
    },

    setIsPlay: (state, isPlay) => {
      state.isPlay = isPlay;
    },
    setPlayBtnIcon: (state, playBtnIcon) => {
      state.playBtnIcon = playBtnIcon;
    },
    setVolume: (state, volume) => {
      state.volume = volume;
    },
    setDuration: (state, duration) => {
      state.duration = duration;
    },
    setCurTime: (state, curTime) => {
      state.curTime = curTime;
    },
    setChangeTime: (state, changeTime) => {
      state.changeTime = changeTime;
    },

    setCurrentPlayList: (state, currentPlayList) => {
      state.currentPlayList = currentPlayList;
    },
    setSongDetails: (state, songDetails) => {
      state.songDetails = songDetails;
    },
    setCurrentPlayIndex: (state, currentPlayIndex) => {
      state.currentPlayIndex = currentPlayIndex;
    },
  },
  actions: {
    // 播放整个列表（原有逻辑，用于上一首/下一首切换）
    playMusic: ({ commit }, { id, url, pic, index, songTitle, singerName, lyric, currentSongList }) => {
      commit("setSongId", id);
      commit("setSongUrl", url);
      commit("setSongPic", pic);
      commit("setCurrentPlayIndex", index);
      commit("setSongTitle", songTitle);
      commit("setSingerName", singerName);
      commit("setLyric", lyric);
      commit("setCurrentPlayList", currentSongList);
    },
    // 播放单首歌曲（追加到播放列表）
    playSingleSong: ({ commit, state }, song) => {
      const { id, url, pic, songTitle, singerName, lyric } = song;

      // 检查歌曲是否已在播放列表中
      const existIndex = state.currentPlayList.findIndex(item => item.id === id);

      if (existIndex !== -1) {
        // 已存在，直接播放
        commit("setSongId", id);
        commit("setSongUrl", url);
        commit("setSongPic", pic);
        commit("setCurrentPlayIndex", existIndex);
        commit("setSongTitle", songTitle);
        commit("setSingerName", singerName);
        commit("setLyric", lyric);
        return;
      }

      // 检查播放列表是否已满
      if (state.currentPlayList.length >= MAX_PLAYLIST_SIZE) {
        // 返回错误信息，由调用方提示用户
        throw new Error(`播放列表已达上限（${MAX_PLAYLIST_SIZE}首），请先删除部分歌曲`);
      }

      // 追加到列表末尾
      const newSong = {
        id,
        url,
        pic,
        name: singerName + "-" + songTitle,
        lyric,
      };
      const newList = [...state.currentPlayList, newSong];
      const newIndex = newList.length - 1;

      commit("setCurrentPlayList", newList);
      commit("setSongId", id);
      commit("setSongUrl", url);
      commit("setSongPic", pic);
      commit("setCurrentPlayIndex", newIndex);
      commit("setSongTitle", songTitle);
      commit("setSingerName", singerName);
      commit("setLyric", lyric);
    },
  },
};
