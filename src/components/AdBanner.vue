<template>
  <div class="ad-banner-container" v-if="adConfig && adConfig.enabled">
    <div
      class="ad-banner"
      v-for="(provider, index) in adConfig.providers"
      :key="index"
      :style="{ height: provider.height + 'px', width: provider.width + 'px' }"
    >
      <!-- 脚本类型广告：动态加载脚本 -->
      <div v-if="provider.type === 'script'" :id="'ad-' + provider.config.key" ref="adContainer">
      </div>
    </div>
    <!-- 广告加载失败时的占位 -->
    <div v-if="!adLoaded" class="ad-placeholder">
      <span>广告位</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue';

const adConfig = ref<any>(null);
const adLoaded = ref(false);

// 从 /config/ad.config.json 加载配置
async function loadAdConfig() {
  try {
    const response = await fetch('/config/ad.config.json');
    adConfig.value = await response.json();
  } catch (e) {
    console.warn('加载广告配置失败:', e);
  }
}

// 加载脚本类型广告
function loadScriptAd(provider: any) {
  const containerId = 'ad-' + provider.config.key;

  // 创建 atOptions 变量
  const optionsScript = document.createElement('script');
  optionsScript.type = 'text/javascript';
  optionsScript.text = `
    atOptions = {
      'key': '${provider.config.key}',
      'format': 'iframe',
      'height': ${provider.height},
      'width': ${provider.width},
      'params': {}
    };
  `;
  document.head.appendChild(optionsScript);

  // 加载广告脚本
  const adScript = document.createElement('script');
  adScript.src = provider.scriptUrl;
  adScript.async = true;

  const container = document.getElementById(containerId);
  if (container) {
    container.appendChild(adScript);
    adLoaded.value = true;
  }
}

onMounted(async () => {
  await loadAdConfig();

  if (adConfig.value?.enabled && adConfig.value?.providers?.length) {
    await nextTick();
    // 加载所有广告
    adConfig.value.providers.forEach((provider: any) => {
      if (provider.type === 'script') {
        loadScriptAd(provider);
      }
    });
  }
});
</script>

<style lang="scss" scoped>
.ad-banner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px auto;
  max-width: 1200px;
}

.ad-banner {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  border-radius: 4px;
}

.ad-placeholder {
  height: 90px;
  width: 728px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f093fb 0%, #f5af19 100%);
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  border-radius: 4px;
}
</style>