# ReelForge

🔥 **TikTok素材 → Meta广告素材 自动化工具**

## 🚀 快速开始

### 前置要求
- Docker & Docker Compose
- NVIDIA Drivers (如果需要在Docker中使用GPU加速FFmpeg，需额外配置)

### 启动项目

```bash
# 1. 下载或克隆项目到本地
# 2. 进入目录
cd reelforge

# 3. 启动所有服务
# 3. 启动所有服务
docker compose up --build -d

# 4. 查看日志
docker compose logs -f
```

### 服务访问

| 服务 | 地址 | 说明 |
|------|------|------|
| **API Backend** | `http://localhost:8000/docs` | Swagger API 文档 |
| **Frontend** | `http://localhost:8080` 或 `http://localhost:3000` | Web 界面 |
| **PostgreSQL** | `localhost:5432` | 数据库 (User: reelforge/Pass: reelforge_secret) |

### 主要功能使用

#### 1. 下载视频
发送 POST 请求到 `/api/v1/download/task`:
```json
{
  "url": "https://www.tiktok.com/@some_creator",
  "options": {
    "max_downloads": 5
  }
}
```

#### 2. Prefect 监控
打开 Prefect UI (`http://localhost:4200`) 查看任务执行状态。

## 📁 目录结构

- `backend/`: FastAPI 后端 + Prefect Workers
- `docker-compose.yml`: 服务编排
- `data/`: 数据存储 (映射到宿主机)
  - `raw/`: 下载的原始视频
  - `output/`: 转换后的素材

## 🛠 开发指南

详见 `SPEC.md` 查看完整技术规格。
