# Zeabur Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the classical-music Express + SQLite backend to Zeabur with a free `*.zeabur.app` HTTPS URL for China-friendly sharing.

**Architecture:** Treat `backend/` as the deployable unit. Commit a read-only SQLite snapshot (`data/classical_music.db`), push to GitHub, import into Zeabur with Root Directory `backend`, bind a generated subdomain. Data updates happen locally then redeploy via git push.

**Tech Stack:** Node.js 18+, Express, SQLite3/Sequelize, GitHub, Zeabur

## Global Constraints

- Platform: Zeabur only (no Render/Railway/CloudBase in this plan)
- Domain: free `*.zeabur.app` subdomain; no custom domain / ICP
- Data mode: online read-only; update by committing a new `classical_music.db` and redeploying
- Audience: China-first; prefer Hong Kong / Singapore / nearest Asia region when Zeabur offers a choice
- Do not commit secrets: keep `backend/.env` out of git (already gitignored)
- Git on this machine: `"C:\Program Files\Git\bin\git.exe"` (may not be on PATH — use full path or ensure PATH includes it)
- Workspace root for the app: `C:\Users\cjk87\Downloads\music\classical-music`

---

## File Structure

| Path | Responsibility |
|------|----------------|
| `.gitignore` | Allow committing publish SQLite DB; keep `.env` / `node_modules` ignored |
| `backend/server.js` | Bind HTTP to `0.0.0.0` so Zeabur health checks reach the process |
| `backend/data/classical_music.db` | Publish snapshot shipped with each deploy |
| `backend/package.json` | Existing `start` / `dev` scripts — no new runtime deps required |
| `README.md` | Add Zeabur deploy + update instructions |
| `docs/superpowers/specs/2026-07-31-zeabur-deploy-design.md` | Spec (already written) — include in first commit |

No new application modules. No cloud database. No Dockerfile unless Zeabur auto-detect fails (fallback only in Task 5).

---

### Task 1: Make SQLite publishable and listen on all interfaces

**Files:**
- Modify: `.gitignore`
- Modify: `backend/server.js` (listen call near end of `startServer`)
- Verify: `backend/data/classical_music.db` exists (~350KB+, already present)

**Interfaces:**
- Consumes: existing `app.listen(PORT, ...)` in `backend/server.js`
- Produces: server binds `0.0.0.0:PORT`; git can track `backend/data/classical_music.db`

- [ ] **Step 1: Confirm publish DB exists**

Run (PowerShell, from `classical-music`):

```powershell
Get-Item .\backend\data\classical_music.db | Select-Object FullName, Length, LastWriteTime
```

Expected: file exists, Length > 100000.

- [ ] **Step 2: Update `.gitignore` so the publish DB is not ignored**

Replace the root `.gitignore` contents with:

```gitignore
node_modules/
.env
.DS_Store
Thumbs.db

# SQLite journals / local scratch only — publish DB is committed
*.db-journal
backend/data/*.db-journal

# Keep accidental DBs elsewhere ignored, but allow backend/data/classical_music.db
*.db
!backend/data/classical_music.db
```

- [ ] **Step 3: Bind Express to `0.0.0.0`**

In `backend/server.js`, change the listen call inside `startServer` from:

```javascript
  app.listen(PORT, () => {
    console.log('🎵 古典音乐演出网站已启动: http://localhost:' + PORT);
```

to:

```javascript
  app.listen(PORT, '0.0.0.0', () => {
    console.log('🎵 古典音乐演出网站已启动: http://localhost:' + PORT);
```

- [ ] **Step 4: Smoke-test locally**

If a previous `npm run dev` is still running on port 3000, stop it first (Ctrl+C in that terminal), then:

```powershell
cd backend
npm start
```

In a second terminal:

```powershell
Invoke-RestMethod http://127.0.0.1:3000/api/health
Invoke-RestMethod "http://127.0.0.1:3000/api/performances?limit=1"
```

Expected: health `status` is `ok`; performances response includes at least one item (shape may be `{ data: [...] }` or an array — any non-empty success is fine).

Stop the server when done (Ctrl+C).

- [ ] **Step 5: Commit**

```powershell
$git = "C:\Program Files\Git\bin\git.exe"
cd C:\Users\cjk87\Downloads\music\classical-music
& $git init
& $git add .gitignore backend/server.js backend/data/classical_music.db docs/superpowers/specs/2026-07-31-zeabur-deploy-design.md docs/superpowers/plans/2026-07-31-zeabur-deploy.md
& $git status
& $git commit -m "chore: prepare backend for Zeabur deploy (publish DB + bind 0.0.0.0)"
```

If `git init` warns the repo already exists, skip init and continue with add/commit.  
If commit fails because user.name/email missing, set **local** (not global) config only:

```powershell
& $git config user.email "you@example.com"
& $git config user.name "Your Name"
```

Use the operator’s real GitHub identity values, then retry the commit. Do not run `git config --global`.

---

### Task 2: Commit full deployable tree (exclude secrets and node_modules)

**Files:**
- Create: nothing new beyond staging existing project files
- Verify ignored: `backend/.env`, `backend/node_modules/`

**Interfaces:**
- Consumes: Task 1 git repo + publish DB
- Produces: single commit (or second commit) with `backend/`, `README.md`, crawler/miniprogram optional; must include everything Zeabur needs under `backend/` except `node_modules` and `.env`

- [ ] **Step 1: Stage project files safely**

```powershell
$git = "C:\Program Files\Git\bin\git.exe"
cd C:\Users\cjk87\Downloads\music\classical-music
& $git add README.md start-server.bat start-server.vbs start-tunnel.bat
& $git add backend
& $git add docs
& $git status
```

Optional (not required for Zeabur web deploy): `& $git add crawler database miniprogram` if you want a full monorepo backup.

- [ ] **Step 2: Verify secrets and node_modules are NOT staged**

```powershell
& $git status --short | Select-String -Pattern "\.env|node_modules"
```

Expected: no matches for `backend/.env` or `node_modules`. If `.env` appears, unstage and confirm `.gitignore` contains `.env`:

```powershell
& $git restore --staged backend/.env
```

- [ ] **Step 3: Confirm publish DB is staged/tracked**

```powershell
& $git ls-files backend/data/classical_music.db
```

Expected: prints `backend/data/classical_music.db`.

- [ ] **Step 4: Commit**

```powershell
& $git commit -m "chore: add backend tree for Zeabur deployment"
```

If everything was already committed in Task 1 Step 5, this commit may be empty — that is OK; skip with no empty commit (`& $git status` shows clean).

---

### Task 3: Push to GitHub

**Files:**
- Remote only (GitHub repository)

**Interfaces:**
- Consumes: local commits from Tasks 1–2
- Produces: public or private GitHub repo URL, e.g. `https://github.com/<user>/classical-music.git`, default branch `main`

- [ ] **Step 1: Ensure `gh` or GitHub web UI is available**

Prefer GitHub CLI if installed:

```powershell
gh auth status
```

If `gh` is missing, create an empty repo at https://github.com/new named `classical-music` (Public or Private), **without** adding a README/license (avoid divergent histories).

- [ ] **Step 2: Create repo with gh (if available)**

```powershell
cd C:\Users\cjk87\Downloads\music\classical-music
gh repo create classical-music --private --source=. --remote=origin --push
```

If this succeeds, skip Step 3.  
If the name is taken, use `classical-music-schedule` or another available name and keep that name consistent in later steps.

- [ ] **Step 3: Manual remote + push (fallback)**

```powershell
$git = "C:\Program Files\Git\bin\git.exe"
cd C:\Users\cjk87\Downloads\music\classical-music
& $git branch -M main
& $git remote remove origin 2>$null
& $git remote add origin https://github.com/<USER>/classical-music.git
& $git push -u origin main
```

Replace `<USER>` with the actual GitHub username. Complete browser/device auth if prompted.

- [ ] **Step 4: Verify remote**

```powershell
& $git ls-remote origin HEAD
```

Expected: a commit SHA is printed (no auth error).

---

### Task 4: Deploy on Zeabur and bind `*.zeabur.app`

**Files:**
- Zeabur dashboard configuration only (no local code required unless deploy fails → Task 5)

**Interfaces:**
- Consumes: GitHub repo from Task 3; Root Directory `backend`; start command from `package.json` → `npm start`
- Produces: live URL `https://<name>.zeabur.app`

- [ ] **Step 1: Sign in to Zeabur**

Open https://zeabur.com and complete account verification required for the first project.

- [ ] **Step 2: Create project and import GitHub repo**

1. New Project  
2. Deploy / Add Service → GitHub → select `classical-music` (or the name used in Task 3)  
3. Set **Root Directory** to `backend`  
4. Region: pick Hong Kong / Singapore / closest Asia option if listed  

- [ ] **Step 3: Set environment variable**

In service Variables / Configuration:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |

Do not set `PORT` (Zeabur injects it). Do not set MySQL variables.

- [ ] **Step 4: Deploy and wait for Running**

Watch build logs until status is Running / Healthy.  
If build fails looking for `package.json`, Root Directory is wrong — fix to `backend` and redeploy.

- [ ] **Step 5: Generate domain**

Service → Domains → **Generate Domain** → choose an available name (e.g. `classical-music` or `classical-music-<suffix>`).  
Record the final URL: `https://<name>.zeabur.app`

- [ ] **Step 6: Verify from your machine**

```powershell
$url = "https://<name>.zeabur.app"   # replace with real domain
Invoke-RestMethod "$url/api/health"
Invoke-WebRequest "$url/" | Select-Object StatusCode
Invoke-RestMethod "$url/api/performances?limit=1"
```

Expected: health ok; homepage HTTP 200; performances non-empty.  
Open `$url` in a browser and confirm the list UI loads.

- [ ] **Step 7: Checkpoint note**

Write the live URL into a local note for Task 6 docs (do not invent a placeholder in README — use the real domain).

---

### Task 5: Fix deploy failures only if Task 4 verification fails

**Files:**
- Create (only if needed): `backend/zbpack.json` **or** root `zbpack.json` depending on Root Directory
- Modify (only if needed): `backend/package.json` engines field

**Interfaces:**
- Consumes: Zeabur build/runtime error logs from Task 4
- Produces: green redeploy passing the same checks as Task 4 Step 6

Skip this entire task if Task 4 Step 6 already passed.

- [ ] **Step 1: Read Zeabur build/runtime logs**

Identify one of:

- A) Node version too old/new  
- B) Start command wrong / app not listening  
- C) App crashes on boot (SQLite native module)

- [ ] **Step 2A: Node version pin (only for case A)**

Add to `backend/package.json` (merge into existing JSON, keep scripts/deps):

```json
"engines": {
  "node": ">=18"
}
```

Commit and push:

```powershell
$git = "C:\Program Files\Git\bin\git.exe"
cd C:\Users\cjk87\Downloads\music\classical-music
& $git add backend/package.json
& $git commit -m "fix: pin Node engine for Zeabur"
& $git push
```

- [ ] **Step 2B: Explicit start config (only for case B)**

Create `backend/zbpack.json`:

```json
{
  "start_command": "npm start"
}
```

Commit and push:

```powershell
$git = "C:\Program Files\Git\bin\git.exe"
cd C:\Users\cjk87\Downloads\music\classical-music
& $git add backend/zbpack.json
& $git commit -m "fix: set Zeabur start command"
& $git push
```

Confirm Task 1 already binds `0.0.0.0`. Redeploy / wait for auto deploy.

- [ ] **Step 2C: Native module rebuild (only for case C)**

In Zeabur variables, ensure build installs from lockfile. Locally regenerate lock if needed:

```powershell
cd C:\Users\cjk87\Downloads\music\classical-music\backend
npm install
```

```powershell
$git = "C:\Program Files\Git\bin\git.exe"
cd C:\Users\cjk87\Downloads\music\classical-music
& $git add backend/package-lock.json
& $git commit -m "fix: refresh lockfile for sqlite3 on Zeabur"
& $git push
```

If sqlite3 still fails after rebuild, stop and report logs to the user before changing database strategy (out of scope to migrate off SQLite).

- [ ] **Step 3: Re-run Task 4 Step 6 verification**

Same PowerShell checks against the live URL. Expected: all pass.

---

### Task 6: Document deploy and update workflow in README

**Files:**
- Modify: `README.md` (append a new section; keep existing WeChat/MySQL docs, add a clear “Website (Zeabur)” path)

**Interfaces:**
- Consumes: live URL from Task 4
- Produces: README section a stranger can follow to redeploy after local DB edits

- [ ] **Step 1: Append Zeabur section to README**

Add at the end of `README.md` (replace the URL with the real one from Task 4):

```markdown
## 网站部署（Zeabur）

线上分享地址（只读）：`https://<name>.zeabur.app`

本仓库的 `backend/` 部署在 [Zeabur](https://zeabur.com)。数据文件为 `backend/data/classical_music.db`（随 Git 发布）。

### 更新线上数据

1. 本地启动：`cd backend && npm run dev`
2. 用 http://localhost:3000/admin 修改数据
3. 提交数据库并推送：

```bash
git add backend/data/classical_music.db
git commit -m "data: update performances"
git push
```

4. 等待 Zeabur 自动重新部署完成后刷新网站

### 重新部署注意

- 不要在线上依赖写入 SQLite；重新部署会覆盖容器内文件
- 环境变量只需 `NODE_ENV=production`；`PORT` 由平台注入
- Zeabur Root Directory 必须为 `backend`
```

- [ ] **Step 2: Commit and push docs**

```powershell
$git = "C:\Program Files\Git\bin\git.exe"
cd C:\Users\cjk87\Downloads\music\classical-music
& $git add README.md
& $git commit -m "docs: add Zeabur deploy and data update guide"
& $git push
```

- [ ] **Step 3: Final acceptance check**

```powershell
$url = "https://<name>.zeabur.app"
Invoke-RestMethod "$url/api/health"
# Open in browser: homepage shows performance list
```

Expected: health ok; browser list visible. Hand the URL to the user as the share link.

---

## Spec Coverage Check

| Spec requirement | Task |
|------------------|------|
| Deploy `backend/` to Zeabur | 4 |
| Free `*.zeabur.app` + HTTPS | 4 Step 5–6 |
| Commit publish SQLite DB | 1, 2 |
| Adjust gitignore for DB | 1 |
| `NODE_ENV=production`, no MySQL env | 4 Step 3 |
| Prefer Asia region | 4 Step 2 |
| Listen fix if needed | 1 (proactive `0.0.0.0`) |
| GitHub push prerequisite | 3 |
| Update flow: local → push → redeploy | 6 |
| README / docs deliverable | 6 |
| Verify health + list data | 4 Step 6, 6 Step 3 |
| Out of scope: custom domain, ICP, online writes, miniprogram | not scheduled |

## Placeholder / consistency self-review

- No TBD/TODO left in steps  
- Real commands use full git path for this Windows machine  
- URL placeholders `<name>` / `<USER>` are operator-substituted at execution time after real resources exist (not product TBDs)  
- Task 5 is explicitly skippable when Task 4 succeeds  
