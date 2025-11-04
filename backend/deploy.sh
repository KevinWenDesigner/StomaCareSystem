#!/bin/bash

###############################################################################
# 造口护理系统后端 - 自动化部署脚本
# 
# 使用方法：
#   1. 首次部署：./deploy.sh init
#   2. 更新代码：./deploy.sh update
#   3. 重启服务：./deploy.sh restart
#   4. 查看状态：./deploy.sh status
#   5. 查看日志：./deploy.sh logs
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
APP_NAME="stoma-care-backend"
APP_DIR="/home/deploy/backend"
PM2_CONFIG="ecosystem.config.js"

# 打印带颜色的信息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 未安装，请先安装"
        exit 1
    fi
}

# 初始化部署
init_deploy() {
    print_info "开始初始化部署..."
    
    # 检查必要的命令
    print_info "检查依赖..."
    check_command "node"
    check_command "npm"
    check_command "pm2"
    check_command "mysql"
    
    print_success "依赖检查通过"
    
    # 检查 .env 文件
    if [ ! -f "$APP_DIR/.env" ]; then
        print_error ".env 文件不存在！"
        print_info "请先创建 .env 文件，参考 .env.example"
        exit 1
    fi
    
    print_success ".env 文件已存在"
    
    # 安装依赖
    print_info "安装 npm 依赖..."
    cd $APP_DIR
    npm install --production
    print_success "依赖安装完成"
    
    # 创建必要的目录
    print_info "创建必要的目录..."
    mkdir -p $APP_DIR/logs
    mkdir -p $APP_DIR/uploads/assessments
    mkdir -p $APP_DIR/uploads/avatars
    print_success "目录创建完成"
    
    # 初始化数据库
    read -p "是否初始化数据库？这将清空现有数据！(y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "初始化数据库..."
        npm run init-db
        print_success "数据库初始化完成"
    else
        print_warning "跳过数据库初始化"
    fi
    
    # 启动应用
    print_info "启动应用..."
    if [ -f "$APP_DIR/$PM2_CONFIG" ]; then
        pm2 start $PM2_CONFIG
    else
        pm2 start src/server.js --name $APP_NAME -i 2
    fi
    
    # 保存 PM2 配置
    pm2 save
    
    print_success "应用启动成功"
    
    # 显示状态
    pm2 status
    
    print_success "初始化部署完成！"
    print_info "运行 'pm2 logs $APP_NAME' 查看日志"
}

# 更新代码
update_deploy() {
    print_info "开始更新部署..."
    
    cd $APP_DIR
    
    # 拉取最新代码（如果使用Git）
    if [ -d ".git" ]; then
        print_info "拉取最新代码..."
        git pull
        print_success "代码更新完成"
    else
        print_warning "未检测到 Git 仓库，跳过代码拉取"
        print_info "请手动上传最新代码"
        read -p "代码已更新？按任意键继续..."
    fi
    
    # 安装/更新依赖
    print_info "更新依赖..."
    npm install --production
    print_success "依赖更新完成"
    
    # 重启应用（零停机）
    print_info "重启应用（零停机）..."
    pm2 reload $APP_NAME
    print_success "应用重启完成"
    
    # 显示状态
    pm2 status
    
    print_success "更新部署完成！"
}

# 重启服务
restart_service() {
    print_info "重启服务..."
    pm2 restart $APP_NAME
    pm2 status
    print_success "服务重启完成"
}

# 停止服务
stop_service() {
    print_info "停止服务..."
    pm2 stop $APP_NAME
    pm2 status
    print_success "服务已停止"
}

# 查看状态
show_status() {
    print_info "服务状态："
    pm2 status
    echo ""
    pm2 show $APP_NAME
}

# 查看日志
show_logs() {
    print_info "查看日志（Ctrl+C 退出）..."
    pm2 logs $APP_NAME
}

# 数据库备份
backup_database() {
    print_info "开始数据库备份..."
    
    # 从 .env 读取数据库配置
    source $APP_DIR/.env
    
    BACKUP_DIR="$APP_DIR/backups"
    DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"
    
    mkdir -p $BACKUP_DIR
    
    print_info "备份数据库到: $BACKUP_FILE"
    mysqldump -u$DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_FILE
    
    # 压缩
    gzip $BACKUP_FILE
    print_success "备份完成: $BACKUP_FILE.gz"
    
    # 显示备份大小
    ls -lh $BACKUP_FILE.gz
    
    # 清理旧备份（保留最近7天）
    print_info "清理7天前的备份..."
    find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
    print_success "备份完成"
}

# 恢复数据库
restore_database() {
    print_info "数据库恢复..."
    
    BACKUP_DIR="$APP_DIR/backups"
    
    # 列出可用的备份
    print_info "可用的备份文件："
    ls -lh $BACKUP_DIR/*.sql.gz 2>/dev/null || {
        print_error "没有找到备份文件"
        exit 1
    }
    
    echo ""
    read -p "请输入要恢复的备份文件名（完整路径）: " BACKUP_FILE
    
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "文件不存在: $BACKUP_FILE"
        exit 1
    fi
    
    # 确认操作
    read -p "确定要恢复数据库吗？当前数据将被覆盖！(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "取消恢复操作"
        exit 0
    fi
    
    # 从 .env 读取数据库配置
    source $APP_DIR/.env
    
    print_info "恢复数据库..."
    gunzip < $BACKUP_FILE | mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME
    print_success "数据库恢复完成"
}

# 查看系统资源
show_resources() {
    print_info "系统资源使用情况："
    echo ""
    
    echo "=== CPU 和内存 ==="
    top -bn1 | head -n 5
    echo ""
    
    echo "=== 磁盘使用 ==="
    df -h
    echo ""
    
    echo "=== 内存详情 ==="
    free -h
    echo ""
    
    echo "=== PM2 进程 ==="
    pm2 status
}

# 清理日志
clean_logs() {
    print_info "清理日志..."
    
    read -p "确定要清理所有日志吗？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "取消清理操作"
        exit 0
    fi
    
    # 清理 PM2 日志
    pm2 flush
    
    # 清理应用日志
    rm -f $APP_DIR/logs/*.log
    
    print_success "日志清理完成"
}

# 健康检查
health_check() {
    print_info "执行健康检查..."
    
    # 检查 PM2 状态
    print_info "检查 PM2 状态..."
    pm2 ping
    
    # 检查应用是否在运行
    if pm2 list | grep -q $APP_NAME; then
        print_success "应用进程运行中"
    else
        print_error "应用进程未运行"
    fi
    
    # 检查 API 响应
    print_info "检查 API 响应..."
    response=$(curl -s http://localhost:3000/api/health)
    if [[ $response == *"ok"* ]]; then
        print_success "API 响应正常: $response"
    else
        print_error "API 响应异常: $response"
    fi
    
    # 检查数据库连接
    print_info "检查数据库连接..."
    source $APP_DIR/.env
    if mysql -u$DB_USER -p$DB_PASSWORD -e "USE $DB_NAME" 2>/dev/null; then
        print_success "数据库连接正常"
    else
        print_error "数据库连接失败"
    fi
    
    print_success "健康检查完成"
}

# 显示帮助
show_help() {
    echo "造口护理系统后端 - 部署脚本"
    echo ""
    echo "使用方法："
    echo "  ./deploy.sh [命令]"
    echo ""
    echo "可用命令："
    echo "  init       - 初始化部署（首次部署使用）"
    echo "  update     - 更新代码并重启"
    echo "  restart    - 重启服务"
    echo "  stop       - 停止服务"
    echo "  status     - 查看服务状态"
    echo "  logs       - 查看日志"
    echo "  backup     - 备份数据库"
    echo "  restore    - 恢复数据库"
    echo "  resources  - 查看系统资源"
    echo "  clean      - 清理日志"
    echo "  health     - 健康检查"
    echo "  help       - 显示帮助"
    echo ""
    echo "示例："
    echo "  ./deploy.sh init       # 首次部署"
    echo "  ./deploy.sh update     # 更新应用"
    echo "  ./deploy.sh logs       # 查看日志"
}

# 主逻辑
case "$1" in
    init)
        init_deploy
        ;;
    update)
        update_deploy
        ;;
    restart)
        restart_service
        ;;
    stop)
        stop_service
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database
        ;;
    resources)
        show_resources
        ;;
    clean)
        clean_logs
        ;;
    health)
        health_check
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "未知命令: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

exit 0

