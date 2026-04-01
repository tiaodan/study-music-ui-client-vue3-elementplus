<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">404</div>
      <div class="error-text">页面不存在</div>
      <el-button type="primary" @click="goBack">返回上一页</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";

const router = useRouter();

function goBack() {
  router.go(-1);
}
</script>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  background-color: #f5f5f5;
}

.error-content {
  text-align: center;
}

.error-code {
  font-size: 150px;
  font-weight: bolder;
  color: #333;
  line-height: 1;
}

.error-text {
  font-size: 24px;
  color: #666;
  margin: 20px 0 30px;
}
</style>
