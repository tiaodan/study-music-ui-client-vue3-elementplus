<template>
  <div class="recommend-container">
    <el-container>
      <!-- 左侧榜单列表 -->
      <el-aside class="rank-slide">
        <h2 class="rank-title">热门榜单</h2>
        <div class="rank-list" v-if="loading">
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <span class="loading-text">加载中...</span>
          </div>
        </div>
        <div class="rank-list" v-else>
          <div
            v-for="rank in allRankList"
            :key="rank.key"
            class="rank-item"
            :class="{ active: selectedRank?.key === rank.key }"
            @click="handleSelectRank(rank)"
          >
            <div class="rank-cover-placeholder">
              <span>{{ rank.rankName?.charAt(0) || '榜' }}</span>
            </div>
            <div class="rank-info">
              <div class="rank-name">{{ rank.displayName }}</div>
              <div class="rank-desc">{{ rank.websiteName }}</div>
            </div>
          </div>
          <el-empty v-if="allRankList.length === 0" description="暂无榜单" />
        </div>
      </el-aside>

      <!-- 右侧歌曲列表 -->
      <el-main class="rank-main">
        <div v-if="selectedRank">
          <div class="rank-header">
            <h1 class="rank-name-title">{{ selectedRank.displayName }}</h1>
          </div>

          <!-- 加载动画 -->
          <div class="loading-container" v-if="songLoading">
            <div class="loading-spinner"></div>
            <span class="loading-text">加载中...</span>
          </div>

          <!-- 歌曲列表 -->
          <song-list v-else :songList="currentSongList"></song-list>
        </div>

        <!-- 未选择榜单时的提示 -->
        <div v-else class="empty-rank">
          <el-empty description="请从左侧选择一个榜单" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import SongList from "@/components/SongList.vue";
import { HttpManager } from "@/api";
import { getRankDetail } from "@/utils/cache";
import mixin from "@/mixins/mixin";
import { NavName } from "@/enums";

const { changeIndex } = mixin();

// 网站ID映射
const WEBSITE_MAP = {
  1: { name: 'QQ音乐', code: 'qq' },
  2: { name: '酷狗', code: 'kugou' },
  3: { name: '酷我', code: 'kuwo' },
  4: { name: '网易云', code: 'netease' },
  5: { name: '咪咕', code: 'migu' },
};

// 榜单列表（从后端获取，去重）
const allRankList = ref<any[]>([]);
// 选中的榜单
const selectedRank = ref<any>(null);
// 歌曲列表
const currentSongList = ref<any[]>([]);
// 加载状态
const loading = ref(false);
const songLoading = ref(false);

const attachImageUrl = HttpManager.attachImageUrl;

// 选择榜单
async function handleSelectRank(rank: any) {
  selectedRank.value = rank;
  songLoading.value = true;
  currentSongList.value = [];

  try {
    const songs = await getRankDetail(rank.websiteId, rank.rankName);
    currentSongList.value = songs;
  } catch (error) {
    console.error("获取榜单歌曲失败:", error);
    currentSongList.value = [];
  } finally {
    songLoading.value = false;
  }
}

// 加载榜单列表（从所有网站获取，提取唯一的榜单名）
async function loadRankList() {
  loading.value = true;
  allRankList.value = [];

  // 查询所有网站的榜单
  const websiteIds = [1, 2, 3, 4, 5];

  try {
    const results = await Promise.all(
      websiteIds.map(async (websiteId) => {
        try {
          const res = await HttpManager.getRankList(websiteId) as any;
          if (res.success && res.data && res.data.length > 0) {
            // 提取唯一的榜单名（去重）
            const uniqueRanks: Record<string, any> = {};
            res.data.forEach((item: any) => {
              const rankName = item.name;
              if (!uniqueRanks[rankName]) {
                uniqueRanks[rankName] = {
                  key: `${websiteId}_${rankName}`,
                  websiteId,
                  rankName,
                  websiteName: WEBSITE_MAP[websiteId]?.name || '未知',
                  displayName: `${WEBSITE_MAP[websiteId]?.name || ''} ${rankName}`,
                };
              }
            });
            return Object.values(uniqueRanks);
          }
          return [];
        } catch (e) {
          return [];
        }
      })
    );

    // 合并所有榜单
    allRankList.value = results.flat();

    // 默认选中第一个榜单
    if (allRankList.value.length > 0) {
      handleSelectRank(allRankList.value[0]);
    }
  } catch (error) {
    console.error("获取榜单列表失败:", error);
    allRankList.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  changeIndex(NavName.Recommend);
  loadRankList();
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";

.recommend-container {
  min-height: 500px;
}

.rank-slide {
  width: 280px !important;
  background: #fff;
  border-radius: 8px;
  margin-right: 20px;
  padding: 15px;

  .rank-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid $color-blue;
  }

  .rank-list {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }

  .rank-item {
    display: flex;
    align-items: center;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: #f5f7fa;
    }

    &.active {
      background: #ecf5ff;
      border: 1px solid $color-blue;
    }

    .rank-cover-placeholder {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      font-size: 24px;
      font-weight: bold;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .rank-info {
      flex: 1;
      margin-left: 12px;
      overflow: hidden;

      .rank-name {
        font-size: 14px;
        font-weight: 500;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .rank-desc {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

.rank-main {
  background: #fff;
  border-radius: 8px;
  padding: 20px;

  .rank-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .rank-name-title {
      font-size: 24px;
      font-weight: 600;
    }

    .rank-update-time {
      font-size: 14px;
      color: #999;
    }
  }
}

.empty-rank {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media screen and (max-width: 768px) {
  .rank-slide {
    display: none;
  }
}
</style>