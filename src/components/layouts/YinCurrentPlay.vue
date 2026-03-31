<template>
  <transition name="aside-fade">
    <div class="yin-current-play" v-if="showAside" @click.stop>
      <div class="header">
        <h2 class="title">当前播放</h2>
        <span class="clear-btn" @click.stop="clearPlayList" v-if="currentPlayList && currentPlayList.length > 0">清空</span>
      </div>
      <div class="control">共 {{ (currentPlayList && currentPlayList.length) || 0 }} 首</div>
      <ul class="menus" v-if="currentPlayList && currentPlayList.length > 0">
        <li
          v-for="(item, index) in currentPlayList"
          :class="{ 'is-play': songId === item.id }"
          :key="index"
          @click.stop
        >
          <span
            class="song-name"
            :style="{ color: songId === item.id ? '#000000' : '#333333' }"
            @click.stop="playSong(item, index)"
          >
            {{ item.name ? getSongTitle(item.name) : '未知歌曲' }}
          </span>
          <span class="delete-btn" @click.stop="removeSong(index)">×</span>
        </li>
      </ul>
      <div class="empty-tip" v-else>暂无播放歌曲</div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, computed, onMounted } from "vue";
import { useStore } from "vuex";
import mixin from "@/mixins/mixin";

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const { getSongTitle } = mixin();

    const songId = computed(() => store.getters.songId);
    const currentPlayList = computed(() => store.getters.currentPlayList);
    const showAside = computed(() => store.getters.showAside);

    // 播放指定歌曲
    function playSong(item: any, index: number) {
      store.dispatch("playMusic", {
        id: item.id,
        url: item.url,
        pic: item.pic,
        index: index,
        songTitle: getSongTitle(item.name),
        singerName: item.name ? item.name.split("-")[0] : "",
        lyric: item.lyric,
        currentSongList: currentPlayList.value,
      });
    }

    // 删除单首歌曲
    function removeSong(index: number) {
      const list = [...currentPlayList.value];
      const removedSong = list.splice(index, 1)[0];
      store.commit("setCurrentPlayList", list);

      // 如果删除的是当前播放的歌曲，切换到下一首
      if (removedSong && removedSong.id === songId.value) {
        if (list.length > 0) {
          const newIndex = Math.min(index, list.length - 1);
          playSong(list[newIndex], newIndex);
        } else {
          store.commit("setIsPlay", false);
          store.commit("setSongId", "");
          store.commit("setSongUrl", "");
        }
      } else if (index < store.getters.currentPlayIndex) {
        // 如果删除的歌曲在当前播放歌曲之前，更新索引
        store.commit("setCurrentPlayIndex", store.getters.currentPlayIndex - 1);
      }
    }

    // 清空播放列表
    function clearPlayList() {
      store.commit("setCurrentPlayList", []);
      store.commit("setIsPlay", false);
      store.commit("setSongId", "");
      store.commit("setSongUrl", "");
      store.commit("setCurrentPlayIndex", -1);
    }

    onMounted(() => {
      // 使用冒泡阶段，这样 @click.stop 可以阻止
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const popup = document.querySelector('.yin-current-play');
        // 只有点击弹窗外部才关闭
        if (popup && !popup.contains(target)) {
          proxy.$store.commit('setShowAside', false);
        }
      });
    })

    return {
      songId,
      currentPlayList,
      showAside,
      getSongTitle,
      playSong,
      removeSong,
      clearPlayList,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/yin-current-play.scss";
</style>
