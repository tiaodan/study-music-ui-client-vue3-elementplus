<template>
  <div class="song-list-container">
    <el-table
      :data="dataList"
      @row-dblclick="handleRowDbClick"
      highlight-current-row
    >
      <el-table-column type="index" label="" width="50" align="center" />
      <el-table-column prop="songName" label="歌曲名" min-width="180" />
      <el-table-column prop="singerName" label="歌手" min-width="120" />
      <el-table-column prop="albumName" label="专辑" min-width="150" />
      <el-table-column prop="duration" label="时长" width="100" align="center" />
      <el-table-column label="操作" width="100" align="center">
        <template #default="scope">
          <div class="action-buttons">
            <yin-icon
              class="action-icon"
              :icon="BOFANG"
              @click.stop="handlePlay(scope.row)"
              title="播放"
            ></yin-icon>
            <yin-icon
              class="action-icon add-icon"
              :icon="TIANJIA"
              @click.stop="handleAddToPlaylist(scope.row)"
              title="添加到歌单"
            ></yin-icon>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import YinIcon from "@/components/layouts/YinIcon.vue";
import { HttpManager } from "@/api";
import { formatSeconds } from "@/utils";
import { Icon } from "@/enums";

const props = defineProps<{
  songList: any[];
  show?: boolean;
}>();

const emit = defineEmits(["changeData"]);

const store = useStore();

// 图标
const BOFANG = Icon.BOFANG;
const TIANJIA = Icon.TIANJIA;

// 处理后的歌曲列表
const dataList = computed(() => {
  const list: any[] = [];
  props.songList.forEach((item: any, index: number) => {
    // 歌曲名：直接用 name，去掉 .mp3 等后缀
    const songName = item.name ? item.name.replace(/\.(mp3|wav|flac|lrc)$/i, "") : "";
    // 歌手：优先用 full_name_singer，没有则用 singer
    const singerName = item.full_name_singer || item.singer || "";
    // 专辑：直接用后端返回的 album 字段
    const albumName = item.album || "";
    // 处理时长：接口返回的可能是 duration 或 time 或其他字段
    let durationStr = "00:00";
    const durationValue = item.duration ?? item.time ?? 0;
    if (durationValue && !isNaN(Number(durationValue))) {
      durationStr = formatSeconds(Number(durationValue));
    }
    list.push({
      ...item,
      songName,
      singerName,
      albumName,
      index,
      duration: durationStr,
    });
  });
  return list;
});

// 双击播放
function handleRowDbClick(row: any) {
  // 统一使用 /capi/song/ 前缀
  const playUrl = `/capi/song/${row.id}`;
  store.dispatch("playSingleSong", {
    id: row.id,
    url: playUrl,
    pic: row.pic,
    songTitle: row.songName,
    singerName: row.singerName,
    lyric: row.lyric,
  });
}

// 点击播放按钮
function handlePlay(row: any) {
  // 统一使用 /capi/song/ 前缀
  const playUrl = `/capi/song/${row.id}`;
  store.dispatch("playSingleSong", {
    id: row.id,
    url: playUrl,
    pic: row.pic,
    songTitle: row.songName,
    singerName: row.singerName,
    lyric: row.lyric,
  });
}

// 点击添加按钮（添加到播放列表末尾）
function handleAddToPlaylist(row: any) {
  const playUrl = `/capi/song/${row.id}.mp3`;
  const currentPlayList = store.getters.currentPlayList;

  // 检查是否已存在
  const existIndex = currentPlayList.findIndex(item => item.id === row.id);
  if (existIndex !== -1) {
    ElMessage.info("歌曲已在播放列表中");
    return;
  }

  // 追加到播放列表
  const newSong = {
    id: row.id,
    url: playUrl,
    pic: row.pic,
    name: row.singerName + "-" + row.songName,
    lyric: row.lyric,
  };
  store.commit("setCurrentPlayList", [...currentPlayList, newSong]);
  ElMessage.success("已添加到播放列表");
}
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";

.song-list-container {
  background: #fff;
  border-radius: 8px;
  padding: 10px;

  :deep(.el-table__row) {
    cursor: pointer;
  }

  :deep(.el-table__row.hover-row) {
    background-color: #f5f7fa !important;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;

    .action-icon {
      width: 20px;
      height: 20px;
      cursor: pointer;
      color: #666;
      transition: all 0.2s;

      &:hover {
        transform: scale(1.2);
        color: #409eff;
      }
    }
  }
}
</style>
