import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
const routes: Array<RouteRecordRaw> = [
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
  {
    path: "/404",
    component: () => import("@/views/error/404.vue"),
  },
  {
    path: "/",
    name: "yin-container",
    component: () => import("@/views/YinContainer.vue"),
    children: [
      {
        path: "/",        // 首页
        name: "home",
        component: () => import("@/views/Home.vue"),
      },
      {
        path: "/singer",  // 歌手
        name: "singer",
        component: () => import("@/views/singer/Singer.vue"),
      },
      {
        path: "/singer-detail/:id", // 歌手详情
        name: "singer-detail",
        component: () => import("@/views/singer/SingerDetail.vue"),
      },
      {
        path: "/lyric/:id", // 歌词
        name: "lyric",
        component: () => import("@/views/Lyric.vue"),
      },
      {
        path: "/search",  // 搜索
        name: "search",
        component: () => import("@/views/search/Search.vue"),
      },
      {
        path: "/setting", // 设置
        name: "setting",
        meta: {
          requireAuth: true,
        },
        component: () => import("@/views/setting/Setting.vue"),
        children: [
          {
            path: "/setting/PersonalData", // 个人数据
            name: "personalData",
            meta: {
              requireAuth: true,
            },
            component: () => import("@/views/setting/PersonalData.vue"),
          }
        ]
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
