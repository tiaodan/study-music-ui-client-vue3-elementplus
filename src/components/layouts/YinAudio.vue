<template>
  <audio
    :src="songUrl"
    controls="controls"
    :ref="player"
    preload="true"
    @canplay="canplay"
    @timeupdate="timeupdate"
    @ended="ended"
    :loop="playMode === 1"
  >
  </audio>
</template>

<script lang="ts">
import { defineComponent, ref, getCurrentInstance, computed, watch } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const divRef = ref<HTMLAudioElement>();
    const player = (el) => {
      divRef.value = el;
    };

    const songUrl = computed(() => store.getters.songUrl);
    const isPlay = computed(() => store.getters.isPlay);
    const volume = computed(() => store.getters.volume);
    const changeTime = computed(() => store.getters.changeTime);
    const autoNext = computed(() => store.getters.autoNext);
    const playMode = computed(() => store.getters.playMode); // 0=列表循环, 1=单曲循环, 2=随机

    // 监听歌曲 URL 变化，开始加载
    watch(songUrl, () => {
      if (songUrl.value) {
        proxy.$store.commit("setIsLoading", true);
      }
    });

    // 监听播放还是暂停
    watch(isPlay, () => {
      if (divRef.value) togglePlay();
    });
    // 跳到指定时刻播放
    watch(changeTime, (newTime) => {
      if (!divRef.value) return;
      divRef.value.currentTime = newTime;
    });
    watch(volume, (value) => {
      if (divRef.value) divRef.value.volume = value;
    });

    // 开始 / 暂停
    function togglePlay() {
      if (!divRef.value) return;
      isPlay.value ? divRef.value.play() : divRef.value.pause();
    }

    // 获取歌曲链接后准备播放
    function canplay() {
      if (!divRef.value) return;
      proxy.$store.commit("setDuration", divRef.value.duration);
      // 加载完成，关闭加载提示
      proxy.$store.commit("setIsLoading", false);
      // 自动开始播放
      divRef.value.play();
      proxy.$store.commit("setIsPlay", true);
    }

    // 音乐播放时记录音乐的播放位置
    function timeupdate() {
      if (!divRef.value) return;
      proxy.$store.commit("setCurTime", divRef.value.currentTime);
    }

    // 音乐播放结束时触发（单曲循环时不会触发，因为有 loop 属性）
    function ended() {
      if (!divRef.value) return;
      proxy.$store.commit("setIsPlay", false);
      proxy.$store.commit("setCurTime", 0);
      // 只在非单曲循环模式下触发 autoNext
      if (playMode.value !== 1) {
        proxy.$store.commit("setAutoNext", !autoNext.value);
      }
    }

    return {
      songUrl,
      player,
      canplay,
      timeupdate,
      ended,
      playMode,
    };
  },
});
</script>

<style scoped>
audio {
  display: none;
}
</style>
