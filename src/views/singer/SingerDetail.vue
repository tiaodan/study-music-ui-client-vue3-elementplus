<template>
  <div class="singer-detail-container" v-if="singerInfo">
    <el-container>
      <!-- 左侧歌手信息 -->
      <el-aside class="singer-slide">
        <el-image class="singer-img" fit="contain" :src="attachImageUrl(singerInfo.pic)" lazy>
          <template #error>
            <div class="singer-img-placeholder">
              <svg viewBox="0 0 24 24" fill="currentColor" width="80" height="80">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          </template>
        </el-image>
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
            <!-- 加载动画 -->
            <div class="loading-container" v-if="albumLoading">
              <div class="loading-spinner"></div>
              <span class="loading-text">加载中...</span>
            </div>
            <div v-else-if="!selectedAlbum" class="album-list">
              <div
                class="album-item"
                v-for="album in albumList"
                :key="album.id || album.album_id"
                @click="handleSelectAlbum(album)"
              >
                <el-image class="album-cover" fit="contain" :src="attachImageUrl(album.pic)" lazy>
                <template #error>
                  <div class="album-cover-placeholder">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                </template>
              </el-image>
                <div class="album-name">{{ album.title || album.name || album.album || '未知专辑' }}</div>
              </div>
              <el-empty v-if="albumList.length === 0" description="暂无专辑" />
            </div>
            <!-- 专辑歌曲列表 -->
            <div v-else class="album-songs">
              <div class="back-to-album" @click="selectedAlbum = null">
                <el-button type="primary" size="small">返回专辑列表</el-button>
              </div>
              <!-- 专辑详情加载状态 -->
              <div class="loading-container" v-if="albumDetailLoading">
                <div class="loading-spinner"></div>
                <span class="loading-text">加载中...</span>
              </div>
              <song-list v-else :songList="albumSongList"></song-list>
            </div>
          </el-tab-pane>

          <!-- 歌曲Tab -->
          <el-tab-pane label="歌曲" name="song">
            <div class="loading-container" v-if="songLoading">
              <div class="loading-spinner"></div>
              <span class="loading-text">加载中...</span>
            </div>
            <song-list v-else :songList="currentSongList"></song-list>
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
import { ref, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import SongList from "@/components/SongList.vue";
import { HttpManager } from "@/api";
import { getBirth } from "@/utils";
import mixin from "@/mixins/mixin";
import {
  getSingerDetail,
  getSingerAlbums,
  getAlbumDetail,
  getSingerSongs
} from "@/utils/cache";

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
const singerInfo = ref<any>(null);

// Tab
const activeTab = ref("album");

// 专辑列表
const albumList = ref<any[]>([]);

// 专辑加载状态
const albumLoading = ref(false);

// 歌曲加载状态
const songLoading = ref(false);

// 选中的专辑
const selectedAlbum = ref<any>(null);

// 专辑歌曲列表
const albumSongList = ref<any[]>([]);

// 专辑详情加载状态
const albumDetailLoading = ref(false);

// 歌手歌曲列表（所有歌曲）
const currentSongList = ref<any[]>([]);

// 是否已加载歌曲数据
const songsDataLoaded = ref(false);

// 点击选择专辑 - 加载专辑歌曲
async function handleSelectAlbum(album: any) {
  selectedAlbum.value = album;
  albumDetailLoading.value = true;

  // 兼容多种ID字段名
  const albumId = album.id || album.album_id;

  try {
    // 从缓存或API获取专辑详情
    const albumDetail = await getAlbumDetail(albumId);
    if (albumDetail) {
      // API返回的data直接就是歌曲数组
      albumSongList.value = Array.isArray(albumDetail) ? albumDetail : (albumDetail.songs || []);
    } else {
      albumSongList.value = [];
    }
  } catch (error) {
    console.error("获取专辑详情失败:", error);
    albumSongList.value = [];
  } finally {
    albumDetailLoading.value = false;
  }
}

// 获取歌手信息
async function fetchSingerInfo() {
  const singerId = route.params.id as string;
  if (!singerId) {
    router.push("/singer");
    return;
  }

  try {
    // 先从 store 获取
    const storeSinger = store.getters.songDetails;
    if (storeSinger && storeSinger.id === parseInt(singerId)) {
      singerInfo.value = storeSinger;
      return;
    }

    // 从缓存或API获取
    const singer = await getSingerDetail(parseInt(singerId));
    if (singer) {
      singerInfo.value = singer;
      store.commit("setSongDetails", singer);
    } else {
      router.push("/singer");
    }
  } catch (error) {
    console.error("获取歌手信息失败:", error);
    router.push("/singer");
  }
}

// 加载专辑列表
async function loadAlbumList() {
  if (!singerInfo.value?.id) return;

  albumLoading.value = true;
  try {
    albumList.value = await getSingerAlbums(singerInfo.value.id);
  } catch (error) {
    console.error("获取专辑列表失败:", error);
    albumList.value = [];
  } finally {
    albumLoading.value = false;
  }
}

// 加载歌手所有歌曲（歌曲tab）
async function loadSongList() {
  if (!singerInfo.value?.id || songsDataLoaded.value) return;

  songLoading.value = true;
  try {
    currentSongList.value = await getSingerSongs(singerInfo.value.id);
    songsDataLoaded.value = true;
  } catch (error) {
    console.error("获取歌曲列表失败:", error);
    currentSongList.value = [];
  } finally {
    songLoading.value = false;
  }
}

// Tab切换时按需加载
watch(activeTab, (newTab) => {
  if (newTab === "song") {
    loadSongList();
  }
});

onMounted(async () => {
  await fetchSingerInfo();
  // 进入页面自动加载专辑列表
  loadAlbumList();
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

    .singer-img-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f093fb 0%, #f5af19 100%);
      border-radius: 10%;
      color: rgba(255,255,255,0.9);

      svg {
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
      }
    }
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

      .album-cover-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #f093fb 0%, #f5af19 100%);
        border-radius: 8px;
        color: rgba(255,255,255,0.9);

        svg {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }
      }
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid $color-blue;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 10px;
  color: #666;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
