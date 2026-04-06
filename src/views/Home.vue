<template>
  <div class="home-container">
    <!-- 轮播图 -->
    <div class="banner-container">
      <el-carousel height="300px" :interval="5000" arrow="hover" indicator-position="outside">
        <!-- Native Banner 广告位 -->
        <el-carousel-item v-if="nativeAdEnabled">
          <div class="native-ad-banner">
            <!--  adsterra 厂商 - Native Banner -->
            <div id="container-33504a55d512c8d06b36725c53f22bd1"></div>
          </div>
        </el-carousel-item>
        <!-- Banner 列表 -->
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
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import PlayList from "@/components/PlayList.vue";
import { NavName } from "@/enums";
import { HttpManager } from "@/api";
import mixin from "@/mixins/mixin";
import { getBannerList } from "@/utils/cache";

const songList = ref<any[]>([]);
const bannerList = ref<any[]>([
  { pic: '' }, // 默认占位广告位
  { pic: '' },
  { pic: '' },
]);
const nativeAdEnabled = ref(false);
const { changeIndex } = mixin();
const attachImageUrl = HttpManager.attachImageUrl;

// 点击Banner
function handleBannerClick(item: any) {
  if (item.url) {
    window.open(item.url, '_blank');
  }
}

// 加载 Native Banner 广告脚本 - adsterra - Native Banner
function loadNativeAd() {
  const script = document.createElement('script');
  script.async = true;
  script.setAttribute('data-cfasync', 'false');
  script.src = 'https://pl29066002.profitablecpmratenetwork.com/33504a55d512c8d06b36725c53f22bd1/invoke.js';
  document.body.appendChild(script);
}

onMounted(async () => {
  changeIndex(NavName.Home);

  // 加载广告配置
  try {
    const response = await fetch('/config/ad.config.json');
    const adConfig = await response.json();
    if (adConfig.nativeBanner?.enabled) {
      nativeAdEnabled.value = true;
      loadNativeAd();
    }
  } catch (e) {
    console.warn('加载广告配置失败:', e);
  }

  // 获取Banner列表
  try {
    const banners = await getBannerList();
    if (banners.length) {
      bannerList.value = banners;
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

  // 左右切换按钮更明显
  :deep(.el-carousel__arrow) {
    width: 44px;
    height: 44px;
    font-size: 18px;
    background-color: rgba(255, 255, 255, 0.9);
    color: #333;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

    &:hover {
      background-color: #fff;
    }
  }

  // 底部指示器更明显
  :deep(.el-carousel__indicators) {
    .el-carousel__indicator {
      .el-carousel__button {
        width: 24px;
        height: 4px;
        border-radius: 2px;
        background-color: rgba(0, 0, 0, 0.3);
      }

      &.is-active .el-carousel__button {
        width: 32px;
        background-color: $color-blue;
      }
    }
  }

  .native-ad-banner {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
  }

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
</style>
