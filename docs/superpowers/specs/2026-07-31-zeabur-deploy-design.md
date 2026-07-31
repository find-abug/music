# Zeabur 免费部署设计

**日期：** 2026-07-31  
**状态：** 已确认（待实现）  
**范围：** 将古典音乐演出排期网站（Express + SQLite）部署到 Zeabur，使用平台二级域名对外分享

## 目标与约束

| 项 | 选择 |
|----|------|
| 可用性 | 长期稳定在线，固定可分享 URL |
| 成本 | 尽量免费，接受平台二级域名（`*.zeabur.app`） |
| 受众 | 以国内访问为主 |
| 数据维护 | 线上只读；本地改数据后重新部署更新线上 |
| 平台 | Zeabur |

成功标准：朋友打开 `https://<name>.zeabur.app` 即可浏览演出列表与详情；HTTPS 可用；更新流程为「本地改库 → push → 自动部署」。

## 架构

只部署 `backend/` 服务（内含静态页 `public/` 与 SQLite）。

```text
本地维护数据
    ↓ commit/push
GitHub 仓库（含 classical_music.db 发布快照）
    ↓ 自动构建
Zeabur 运行 node server.js
    ↓
https://<name>.zeabur.app  →  访客浏览器
```

- **进程：** `npm start` → `node server.js`
- **端口：** 使用 Zeabur 注入的 `PORT`
- **数据库：** 仓库内 `backend/data/classical_music.db`，随部署只读使用
- **页面：** `/` 首页，`/admin` 管理页（可不主动分享）
- **域名：** Zeabur Domains → Generate Domain → `*.zeabur.app` + 自动 HTTPS

不在本次范围：自有域名、ICP 备案、线上可写后台、云数据库、微信小程序发版。

## 仓库与构建准备

1. **初始化 Git 并推送到 GitHub**  
   仓库至少包含 `backend/`（推荐以 `classical-music` 为仓库根）。当前环境若尚未安装 Git / 未建仓库，实现阶段一并完成。

2. **Root Directory**  
   Zeabur 服务 Root Directory 设为 `backend`，以便识别 `package.json`。

3. **提交 SQLite 发布库**  
   根目录 `.gitignore` 当前忽略 `*.db` / `backend/data/*.db`。调整为：本地临时文件仍可忽略，但**发布用的** `backend/data/classical_music.db` 必须纳入版本库（或使用明确的「取消忽略」规则），否则线上无演出数据。  
   更新数据时提交该文件的新版本即可。

4. **环境变量**  
   - `NODE_ENV=production`（在 Zeabur 配置）  
   - `PORT`：平台自动注入，不手写  
   - 不配置 MySQL；应用已使用 SQLite（`src/config/database.js`）

5. **监听地址**  
   默认 `app.listen(PORT)`。若部署后健康检查失败且日志显示未绑定外网，再改为 `listen(PORT, '0.0.0.0')`。不预先改，避免无依据改动。

6. **Zeabur 配置（按需）**  
   优先依赖平台对 Node/Express 的自动检测。若检测失败，再补充最小配置标明启动命令 `npm start`。

## 部署与分享步骤

1. 注册 [zeabur.com](https://zeabur.com)（按平台要求完成验证）
2. 新建项目 → 从 GitHub 导入本仓库
3. Root Directory = `backend`；确认启动为 `npm start`
4. 设置 `NODE_ENV=production`
5. 等待构建成功
6. Domains → Generate Domain，得到 `https://<name>.zeabur.app`
7. 用该链接分享；可选自测 `/api/health` 与首页列表

区域：在可选区域中优先选更靠近中国大陆的节点（若控制台提供香港/新加坡等），以改善国内访问。

## 日常更新流程

1. 本地启动后端，用管理后台或脚本修改数据  
2. 确认 `backend/data/classical_music.db` 为最新  
3. `git add` / `commit` / `push`（含 db 文件）  
4. Zeabur 自动重新部署；完成后线上为新数据  

线上不要依赖持久写库：容器文件系统在重新部署后会被镜像内容覆盖。

## 风险与接受点

| 风险 | 处理 |
|------|------|
| 免费额度 / 休眠导致冷启动变慢 | 接受；首次打开可能多等几秒 |
| 海外节点国内访问偶发不稳 | 优先选近区节点；仍不稳再评估国内云（超出本设计） |
| db 未提交导致空站 | 部署检查清单强制确认 db 在仓库中 |
| Git 未安装无法推送 | 实现计划第一步安装/配置 Git 与 GitHub 远程 |

## 实现阶段交付物（概要）

- 调整 `.gitignore`，确保发布用 db 可提交  
- 初始化 Git、推送 GitHub（需用户账号操作配合）  
- 按上文在 Zeabur 完成首次部署与域名绑定  
- 简短部署说明写入 README 或 `docs/`（实现计划中细化）  
- 验证：公网打开首页、`/api/health` 返回 ok、列表有数据

## 已确认决策摘要

- 方案：Zeabur（相对腾讯云 CloudBase / 海外 Render 等）  
- 域名：平台 `*.zeabur.app`，暂不用自有域名  
- 数据：只读线上 + 本地改库再部署  
- 受众：国内优先  
