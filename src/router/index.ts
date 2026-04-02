import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
const routes: Array<RouteRecordRaw> = [
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
  {
    path: "/404",
    component: () => import("@/views/error/404.vue"),
    meta: { title: "页面不存在 - 叫爸爸点" }
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
        meta: { title: "叫爸爸点 - 在线免费音乐播放器" }
      },
      {
        path: "/singer",  // 歌手
        name: "singer",
        component: () => import("@/views/singer/Singer.vue"),
        meta: { title: "歌手列表 - 叫爸爸点" }
      },
      {
        path: "/singer-detail/:id", // 歌手详情
        name: "singer-detail",
        component: () => import("@/views/singer/SingerDetail.vue"),
        meta: { title: "歌手详情 - 叫爸爸点" }
      },
      {
        path: "/lyric/:id", // 歌词
        name: "lyric",
        component: () => import("@/views/Lyric.vue"),
        meta: { title: "歌词 - 叫爸爸点" }
      },
      {
        path: "/search",  // 搜索
        name: "search",
        component: () => import("@/views/search/Search.vue"),
        meta: { title: "搜索 - 叫爸爸点" }
      },
      {
        path: "/setting", // 设置
        name: "setting",
        meta: {
          title: "设置 - 叫爸爸点",
          requireAuth: true,
        },
        component: () => import("@/views/setting/Setting.vue"),
        children: [
          {
            path: "/setting/PersonalData", // 个人数据
            name: "personalData",
            meta: {
              title: "个人资料 - 叫爸爸点",
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

// 路由守卫 - 修改页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string;
  } else {
    document.title = "叫爸爸点 - 在线免费音乐播放器";
  }
  next();
});

export default router;
