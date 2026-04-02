import { createApp } from "vue";
import ElementPlus from "element-plus";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "element-plus/dist/index.css";
import "./assets/css/index.scss";
import "./assets/icons/index.js";

import { ComponentCustomProperties } from "vue";
import { Store } from "vuex";
declare module "@vue/runtime-core" {
  interface State {
    count: number;
  }

  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}

const app = createApp(App);

// 过滤 ResizeObserver 警告（浏览器频繁触发但不影响功能）
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('ResizeObserver')) {
    event.preventDefault();
    event.stopPropagation();
  }
});

// 过滤 console.error 中的 ResizeObserver 警告
const originalError = console.error;
console.error = (...args) => {
  if (args[0] && args[0].toString && args[0].toString().includes('ResizeObserver')) {
    return;
  }
  originalError.apply(console, args);
};

app.use(store).use(router).use(ElementPlus).mount("#app");

// SEO 预渲染：触发渲染完成事件
document.dispatchEvent(new Event('render-event'));
