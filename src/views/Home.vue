<template>
  <div class="home-container">
    <!-- 轮播图广告 -->
    <div class="banner-container">
      <el-carousel height="300px" :interval="5000" arrow="hover" indicator-position="outside">
        <el-carousel-item v-for="(item, index) in bannerList" :key="index">
          <div class="banner-item" @click="handleBannerClick(item)">
            <el-image
              :src="attachImageUrl(item.pic)"
              fit="cover"
              class="banner-image"
              lazy
            >
              <template #error>
                <div class="banner-placeholder">
                  <span>广告位 {{ index + 1 }}</span>
                </div>
              </template>
            </el-image>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 推荐歌单 -->
    <div class="section" v-if="songList.length">
      <h2 class="section-title">推荐歌单</h2>
      <play-list :songList="songList"></play-list>
    </div>

    <!-- 推荐歌手 -->
    <div class="section" v-if="singerList.length">
      <h2 class="section-title">推荐歌手</h2>
      <div class="singer-grid">
        <div
          class="singer-card"
          v-for="singer in singerList"
          :key="singer.id"
          @click="goSingerDetail(singer.id)"
        >
          <el-image
            class="singer-avatar"
            :src="attachImageUrl(singer.pic)"
            fit="cover"
            lazy
          >
            <template #error>
              <div class="singer-placeholder">
                <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
            </template>
          </el-image>
          <div class="singer-name">{{ singer.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import PlayList from "@/components/PlayList.vue";
import { NavName } from "@/enums";
import { HttpManager } from "@/api";
import mixin from "@/mixins/mixin";

const router = useRouter();
const songList = ref<any[]>([]);
const singerList = ref<any[]>([]);
const bannerList = ref<any[]>([
  { pic: '' }, // 默认占位广告位
  { pic: '' },
  { pic: '' },
]);
const { changeIndex } = mixin();
const attachImageUrl = HttpManager.attachImageUrl;

// 点击Banner
function handleBannerClick(item: any) {
  if (item.url) {
    window.open(item.url, '_blank');
  }
}

// 跳转歌手详情
function goSingerDetail(id: number) {
  router.push(`/singer-detail/${id}`);
}

onMounted(async () => {
  changeIndex(NavName.Home);

  // 获取Banner列表
  try {
    const bannerRes = await HttpManager.getBannerList() as any;
    if (bannerRes.success && bannerRes.data?.length) {
      bannerList.value = bannerRes.data;
    }
  } catch (e) {
    console.error('获取Banner失败:', e);
  }

  // 获取歌单列表
  try {
    const songRes = await HttpManager.getSongList() as any;
    if (songRes.success && songRes.data) {
      songList.value = songRes.data.slice(0, 10);
    }
  } catch (e) {
    console.error('获取歌单失败:', e);
  }

  // 获取歌手列表
  try {
    const singerRes = await HttpManager.getAllSinger() as any;
    if (singerRes.success && singerRes.data) {
      singerList.value = singerRes.data.slice(0, 10);
    }
  } catch (e) {
    console.error('获取歌手失败:', e);
  }
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";

.home-container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
}

.banner-container {
  margin-bottom: 30px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .banner-item {
    cursor: pointer;
    height: 100%;
  }

  .banner-image {
    width: 100%;
    height: 100%;
  }

  .banner-placeholder {
    width: 100%;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f093fb 0%, #f5af19 100%);
    color: rgba(255, 255, 255, 0.9);
    font-size: 24px;
    font-weight: bold;
  }
}

.section {
  margin-bottom: 40px;

  .section-title {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 20px;
    padding-left: 10px;
    border-left: 4px solid $color-blue;
  }
}

.singer-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;

  .singer-card {
    text-align: center;
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-5px);
    }

    .singer-avatar {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      margin-bottom: 10px;
    }

    .singer-placeholder {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f093fb 0%, #f5af19 100%);
      color: rgba(255, 255, 255, 0.9);
      margin: 0 auto 10px;
    }

    .singer-name {
      font-size: 14px;
      color: #333;
    }
  }
}

@media screen and (max-width: 768px) {
  .singer-grid {
    grid-template-columns: repeat(3, 1fr);

    .singer-avatar,
    .singer-placeholder {
      width: 100px;
      height: 100px;
    }
  }
}
</style>
