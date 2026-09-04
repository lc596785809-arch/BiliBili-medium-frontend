# CLAUDE.md

本文件为 Claude Code 在本仓库中工作时的指导说明。

## 项目简介

本项目（`media_client`）是「轻量级单体媒体内容分享与管理平台」的**前台客户端**，面向普通用户与 VIP 用户，提供仿 Bilibili 风格的视频浏览、弹幕/HLS 视频播放、Elasticsearch 搜索、个人中心以及大文件分片上传等能力。

配套的后台管理端项目为 `BiliBili_frontend_admin`（同级目录 `../BiliBili_frontend_admin`），两者是**相互独立的 Vue3 子项目**，各自独立开发、构建、部署，仅通过后端 API 产生联系。

> 当前状态：项目刚通过 `create-vue` 脚手架初始化完成，尚未开始正式业务开发，仓库内仍是默认模板代码（`HelloWorld.vue`、`TheWelcome.vue`、`counter.js` 示例 store 等），后续开发会逐步替换。

## 架构与端口约定

| | 客户端 media_client（本项目） | 管理端 media_admin |
|---|---|---|
| 面向用户 | 普通用户 / VIP | 管理员 |
| 开发端口 | 3000 | 3001 |
| 对接后端 | 客户端 API：7071 | 管理 API：7072 |

后端为**单体服务**，前端两端分别请求不同端口/前缀的 API，不共享登录态。视频转码（FFmpeg）、切片存储、Redis 上传进度追踪、Elasticsearch 检索均由后端提供，前端只负责调用与展示。

## 技术栈

- **核心框架**：Vue 3（组合式 API，`<script setup>` 风格）+ Vite 5
- **路由**：Vue Router 4，History 模式
- **状态管理**：Pinia，需持久化用户 Token 与 VIP 状态（登录态、播放权限判断依赖此状态）
- **UI / 样式**：Element Plus + UnoCSS / SCSS，仿 Bilibili 响应式栅格布局、顶部导航、弹幕播放层
- **网络请求**：Axios，统一封装 Request，实现 Token 无感续期（静默刷新）与统一错误拦截
- **流媒体播放**：hls.js，解析并渲染后端 FFmpeg 转码产出的 `.m3u8` 切片流
- **大文件上传**：spark-md5（计算分片 Hash，用于秒传判断）+ Axios（并发分片上传、断点续传、`onUploadProgress` 进度展示）

> 注意：以上依赖（Element Plus、UnoCSS、hls.js、spark-md5、Axios 等）**尚未安装**，`package.json` 目前只有 `vue` `vue-router` `pinia`。引入新依赖前请先确认是否已存在，避免重复安装或版本冲突。

## 目录结构

```
src/
├── api/            # Axios 实例与各模块请求封装（待建）
├── assets/         # 静态资源、全局样式
├── components/     # 通用/业务组件
├── router/         # 路由定义
├── stores/         # Pinia store（用户态、VIP 状态、上传任务等）
├── views/          # 页面级组件
├── App.vue
└── main.js
```

> 目录结构会随开发推进逐步细化（例如按业务拆分 `views/video`、`views/user`、`components/player`、`components/upload` 等），新增目录时请保持职责单一、就近维护。

## 核心功能与交互流程（开发参考）

1. **分片上传与断点续传**：使用 HTML5 File API 对视频文件分片 → spark-md5 计算整体/分片 Hash → 请求后端秒传接口，命中则跳过上传；未命中则并发上传剩余分片，通过 Axios `onUploadProgress` 结合后端 Redis 记录的进度实时展示进度条，支持刷新后续传。
2. **HLS 播放器**：基于 hls.js 封装播放器组件，需支持切片加载、倍速播放、清晰度切换，以及非 VIP 用户播放权限拦截（如中途遮罩/跳转开通提示）。
3. **ES 检索与动态排序**：搜索框防抖请求，支持热度/发布时间/播放量排序及分类标签联动筛选。
4. **鉴权与 Token 续期**：Pinia 持久化 Token，Axios 拦截器在 Token 过期时静默刷新并重放原请求，避免用户感知登录失效。

## 注意事项

- **组件风格统一使用 `<script setup>` 组合式 API**，不要混用选项式 API（与 admin 端的选项式/组合式混写风格不同，两端不必保持一致）。
- **VIP 权限判断必须前后端双重校验**：前端拦截仅用于交互体验（如播放遮罩提示），真正的权限控制以后端接口返回为准，不能仅依赖前端状态放行敏感操作。
- **大文件上传逻辑复杂（分片、Hash、秒传、断点续传、进度追踪）**，涉及状态较多，新增/修改相关代码时注意分片失败重试、并发数控制、Hash 计算耗时对主线程的影响（必要时使用 Web Worker）。
- **HLS 播放器需处理 `hls.js` 的兼容性**（Safari 原生支持 HLS，无需 hls.js；其余浏览器走 MSE），组件销毁时需正确调用 `hls.destroy()` 避免内存泄漏。
- **Token 无感续期需防止并发重复刷新**（多个请求同时 401 时应共享同一次刷新 Promise，而非各自发起刷新请求）。
- 路径别名 `@` 已配置指向 `src`（见 `vite.config.js` / `jsconfig.json`），新代码请使用别名导入而非相对路径穿越多级目录。
- 引入 Element Plus / UnoCSS 等新依赖时，优先考虑按需引入以控制包体积。
- 本项目与 `media_admin` 是两个独立仓库/独立 `node_modules`，不要跨项目相对路径引用代码，如需共享类型或工具，后续可考虑抽取为独立包。
