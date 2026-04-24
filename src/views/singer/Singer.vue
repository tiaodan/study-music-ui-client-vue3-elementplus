<template>
  <div class="singer-container">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <!-- 地区筛选 -->
      <div class="filter-section">
        <span class="filter-label">地区：</span>
        <el-radio-group v-model="area" size="small" @change="handleFilterChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="内地">内地</el-radio-button>
          <el-radio-button label="港台">港台</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 性别筛选 -->
      <div class="filter-section">
        <span class="filter-label">性别：</span>
        <el-radio-group v-model="sex" size="small" @change="handleFilterChange">
          <el-radio-button label="-1">全部</el-radio-button>
          <el-radio-button label="1">男</el-radio-button>
          <el-radio-button label="0">女</el-radio-button>
          <el-radio-button label="2">组合</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 字母筛选 -->
      <div class="filter-section">
        <span class="filter-label">字母：</span>
        <el-radio-group v-model="initial" size="small" @change="handleFilterChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button
            v-for="letter in letters"
            :key="letter"
            :label="letter"
          >{{ letter }}</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 测试按钮：调用原接口 -->
      <div class="filter-section">
        <el-button type="primary" @click="handleOriginalApi">测试(原接口)</el-button>
      </div>
    </div>

    <!-- 歌手列表 -->
    <play-list :playList="data" path="singer-detail"></play-list>

    <!-- 分页 -->
    <el-pagination
      class="pagination"
      background
      layout="total, prev, pager, next"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="allPlayList.length"
      @current-change="handleCurrentChange"
    >
    </el-pagination>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import PlayList from "@/components/PlayList.vue";
import { HttpManager } from "@/api";
import { getSingerList as getSingerListCache } from "@/utils/cache";

// 筛选条件
const area = ref(""); // 地区：全部、内地、港台
const sex = ref("-1"); // 性别：-1全部、1男、0女、2组合
const initial = ref(""); // 字母：全部、A-Z

// 字母列表
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// 分页
const pageSize = ref(15);
const currentPage = ref(1);
const allPlayList = ref([]);

// 计算当前页数据
const data = computed(() => {
  return allPlayList.value.slice(
    (currentPage.value - 1) * pageSize.value,
    currentPage.value * pageSize.value
  );
});

// 筛选条件变化
function handleFilterChange() {
  currentPage.value = 1;
  getSingerList();
}

// 获取歌手列表
async function getSingerList() {
  try {
    // 如果地区、性别、字母都为空或-1，调用缓存函数
    if ((!area.value || area.value === "-1") && sex.value === "-1" && !initial.value) {
      const singers = await getSingerListCache();
      allPlayList.value = singers || [];
      return;
    }

    const areaValue = area.value === "内地" ? "0" : area.value === "港台" ? "1" : "";
    const sexValue = sex.value;
    const initialValue = initial.value;

    const result = (await HttpManager.getSingerByCondition(
      areaValue,
      sexValue,
      initialValue
    )) as ResponseBody;
    allPlayList.value = result.data || [];
  } catch (error) {
    console.error("获取歌手列表失败:", error);
    allPlayList.value = [];
  }
}

// 测试按钮：调用原接口
async function handleOriginalApi() {
  try {
    // 性别为-1或空时使用缓存函数，否则调用getSingerOfSex
    if (sex.value === "-1" || !sex.value) {
      const singers = await getSingerListCache();
      allPlayList.value = singers || [];
    } else {
      const result = (await HttpManager.getSingerOfSex(sex.value)) as ResponseBody;
      allPlayList.value = result.data || [];
    }
    currentPage.value = 1;
  } catch (error) {
    console.error("调用原接口失败:", error);
  }
}

// 获取当前页
function handleCurrentChange(val: number) {
  currentPage.value = val;
}

// 页面加载时获取数据
onMounted(() => {
  getSingerList();
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";

.singer-container {
  padding: 20px;
}

.filter-bar {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;

  .filter-section {
    display: flex;
    align-items: center;
    margin-bottom: 15px;

    &:last-child {
      margin-bottom: 0;
    }

    .filter-label {
      width: 50px;
      font-size: 14px;
      color: #333;
    }

    :deep(.el-radio-group) {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
