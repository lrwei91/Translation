# Docker 部署说明

## 文件说明

### Docker 配置文件
- `Dockerfile` - 主要的Docker构建文件，内含完整的Nginx配置
- `Dockerfile.simple` - 简化版Dockerfile，使用独立的nginx.conf文件
- `docker-compose.yml` - Docker Compose配置文件
- `nginx.conf` - 独立的Nginx配置文件
- `.dockerignore` - Docker构建忽略文件

### 启动脚本
- `start-docker.sh` - 自动化部署脚本

## 部署方式

### 方式一：使用自动化脚本（推荐）
```bash
# 给脚本执行权限
chmod +x start-docker.sh

# 运行部署脚本
./start-docker.sh
```

### 方式二：使用Docker Compose
```bash
# 构建并启动服务
docker compose up -d --build

# 停止服务
docker compose down
```

### 方式三：使用原生Docker命令
```bash
# 构建镜像
docker build -t navigation-page:latest .

# 运行容器
docker run -d \
  --name navigation-page \
  -p 80:80 \
  --restart unless-stopped \
  -v $(pwd)/index.html:/usr/share/nginx/html/index.html:ro \
  -v $(pwd)/style.css:/usr/share/nginx/html/style.css:ro \
  -v $(pwd)/js:/usr/share/nginx/html/js:ro \
  -v $(pwd)/game:/usr/share/nginx/html/game:ro \
  navigation-page:latest
```

### 方式四：使用简化版Dockerfile
```bash
# 使用简化版Dockerfile构建
docker build -f Dockerfile.simple -t navigation-page-simple:latest .

# 运行容器
docker run -d \
  --name navigation-page \
  -p 80:80 \
  --restart unless-stopped \
  navigation-page-simple:latest
```

## 功能特性

### Nginx 配置优化
- **Gzip压缩**：自动压缩CSS、JS、JSON等文件
- **缓存策略**：
  - 静态资源（CSS、JS、图片）：缓存1年
  - HTML文件：不缓存，确保更新及时
  - 游戏文件：缓存7天
- **安全头**：添加XSS保护、内容类型嗅探保护等
- **SPA支持**：支持单页应用路由
- **错误处理**：自定义错误页面

### 开发友好
- **热更新**：使用volume挂载，修改代码无需重建镜像
- **健康检查**：自动监控容器健康状态
- **日志管理**：结构化的访问日志

## 常用命令

### 查看服务状态
```bash
# 查看容器状态
docker ps

# 查看容器日志
docker logs -f navigation-page

# 查看容器资源使用情况
docker stats navigation-page
```

### 管理服务
```bash
# 重启服务
docker restart navigation-page

# 停止服务
docker stop navigation-page

# 删除容器
docker rm navigation-page

# 删除镜像
docker rmi navigation-page:latest
```

### 调试和维护
```bash
# 进入容器
docker exec -it navigation-page sh

# 查看Nginx配置
docker exec navigation-page cat /etc/nginx/conf.d/default.conf

# 重载Nginx配置
docker exec navigation-page nginx -s reload

# 测试Nginx配置
docker exec navigation-page nginx -t
```

## 端口访问

服务启动后，可以通过以下方式访问：

- **本机访问**：http://localhost
- **局域网访问**：http://[服务器IP地址]

## 故障排除

### 常见问题

1. **端口冲突**
   - 问题：80端口被占用
   - 解决：修改docker-compose.yml中的端口映射，如 `"8080:80"`

2. **文件挂载失败**
   - 问题：volume挂载路径不正确
   - 解决：确认文件路径存在，使用绝对路径

3. **权限问题**
   - 问题：无法访问文件
   - 解决：检查文件权限，确保Docker有读取权限

4. **构建失败**
   - 问题：COPY指令找不到文件
   - 解决：确认文件存在，检查.dockerignore配置

### 性能优化

1. **减小镜像体积**
   - 使用alpine基础镜像
   - 合理配置.dockerignore
   - 多阶段构建（如需要）

2. **提升访问速度**
   - 启用Gzip压缩
   - 配置合理的缓存策略
   - 使用CDN（可选）

## 更新部署

### 更新代码
```bash
# 停止现有容器
docker stop navigation-page

# 拉取最新代码
git pull

# 重新启动（会自动重建）
./start-docker.sh
```

### 仅更新前端文件
如果使用volume挂载，直接修改文件即可，无需重启容器：
```bash
# 修改文件后，容器会自动使用新文件
# 刷新浏览器即可看到更改
``` 