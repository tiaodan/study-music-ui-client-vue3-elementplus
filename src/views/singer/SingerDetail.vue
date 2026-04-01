<template>
  <div class="singer-detail-container" v-if="singerInfo">
    <el-container>
      <!-- 左侧歌手信息 -->
      <el-aside class="singer-slide">
        <el-image class="singer-img" fit="contain" :src="attachImageUrl(singerInfo.pic)" />
        <div class="singer-info">
          <h2>基本资料</h2>
          <ul>
            <li v-if="singerInfo.sex !== undefined">性别：{{ getUserSex(singerInfo.sex) }}</li>
            <li>生日：{{ getBirth(singerInfo.birth) }}</li>
            <li>故乡：{{ singerInfo.location }}</li>
          </ul>
          <div class="singer-intro" v-if="singerInfo.introduction">
            <h3>简介</h3>
            <el-tooltip :content="singerInfo.introduction" placement="top" :disabled="!showTooltip">
              <p class="intro-text" @mouseenter="checkOverflow">{{ singerInfo.introduction }}</p>
            </el-tooltip>
          </div>
        </div>
      </el-aside>

      <!-- 右侧内容区 -->
      <el-main class="singer-main">
        <h1 class="singer-name">{{ singerInfo.name }}</h1>

        <!-- Tab切换 -->
        <el-tabs v-model="activeTab" class="singer-tabs">
          <!-- 专辑Tab -->
          <el-tab-pane label="专辑" name="album">
            <div v-if="!selectedAlbum" class="album-list">
              <div
                class="album-item"
                v-for="album in albumList"
                :key="album.album_id"
                @click="handleSelectAlbum(album)"
              >
                <el-image class="album-cover" fit="contain" :src="attachImageUrl(album.pic || '')" />
                <div class="album-name">{{ album.album || '未知专辑' }}</div>
              </div>
              <el-empty v-if="albumList.length === 0" description="暂无专辑" />
            </div>
            <!-- 专辑歌曲列表 -->
            <div v-else class="album-songs">
              <div class="back-to-album" @click="selectedAlbum = null">
                <el-button type="primary" size="small">返回专辑列表</el-button>
              </div>
              <song-list :songList="albumSongList"></song-list>
            </div>
          </el-tab-pane>

          <!-- 歌曲Tab -->
          <el-tab-pane label="歌曲" name="song">
            <song-list :songList="currentSongList"></song-list>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
  <!-- 加载中状态 -->
  <div class="loading-container" v-else>
    <el-empty description="加载中..." />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import SongList from "@/components/SongList.vue";
import { HttpManager } from "@/api";
import { getBirth } from "@/utils";
import mixin from "@/mixins/mixin";

const store = useStore();
const route = useRoute();
const router = useRouter();
const { getUserSex } = mixin();

// 控制 tooltip 是否启用（文本超出时才启用）
const showTooltip = ref(false);

// 检查文本是否超出
function checkOverflow(e: MouseEvent) {
  const el = e.target as HTMLElement;
  showTooltip.value = el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
}

// 歌手信息
const singerInfo = computed(() => store.getters.songDetails) as any;

// Tab
const activeTab = ref("album");

// 专辑列表（从接口返回按专辑分组的数据）
const albumList = ref<any[]>([]);

// 选中的专辑
const selectedAlbum = ref(null);

// 专辑歌曲列表
const albumSongList = ref<any[]>([]);

// 歌手歌曲列表（所有专辑的歌曲合并）
const currentSongList = ref<any[]>([]);

// 点击选择专辑
function handleSelectAlbum(album: any) {
  selectedAlbum.value = album;
  albumSongList.value = album.songs || [];
}

// 获取歌手信息（刷新页面时从 API 获取）
async function fetchSingerInfo() {
  const singerId = route.params.id as string;
  if (!singerId) {
    router.push("/singer");
    return;
  }

  try {
    const result = (await HttpManager.getAllSinger()) as ResponseBody;
    const singers = result.data || [];
    const singer = singers.find((s: any) => s.id === parseInt(singerId));
    if (singer) {
      store.commit("setSongDetails", singer);
    } else {
      router.push("/singer");
    }
  } catch (error) {
    console.error("获取歌手信息失败:", error);
    router.push("/singer");
  }
}

// 获取歌手歌曲（按专辑分组）
async function getSingerSongs() {
  if (!singerInfo.value?.id) return;

  try {
    const result = (await HttpManager.getSongOfSingerId(singerInfo.value.id)) as ResponseBody;
    const data = result.data || [];

    // 兼容两种格式：1. 后端已分组 {album, songs[]}  2. 后端未分组 [歌曲列表]
    const albumMap = new Map<string, any>();
    const allSongs: any[] = [];

    data.forEach((item: any) => {
      // 检查是否是已分组的格式（有songs字段）
      if (item.songs && Array.isArray(item.songs)) {
        // 后端已分组
        if (!albumMap.has(item.album)) {
          albumMap.set(item.album, { album_id: item.album_id, album: item.album, songs: [] });
        }
        albumMap.get(item.album).songs.push(...item.songs);
        allSongs.push(...item.songs);
      } else {
        // 后端未分组，需要前端按album字段分组
        const albumName = item.album || '未知专辑';
        if (!albumMap.has(albumName)) {
          albumMap.set(albumName, { album_id: item.album_id, album: albumName, songs: [] });
        }
        albumMap.get(albumName).songs.push(item);
        allSongs.push(item);
      }
    });

    albumList.value = Array.from(albumMap.values());
    currentSongList.value = allSongs;
  } catch (error) {
    console.error("获取歌手歌曲失败:", error);
    albumList.value = [];
    currentSongList.value = [];
  }
}

onMounted(async () => {
  // 如果 store 中没有歌手信息，从 API 获取
  if (!singerInfo.value) {
    await fetchSingerInfo();
  }
  // 获取歌手歌曲
  getSingerSongs();
});

const attachImageUrl = HttpManager.attachImageUrl;
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";

.singer-detail-container {
  min-height: 500px;
}

.singer-slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  width: 300px !important;

  .singer-img {
    width: 250px;
    height: 250px;
    border-radius: 10%;
  }

  .singer-info {
    width: 80%;
    padding-top: 2rem;

    h2 {
      margin-bottom: 1rem;
      font-size: 18px;
    }

    li {
      width: 100%;
      height: 30px;
      line-height: 30px;
      color: #666;
    }
  }

  .singer-intro {
    width: 80%;
    padding-top: 1rem;

    h3 {
      margin-bottom: 0.5rem;
      font-size: 16px;
      color: #333;
    }

    .intro-text {
      font-size: 14px;
      color: #666;
      line-height: 1.5;
      max-height: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 6;
      cursor: default;
    }
  }
}

.singer-main {
  padding-right: 20px;

  .singer-name {
    font-size: 28px;
    margin-bottom: 20px;
  }

  .singer-tabs {
    :deep(.el-tabs__content) {
      overflow: visible;
    }
  }
}

.album-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;

  .album-item {
    width: 150px;
    cursor: pointer;

    .album-cover {
      width: 150px;
      height: 150px;
      border-radius: 8px;
      background: #f5f5f5;
    }

    .album-name {
      margin-top: 8px;
      text-align: center;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:hover .album-name {
      color: $color-black;
    }
  }
}

.album-songs {
  .back-to-album {
    margin-bottom: 15px;
  }
}

@media screen and (max-width: 768px) {
  .singer-slide {
    display: none;
  }

  .singer-main {
    padding-right: 0;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
