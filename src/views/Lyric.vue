<template>
  <!-- 关闭按钮 -->
  <div class="close-btn" @click="goBack">
    <el-icon><Close /></el-icon>
  </div>
  <div class="song-container">
    <el-image class="song-pic" fit="contain" :src="attachImageUrl(songPic)" />
    <ul class="song-info">
      <li>歌手：{{ singerName }}</li>
      <li>歌曲：{{ songTitle }}</li>
    </ul>
  </div>
  <div class="container">
    <div class="lyric-container">
      <div class="song-lyric">
        <transition-group name="lyric-fade">
          <!--有歌词-->
          <ul :style="{ top: lrcTop }" class="has-lyric" v-if="lyricArr.length" key="has-lyric">
            <li v-for="(item, index) in lyricArr" :key="index">
              {{ item[1] }}
            </li>
          </ul>
          <!--没歌词-->
          <div v-else class="no-lyric" key="no-lyric">
            <span>暂无歌词</span>
          </div>
        </transition-group>
      </div>
      <comment :playId="songId" :type="0"></comment>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { Close } from "@element-plus/icons-vue";
import Comment from "@/components/Comment.vue";
import { parseLyric } from "@/utils";
import { HttpManager } from "@/api";

export default defineComponent({
  components: {
    Comment,
    Close,
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const lrcTop = ref("80px"); // 歌词滑动
    const lyricArr = ref([]); // 当前歌曲的歌词
    const songId = computed(() => store.getters.songId); // 歌曲ID
    const lyric = computed(() => store.getters.lyric); // 歌词
    const currentPlayList = computed(() => store.getters.currentPlayList); // 存放的音乐
    const currentPlayIndex = computed(() => store.getters.currentPlayIndex); // 当前歌曲在歌曲列表的位置
    const curTime = computed(() => store.getters.curTime);
    const songTitle = computed(() => store.getters.songTitle); // 歌名
    const singerName = computed(() => store.getters.singerName); // 歌手名
    const songPic = computed(() => store.getters.songPic); // 歌曲图片
    watch(songId, () => {
      // 安全访问歌词
      if (currentPlayList.value && currentPlayList.value.length > 0 && currentPlayIndex.value >= 0) {
        const song = currentPlayList.value[currentPlayIndex.value];
        if (song && song.lyric) {
          lyricArr.value = parseLyric(song.lyric);
        } else {
          lyricArr.value = [];
        }
      }
    });
    // 处理歌词位置及颜色
    watch(curTime, () => {
      if (lyricArr.value.length !== 0) {
        for (let i = 0; i < lyricArr.value.length; i++) {
          if (curTime.value >= lyricArr.value[i][0]) {
            for (let j = 0; j < lyricArr.value.length; j++) {
              (document.querySelectorAll(".has-lyric li") as NodeListOf<HTMLElement>)[j].style.color = "#000";
              (document.querySelectorAll(".has-lyric li") as NodeListOf<HTMLElement>)[j].style.fontSize = "14px";
            }
            if (i >= 0) {
              lrcTop.value = -i * 30 + 50 + "px";
              (document.querySelectorAll(".has-lyric li") as NodeListOf<HTMLElement>)[i].style.color = "#95d2f6";
              (document.querySelectorAll(".has-lyric li") as NodeListOf<HTMLElement>)[i].style.fontSize = "18px";
            }
          }
        }
      }
    });

    lyricArr.value = lyric.value ? parseLyric(lyric.value) : [];

    // 返回上一页
    function goBack() {
      router.go(-1);
    }

    return {
      songPic,
      singerName,
      songTitle,
      lrcTop,
      lyricArr,
      songId,
      attachImageUrl: HttpManager.attachImageUrl,
      goBack,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";

.close-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  cursor: pointer;
  z-index: 1000;

  .el-icon {
    font-size: 24px;
    color: #fff;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
}

.song-container {
  position: fixed;
  top: 120px;
  left: 50px;
  display: flex;
  flex-direction: column;

  .song-pic {
    height: 300px;
    width: 300px;
    border: 4px solid white;
    border-radius: 12px;
  }

  .song-info {
    width: 300px;
    li {
      width: 100%;
      line-height: 40px;
      font-size: 18px;
      padding-left: 10%;
    }
  }
}

.lyric-container {
  font-family: $font-family;
  .song-lyric {
    position: relative;
    min-height: 300px;
    padding: 30px 0;
    overflow: auto;
    border-radius: 12px;
    background-color: $color-light-grey;
    display: flex;
    justify-content: center;
    .has-lyric {
      position: absolute;
      transition: all 1s;
      li {
        width: 100%;
        height: 40px;
        text-align: center;
        font-size: 14px;
        line-height: 40px;
      }
    }
    .no-lyric {
      position: absolute;
      margin: 100px 0;

      span {
        font-size: 18px;
        text-align: center;
      }
    }
  }
}

.lyric-fade-enter,
.lyric-fade-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

.lyric-fade-enter-active,
.lyric-fade-leave-active {
  transition: all 0.3s ease;
}

@media screen and (min-width: $sm) {
  .container {
    padding-top: 30px;
  }
  .lyric-container {
    margin: 0 150px 0px 400px;
  }
}

@media screen and (max-width: $sm) {
  .container {
    padding: 20px;
  }
  .song-container {
    display: none;
  }
}
</style>
