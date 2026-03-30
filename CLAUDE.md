# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 Vue3 + Element Plus 音乐播放器前端项目（ui-client），与后端服务（端口 9003）配合使用。

## 常用命令

```bash
npm run serve   # 启动开发服务器（端口 9001）
npm run build   # 构建生产版本
npm run lint    # 代码检查
```

## 架构概览

### 技术栈
- Vue 3.2 + TypeScript
- Element Plus 2.0（UI 组件库）
- Vuex 4（状态管理）
- Vue Router 4（路由）
- Axios（HTTP 请求）
- Sass（样式）

### 目录结构
```
src/
├── api/           # HTTP 请求封装
│   ├── request.ts # Axios 配置与 get/post/put/delete 封装
│   └── index.ts   # HttpManager - 所有 API 接口定义
├── components/    # 公共组件
│   └── layouts/   # 布局组件（Header、Footer、PlayBar、CurrentPlay 等）
├── enums/         # 常量枚举（Icon、NavName、RouterName 等）
├── mixins/        # 组合式函数（mixin.ts - 播放、下载、路由跳转等通用逻辑）
├── router/        # 路由配置
├── store/         # Vuex 状态管理
│   ├── configure.ts # 全局配置状态（token、searchWord 等）
│   ├── user.ts      # 用户信息状态
│   └── song.ts      # 音乐播放状态（核心）
├── views/         # 页面组件
└── assets/        # 静态资源（CSS、图标、图片）
```

### 核心状态管理（store/song.ts）

音乐播放器的核心状态都在 `song.ts` 中管理：
- `songId/songTitle/songUrl/songPic/singerName/lyric` - 当前歌曲信息
- `isPlay/playBtnIcon/volume/duration/curTime` - 播放状态
- `currentPlayList/currentPlayIndex` - 播放列表
- `autoNext` - 触发自动播放下一首

### API 层

所有 API 调用通过 `HttpManager`（src/api/index.ts）统一管理，后端地址通过 `vue.config.js` 的 `chainWebpack` 定义为 `http://localhost:9003`。

### 播放器核心组件

- `YinPlayBar.vue` - 底部播放控制栏（播放/暂停、上一首/下一首、音量、单曲循环/随机播放）
- `YinAudio.vue` - 音频实际播放组件（需查看 `.bak` 文件了解实现）
- `YinCurrentPlay.vue` - 当前播放列表侧边栏

### 路由结构

主路由容器 `YinContainer.vue` 包含 Header、Main（router-view + 播放组件）、Footer。

子路由：首页 `/`、歌手 `/singer`、歌手详情 `/singer-detail/:id`、歌词 `/lyric/:id`、搜索 `/search`、设置 `/setting`。

### 状态持久化

`YinContainer.vue` 通过 `sessionStorage` 在页面刷新前保存 Vuex 状态，刷新后恢复。

## 开发注意事项

- 后端 API 地址在 `vue.config.js` 的 `chainWebpack` 中配置，修改需重启开发服务器
- 项目有大量 `.bak` 备份文件，是从原项目（https://github.com/Yin-Hongwei/music-website）迁移时保留
- 播放器使用 206 Partial Content 请求音频，某些情况下需二次点击才能播放（已知问题）
- 环境变量通过 webpack DefinePlugin 注入，不是标准 `.env` 文件