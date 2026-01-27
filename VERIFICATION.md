# ✅ ReelForge 启动与测试指南

本文档将指导您如何启动 ReelForge 完整版（Docker 环境），并验证核心功能。

## 1. 为什么会出现权限问题？

您可能遇到了 `Permission denied` 错误，原因如下：
1. **Docker 机制**：Docker 容器（如 Node.js）默认使用 `root` 用户运行。
2. **文件映射**：当容器在您的磁盘上创建文件（如 `npm create vite` 生成的前端文件）时，这些文件在 Linux 系统中也被标记为 `root` 拥有。
3. **后果**：您当前的用户（非 root）无法修改或移动这些文件。

**解决方法**：
我们提供了 `./setup.sh` 脚本，它会自动尝试修复这些权限。如果失败，您可以使用以下命令手动修复：
```bash
sudo chown -R $USER:$USER /data/reelforge/frontend
```

---

## 2. 启动服务 (一键启动)

确保您在项目根目录 `/data/reelforge`：

```bash
# 赋予脚本执行权限
chmod +x setup.sh

# 运行启动脚本
./setup.sh
```

该脚本会执行以下操作：
1. 检查并修复前端目录权限。
2. 启动所有 Docker 服务 (Backend, Database, Redis, Prefect)。
3. 等待服务就绪并运行基础测试。

---

## 3. 功能验证指南

服务启动后，您可以通过以下方式验证各模块功能：

### A. API 与 后端状态
运行我们要为您准备的 **全功能验证脚本**：
```bash
python3 verify_all.py
```
如果看到 `✓ PASS`，说明后端核心服务运行正常。

### B. 核心功能测试

#### 1. 视频下载 (Downloader)
发送 POST 请求触发下载任务：
```bash
curl -X POST "http://localhost:8000/api/v1/download/task" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.tiktok.com/@test_user", "options": {"max_downloads": 1}}'
```

#### 2. 查看任务状态 (Prefect UI)
访问浏览器：[http://localhost:4200](http://localhost:4200)
- 查看 Dashboard 中的 Flow Runs。
- 确认是否有 `video_download_flow` 正在运行。

#### 3. 素材管理 (Material API)
查看已入库的素材：
```bash
curl "http://localhost:8000/api/v1/materials"
```

### C. 常见问题排查

- **Service RabbitMQ/Redis 连接失败？**
  - 检查 `docker compose ps` 确保所有容器状态为 `Up`。
- **构建慢？**
  - 第一次启动 `reelforge-backend` 需要编译 FFmpeg 依赖，可能需要 3-5 分钟，请耐心等待。
- **前端无法访问？**
  - 如果 `setup.sh` 提示前端失败，请手动执行：
    `docker compose up -d frontend`

---

**技术支持**：
所有代码位于 `/data/reelforge`。如需修改配置，请编辑 `.env` 文件。
