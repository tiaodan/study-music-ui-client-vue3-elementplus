/**
 * 缓存配置文件
 * 可根据需要调整各项参数
 */
export const CACHE_CONFIG = {
  // 歌手列表缓存
  SINGER_LIST: {
    key: 'cache_singer_list',
    expire: 1 * 60 * 60 * 1000,  // 1小时过期（缩短，配合计数器）
    refreshCount: 40,            // 或点击40次更新（先到先触发）
  },

  // Banner列表缓存
  BANNER_LIST: {
    key: 'cache_banner_list',
    expire: 6 * 60 * 60 * 1000,  // 6小时过期
    refreshCount: 100,           // 或点击100次更新（先到先触发）
  },

  // 歌手详情缓存
  SINGER_DETAIL: {
    key: 'cache_singer_detail',
    expire: 24 * 60 * 60 * 1000, // 1天
  },

  // 专辑列表缓存
  ALBUM_LIST: {
    key: 'cache_album_list',
    expire: 1 * 60 * 60 * 1000,  // 1小时过期（缩短，配合计数器）
    refreshCount: 10,            // 或点击10次更新（先到先触发）
  },

  // 专辑详情缓存
  ALBUM_DETAIL: {
    key: 'cache_album_detail',
    expire: 24 * 60 * 60 * 1000, // 1天
  },

  // 歌曲列表缓存（永久）
  SONG_LIST: {
    key: 'cache_song_list',
    expire: -1, // -1 表示永久缓存
  },

  // 歌词缓存（永久）
  LYRIC: {
    key: 'cache_lyric',
    expire: -1, // -1 表示永久缓存
  },

  // 广告弹窗缓存（24小时只弹1次）
  AD_POPUP: {
    key: 'cache_ad_popup',
    expire: 24 * 60 * 60 * 1000, // 24小时
  },
}