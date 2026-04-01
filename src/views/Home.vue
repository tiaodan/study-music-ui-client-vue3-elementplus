<template>
  <div class="home-container">
    <!-- 广告位 -->
    <div class="ad-container">
      <div id="propeller-ad-banner"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";

import PlayList from "@/components/PlayList.vue";
import {  NavName } from "@/enums";
import { HttpManager } from "@/api";
import mixin from "@/mixins/mixin";

const songList = ref([]); // 歌单列表
const singerList = ref([]); // 歌手列表
const swiperList = ref([]);// 轮播图 每次都在进行查询
const { changeIndex } = mixin();
try {

  HttpManager.getBannerList().then((res) => {
    swiperList.value = (res as ResponseBody).data.sort();
  });

  HttpManager.getSongList().then((res) => {
    songList.value = (res as ResponseBody).data.sort().slice(0, 10);
  });

  HttpManager.getAllSinger().then((res) => {
    singerList.value = (res as ResponseBody).data.sort().slice(0, 10);
  });

  onMounted(() => {
    changeIndex(NavName.Home);
    // 加载 PropellerAds 广告
    loadPropellerAds();
  });

// 加载 PropellerAds 广告脚本
const loadPropellerAds = () => {
  // TODO: 替换为你的 PropellerAds Zone ID（注册后在广告位设置中获取）
  const ZONE_ID = 'YOUR_ZONE_ID'; // 例如: '1234567'

  if (ZONE_ID === 'YOUR_ZONE_ID') {
    console.log('请先配置 PropellerAds Zone ID');
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://propellerads.com/scripts/ad.js';
  script.setAttribute('data-zone', ZONE_ID);
  script.setAttribute('data-banner', 'banner');
  script.async = true;
  document.getElementById('propeller-ad-banner')?.appendChild(script);
}
} catch (error) {
  console.error(error);
}
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";

.home-container {
  width: 90%;
  margin: auto;
  padding-top: 20px;
}

.ad-container {
  width: 100%;
  min-height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
}

/*轮播图*/
.swiper-container {
  width: 90%;
  margin: auto;
  padding-top: 20px;
  img {
    width: 100%;
  }
}

.swiper-container:deep(.el-carousel__indicators.el-carousel__indicators--outside) {
  display: inline-block;
  transform: translateX(30vw);
}

.el-slider__runway {
  background-color: $color-blue;
}
</style>
