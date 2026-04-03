<template>
  <el-container>
    <el-header>
      <yin-header></yin-header>
    </el-header>
    <el-main>
      <router-view />
      <yin-current-play></yin-current-play>
      <yin-play-bar></yin-play-bar>
      <yin-scroll-top></yin-scroll-top>
      <yin-audio></yin-audio>
    </el-main>
    <el-footer>
      <yin-footer></yin-footer>
    </el-footer>
  </el-container>
</template>

<script lang="ts" setup>
import { getCurrentInstance } from "vue";
import YinHeader from "@/components/layouts/YinHeader.vue";
import YinCurrentPlay from "@/components/layouts/YinCurrentPlay.vue";
import YinPlayBar from "@/components/layouts/YinPlayBar.vue";
import YinScrollTop from "@/components/layouts/YinScrollTop.vue";
import YinFooter from "@/components/layouts/YinFooter.vue";
import YinAudio from "@/components/layouts/YinAudio.vue";

const { proxy } = getCurrentInstance();

const STORAGE_KEY = "music_player_state"; // localStorage key

// 恢复状态（从 localStorage 永久缓存）
try {
  const savedState = localStorage.getItem(STORAGE_KEY);
  if (savedState) {
    const parsedState = JSON.parse(savedState);
    proxy.$store.replaceState(Object.assign({}, proxy.$store.state, parsedState));
  }
} catch (error) {
  console.error("恢复状态失败:", error);
  // 清除损坏的数据
  localStorage.removeItem(STORAGE_KEY);
}

// 保存状态（永久缓存到 localStorage）
window.addEventListener("beforeunload", () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proxy.$store.state));
  } catch (error) {
    console.error("保存状态失败:", error);
  }
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";
@import "@/assets/css/global.scss";

.el-container {
  min-height: calc(100% - 60px);
}
.el-header {
  padding: 0;
}
.el-main {
  padding-left: 0;
  padding-right: 0;
}
</style>
