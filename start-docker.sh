#!/bin/bash

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo "===== 导航页Docker部署工具 ====="
echo "工作目录: $SCRIPT_DIR"
echo

# 检查Docker是否已安装并运行
echo "正在检查Docker环境..."
if ! command -v docker &> /dev/null; then
    echo "[错误] Docker未安装或未配置。"
    echo "请先安装Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "[错误] Docker服务未运行。"
    echo "请确保Docker服务已启动并正在运行。"
    echo "您可能需要运行: sudo systemctl start docker"
    exit 1
fi

echo "[成功] Docker环境检查通过。"
echo

# 检查Docker Compose是否已安装
echo "正在检查Docker Compose..."
if ! command -v docker compose &> /dev/null; then
    echo "[警告] Docker Compose未安装，将使用docker命令部署。"
    USE_COMPOSE=0
else
    echo "[信息] 将使用Docker Compose部署。"
    USE_COMPOSE=1
fi

# 停止并移除已存在的容器（如果有）
echo "正在清理旧容器（如果存在）..."
docker stop navigation-page &> /dev/null || true
docker rm navigation-page &> /dev/null || true

# 构建并启动Docker容器
echo "正在构建并启动Docker容器..."

if [ $USE_COMPOSE -eq 1 ]; then
    echo "使用Docker Compose部署..."
    docker compose up -d --build
else
    echo "使用Docker命令部署..."
    docker build -t navigation-page:latest .

    if [ $? -ne 0 ]; then
        echo "[错误] 构建镜像失败。"
        echo "请检查Dockerfile是否正确。"
        exit 1
    fi

    echo "启动容器..."
    docker run -d --name navigation-page -p 80:80 \
        -v "$SCRIPT_DIR/index.html:/usr/share/nginx/html/index.html:ro" \
        -v "$SCRIPT_DIR/style.css:/usr/share/nginx/html/style.css:ro" \
        -v "$SCRIPT_DIR/js:/usr/share/nginx/html/js:ro" \
        -v "$SCRIPT_DIR/game:/usr/share/nginx/html/game:ro" \
        --restart unless-stopped \
        navigation-page:latest
fi

if [ $? -ne 0 ]; then
    echo "[错误] 启动容器失败。"
    echo "请检查docker-compose.yml和Dockerfile文件是否正确。"
    exit 1
fi

# 检查容器是否成功运行
echo "正在检查容器状态..."
sleep 3
if docker ps | grep -q "navigation-page"; then
    echo "[成功] 导航页服务已成功部署！"
    echo
    echo "您可以通过以下地址访问导航页:"
    echo "- 本机访问: http://localhost"

    # 尝试多种方法获取IP地址
    IP_ADDR=""

    # 方法1: 使用ip命令
    if command -v ip &>/dev/null; then
        IP_ADDR=$(ip addr show | grep -E "inet .* global" | head -1 | awk '{print $2}' | cut -d/ -f1)
    fi

    # 方法2: 如果方法1失败，尝试使用ifconfig
    if [ -z "$IP_ADDR" ] && command -v ifconfig &>/dev/null; then
        IP_ADDR=$(ifconfig | grep -E "inet .* netmask .* broadcast" | head -1 | awk '{print $2}')
    fi

    # 方法3: 如果前两种方法都失败，尝试使用hostname
    if [ -z "$IP_ADDR" ] && command -v hostname &>/dev/null; then
        IP_ADDR=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi

    # 显示IP地址
    if [ -n "$IP_ADDR" ]; then
        echo "- 内网访问: http://$IP_ADDR"
    else
        echo "- 内网访问: 无法自动获取IP地址，请使用 'ipconfig' 或 'ip addr' 命令手动查看"
    fi

    echo
    echo "常用命令:"
    echo "- 查看容器日志: docker logs -f navigation-page"
    echo "- 停止服务: docker stop navigation-page"
    echo "- 删除服务: docker rm navigation-page"
    echo "- 重启服务: docker restart navigation-page"
else
    echo "[错误] 容器未成功运行。"
    echo "请查看容器日志了解详情: docker logs navigation-page"
fi
