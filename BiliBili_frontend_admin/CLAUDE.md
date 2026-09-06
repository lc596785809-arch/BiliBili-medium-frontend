# CLAUDE.md

本文件为 Claude Code 在本仓库中工作时的指导说明。

## 项目简介

本项目（`media_admin`）是「轻量级单体媒体内容分享与管理平台」的**后台管理端**，面向管理员，提供视频审核（转码中 / 待审核 / 已发布 / 已拒绝流转）、分类维护、用户权限变更与平台数据统计。

配套的前台客户端项目为 `BiliBili_frontend_web`（同级目录 `../BiliBili_frontend_web`），两者是**相互独立的 Vue3 子项目**，各自独立开发、构建、部署，仅通过后端 API 产生联系，不共享登录态与代码。

> 当前状态：已完成管理员登录、控制台框架、分类管理（含拖拽排序、图标/背景上传）、视频管理（筛选、审核流转、推荐/VIP/公开配置、HLS 预览、下载、逻辑删除）。用户权限管理、平台数据统计等模块尚未开发。

## 架构与端口约定

| | 客户端 media_client | 管理端 media_admin（本项目） |
|---|---|---|
| 面向用户 | 普通用户 / VIP | 管理员 |
| 开发端口 | 3000 | 3001 |
| 对接后端 | 客户端 API：7071 | 管理 API：7072 |

后端为**单体服务**，管理端请求独立的管理 API（7072），与客户端 API（7071）路由/鉴权分离。视频转码状态（FFmpeg）、审核流转、站内信通知均由后端驱动，前端负责展示与触发操作。

## 技术栈

- **核心框架**：Vue 3（选项式 / 组合式 API **混写**，无需强制统一，可按组件复杂度选择）+ Vite 5
- **路由**：Vue Router 4
- **状态管理**：Pinia / Vuex 4，管理管理员 Session 与权限信息（当前 `package.json` 已含 Pinia，Vuex 视需要再引入，避免两套状态库并存导致维护成本上升）
- **UI 组件**：Element Plus，**全量注册** `@element-plus/icons-vue`，用于表格筛选、动态表单及审核状态流转标签
- **网络请求**：Axios，`src/api/request.js` 封装管理端实例（7072，`withCredentials`），`src/api/clientRequest.js` 封装客户端公开只读接口实例（7071，用于读取分类等无需登录的数据）
- **HLS 播放**：hls.js，用于视频管理页详情弹窗的预览播放（管理端 `videoResource` 接口已在服务端做好 ts 分片路径改写，前端只需 `xhrSetup` 里加 `withCredentials` 即可，不需要自定义 loader）

> 依赖现状：`axios`、`element-plus`、`@element-plus/icons-vue`、`hls.js` 均已安装。

## 目录结构

```
src/
├── api/            # request.js（管理端）、clientRequest.js（客户端公开接口）、admin.js、category.js、upload.js、video.js
├── layout/         # AdminLayout.vue：侧边栏 + 顶栏 + router-view
├── router/         # 路由定义 + 登录态守卫（白名单 /login）
├── stores/         # admin.js：管理员信息（Pinia + sessionStorage 持久化）
├── views/
│   ├── login/          # 登录页（验证码、登录失败重试）
│   ├── dashboard/       # 控制台欢迎页
│   ├── category/        # 分类管理（el-tree 拖拽排序）+ components/CategoryDialog.vue
│   └── video/           # 视频管理（筛选/列表/开关配置）+ components/AuditDialog.vue、VideoDetailDialog.vue
├── App.vue
└── main.js
```

> 目录结构会随开发推进逐步细化（例如后续加 `views/user`、`views/statistics`），新增目录时请保持职责单一、就近维护。

## 已开发功能

### 管理员登录 + 控制台框架

| 路由 | 说明 |
|---|---|
| `/login` | 登录页，白名单放行，不套 Layout |
| `/dashboard` | 控制台欢迎页（占位统计卡片，无实际数据接口） |

- 接口：`GET checkCode`、`POST login`、`POST logout`（均为 7072 `/api/v1/admin/*`）
- 登录态：`stores/admin.js`（Pinia）+ `sessionStorage` 持久化，`router/index.js` 里 `beforeEach` 守卫未登录统一重定向 `/login`
- 登录失败码 601/603/605：前端自动重新拉验证码 + 清空验证码输入框
- `api/request.js` 的响应拦截器统一处理三类响应：`code=200`（含 `status=error` 的业务失败）、`code=401`（清空登录态并跳转登录页）、`code>=600`（弹出后端 `info`）

### 分类管理（`/category`）

- 接口：`loadCategory`（改走 7072 管理端而非 7071 客户端，避免跨域）、`saveCategory`、`delCategory`、`updateSort`、`uploadImage`
- 展示：`el-tree`（非 `el-table`），一级分类术语为"一级分类"而非"顶级分类"；`background` 字段只在新增/编辑弹窗里配置，列表不展示
- 拖拽排序关键坑点（排查过程见 git 历史/对话记录，避免重踩）：
  - `allow-drop` 需要允许整行（含中间 "inner" 区域）都可放置，否则 Element Plus 会把中间 ~50% 的区域判定为死区，不触发任何事件
  - `node-drop` 回调里**不能**用 `draggingNode.parent`（Element Plus 内部在触发事件前已把它 `remove()`，`.parent` 会被置空），要用不会被移除的 `dropNode.parent` 来算兄弟节点顺序
  - 新增子分类时**不能**把父分类自身的 `categoryName`/`categoryCode`/`icon` 带入表单，只需要父分类的 `categoryId`（用于算 `pCategoryId`）
- 图标/背景上传：`el-upload` + `api/upload.js`，50MB 以内，后端返回可直接用于 `<img src>` 的完整 URL

### 视频管理（`/video`）

- 接口（均 7072 `/api/v1/admin/videoInfo/*`）：`loadVideoList`、`getVideoDetail`、`auditVideo`、`recommendVideo`、`setVideoPublic`、`setVideoVip`、`deleteVideo`、`videoResource/{fileId}[/​{tsName}]`（HLS）、`downloadVideo`
- 筛选：视频名称模糊、视频分类（`api/category.js` 的 `loadLeafCategories()`，走 7071 客户端公开接口 `loadLastLevelCategory`，仅末级分类）、推荐状态、VIP
- 列表固定字段：封面、视频名称、上传用户昵称、播放量、简介、最后编辑时间、审核状态（0/1/2/3 = 草稿/待审核/通过/驳回）；额外的"审核"列独立放在"审核状态"列左侧，仅 `auditStatus=1` 时显示
- 推荐/VIP 开关仅 `auditStatus=2` 可操作（非通过状态置灰），公开开关任意状态均可操作；任何开关/审核/删除操作后统一 `loadList()` 刷新，保证前端状态与后端一致
- 下载走 `window.open(buildDownloadUrl(videoId))` 原生导航，不走 axios
- HLS 预览：`hls.js` 的 `xhrSetup` 里必须加 `xhr.withCredentials = true`，否则跨域请求带不上 Session Cookie 导致 401；m3u8 里的 ts 分片相对路径改写已经在后端做好，前端不需要自定义 loader
- **前端自己做的分页**：后端 `loadVideoList` 没有注册 MyBatis-Plus 的 `PaginationInnerInterceptor`，`total` 恒为 0、`pageNo`/`pageSize` 对 SQL 不生效（每次都返回全量匹配结果）。前端已经适配：一次性拿到全量 `records`，`total` 用数组长度算，翻页在前端本地切片，不重新请求接口。**这是后端配置缺陷，不是前端 bug**，如果后端后续把拦截器配上了，前端这套逻辑不受影响（多请求了没用到的 `pageNo`/`pageSize` 而已）。
- 已知的需求与后端能力差距（前端已按后端实际能力实现，未代为改后端）：
  - 后端单视频只有一个 `fileId`（`video_info_file` 设计上不支持多分P），详情弹窗只做单文件播放，没有分P切换 UI
  - `auditVideo` 的 `rejectReason` 后端接了但没持久化（`VideoInfo` 表无此字段），前端仍会传，但目前存不下来也无法回显
  - `recommendVideo`/`auditVideo` 后端没有做状态校验（只有 `setVideoVip` 真校验了 `auditStatus=2`），前端按钮/开关的可用状态只是 UI 层限制，不是后端强制

## 待开发 TODO

- **用户权限管理**：用户列表查询、启用/禁用、权限变更（管理员角色/VIP）
- **平台数据统计**：播放量、投稿量、审核吞吐等维度的数据看板

## 注意事项

- **权限控制以后端为准**：前端路由守卫/按钮级权限判断仅做交互体验优化，管理员越权操作必须依赖后端接口鉴权拦截。
- **驳回原因等敏感操作需二次确认**，避免误触发送站内信或误改审核状态。
- **审核状态是流转状态机**（草稿0→待审核1→审核通过2/驳回3，仅待审核状态可发起审核），前端展示逻辑需与后端状态定义严格对齐，新增状态时同步检查所有展示分支（列表标签、筛选项、详情页）。
- **M3U8 预览播放器**与客户端播放器职责不同（审核场景通常不需要弹幕、倍速等用户向功能），避免直接复用客户端播放器组件，按需精简实现或考虑抽取最小公共播放核心。
- Element Plus 全量注册图标会增加包体积，如后续关注性能可评估按需引入。
- 路径别名 `@` 已配置指向 `src`（见 `vite.config.js` / `jsconfig.json`），新代码请使用别名导入而非相对路径穿越多级目录。
- 本项目与 `media_client` 是两个独立仓库/独立 `node_modules`，不要跨项目相对路径引用代码，如需共享类型或工具，后续可考虑抽取为独立包。
- 状态管理若同时引入 Pinia 与 Vuex，需明确分工（例如新代码统一用 Pinia，Vuex 仅为过渡），避免同一份状态在两处维护。
- **后端代码仓库路径**：`E:\work\BiliBiliCode\backend\BiliBili_backend`（`medium_admin` 包为后台管理对应接口，`API_DOC.md`/`API_TEST_GUIDE.md`/`CLAUDE.md` 可作为接口联调参考）。**只允许读取参考，绝对不允许修改该仓库下的任何后端代码**——本项目职责仅限前端开发，接口行为/字段有问题一律反馈给用户由其自行改后端，不要代为编辑。
