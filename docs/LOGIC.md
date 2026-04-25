# 项目逻辑说明文档

## 1. 缓存策略

缓存配置文件：`src/config/cache.config.ts`

### 缓存类型

| 缓存类型 | Key | 过期时间 | 点击刷新阈值 | 说明 |
|---------|-----|---------|-------------|------|
| SINGER_LIST | cache_singer_list | 1小时 | 40次 | 歌手列表 |
| BANNER_LIST | cache_banner_list | 6小时 | 100次 | Banner广告列表 |
| SINGER_DETAIL | cache_singer_detail_{id} | 1天 | - | 歌手详情 |
| ALBUM_LIST | cache_album_list_{singerId} | 1小时 | 10次 | 专辑列表 |
| ALBUM_DETAIL | cache_album_detail_{albumId} | 1天 | - | 专辑详情（歌曲） |
| SONG_LIST | cache_song_list_{singerId} | 永久(-1) | - | 歌手所有歌曲 |
| LYRIC | IndexedDB | 永久(-1) | - | 歌词缓存 |
| AD_POPUP | cache_ad_popup | 24小时 | - | 广告弹窗 |
| RANK_LIST | cache_rank_list_{websiteId} | 6小时 | 20次 | 榜单列表 |
| RANK_SONGS | cache_rank_songs_{websiteId}_{rankName} | 1小时 | 10次 | 榜单歌曲 |

### 缓存更新策略

**双重触发机制**（任一满足即触发后台静默更新）：

1. **时间过期** - 到达过期时间后，返回旧缓存 + 后台更新
2. **点击计数** - 每次访问计数+1，达到阈值后，返回旧缓存 + 后台更新

### 手动清除缓存

```javascript
// 清除单个缓存
localStorage.removeItem('cache_singer_list')

// 清除所有缓存
localStorage.clear()

// 清除歌词缓存（IndexedDB）
// 需在浏览器开发者工具 -> Application -> IndexedDB -> music_cache_db -> lyrics
```

---

## 2. API 接口

API定义文件：`src/api/index.ts`

### 用户相关
- `signIn` - 登录
- `SignUp` - 注册
- `getUserOfId` - 获取用户详情
- `updateUserMsg` - 更新用户信息

### 歌手相关
- `getAllSinger` - 获取所有歌手
- `getSingerOfSex` - 按性别筛选歌手
- `getSingerOfAreaAndSex` - 按地区和性别筛选
- `getSingerByCondition` - 按地区、性别、字母筛选
- `getSingerAlbums` - 获取歌手专辑列表（简版）

### 歌曲相关
- `getSongOfId` - 获取歌曲详情 `/capi/song/detail?id={id}`
- `getSongOfSingerId` - 获取歌手所有歌曲 `/capi/song/singer/detail?singerId={id}`
- `getAlbumDetail` - 获取专辑歌曲 `/capi/song/album/detail?albumId={id}`

### 榜单相关
- `getRankList` - 获取榜单列表 `/capi/rank/list?websiteId={id}`
- `getRankDetail` - 获取榜单歌曲 `/capi/rank/detail?websiteId={id}&rankName={name}`

### 其他
- `getBannerList` - 获取Banner列表
- `getSongList` - 获取歌单列表

---

## 3. 歌曲播放逻辑

歌曲播放组件：`src/components/SongList.vue`

### 歌曲来源区分

| 来源 | 标识字段 | 歌曲ID | 播放URL接口 | 说明 |
|-----|---------|--------|------------|------|
| 歌手歌曲 | 无 `rank_order` | `id` (song_id) | `/capi/song/{id}` | 歌手详情页的歌曲 |
| 排行榜歌曲 | 有 `rank_order` | `rank_{rank_order}` | `/capi/song-rank/{song_rank_id}` | 推荐页面的榜单歌曲 |

### 播放URL构建逻辑

```javascript
function getPlayUrl(row) {
  // 排行榜歌曲：有 rank_order 字段，使用 song-rank 接口
  if (row.rank_order) {
    return `/capi/song-rank/${row.rank_order}`;
  }
  // 歌手歌曲：使用 song 接口
  const baseUrl = row.url || row.nas_url_path || '';
  if (baseUrl.startsWith('/song/')) {
    return `/capi/song/${baseUrl.slice(6)}`;
  }
  return baseUrl;
}
```

### 歌曲唯一ID

播放列表中需要唯一标识歌曲，避免重复：

- 排行榜歌曲：`rank_${row.rank_order}`（字符串类型，带前缀）
- 歌手歌曲：`row.id`（数字类型）

### 歌词缓存ID

歌词缓存到 IndexedDB 时使用的 key：

- 排行榜歌曲：`row.rank_order`（song_rank_id）
- 歌手歌曲：`row.id`（song_id）

### 播放流程

1. 用户点击歌曲
2. 判断歌曲来源（是否有 `rank_order` 字段）
3. 构建对应的播放URL和唯一ID
4. 缓存歌词到 IndexedDB（使用 song_rank_id 或 song_id）
5. 调用 Vuex action `playSingleSong` 播放歌曲

### 涉及的函数

- `handleRowDbClick` - 双击行播放
- `handlePlay` - 点击播放按钮
- `handleAddToPlaylist` - 添加到播放列表

---

## 4. 路由结构

路由配置文件：`src/router/index.ts`

### 主要路由

| 路径 | 页面 | 说明 |
|-----|------|------|
| `/` | Home.vue | 首页 |
| `/recommend` | Recommend.vue | 推荐榜单 |
| `/singer` | Singer.vue | 歌手列表 |
| `/singer-detail/:id` | SingerDetail.vue | 歌手详情 |
| `/song-sheet` | SongSheet.vue | 歌单列表 |
| `/search` | Search.vue | 搜索页面 |
| `/lyric/:id` | Lyric.vue | 歌词页面 |

---

## 5. Vuex 状态管理

Store文件：`src/store/song.ts`

### 播放相关状态

- `songId` - 当前歌曲ID
- `songTitle` - 歌曲名
- `songUrl` - 播放URL
- `singerName` - 歌手名
- `songPic` - 歌曲封面
- `lyric` - 歌词
- `isPlay` - 是否播放
- `volume` - 音量
- `duration` - 总时长
- `curTime` - 当前播放时间
- `currentPlayList` - 播放列表
- `currentPlayIndex` - 当前播放索引

### Actions

- `playMusic` - 播放整个列表（用于上一首/下一首）
- `playSingleSong` - 播放单首歌曲（追加到列表）

---

## 6. 导航配置

导航枚举文件：`src/enums/nav.ts`

### NavName 枚举

```typescript
Home = "首页"
Recommend = "推荐"
SongSheet = "歌单"
Singer = "歌手"
MyMusic = "我的音乐"
```

### HEADERNAVLIST

导航栏显示的菜单项，按顺序排列。

---

## 7. 榜单网站ID映射

| websiteId | 网站名称 |
|-----------|---------|
| 1 | QQ音乐 |
| 2 | 酗狗 |
| 3 | 酷我 |
| 4 | 网易云 |
| 5 | 咪咕 |