@echo off
REM ============================================================================
REM 造口护理系统后端 - Windows 自动化部署脚本
REM 
REM 使用方法：
REM   首次部署：deploy.bat init
REM   更新代码：deploy.bat update
REM   重启服务：deploy.bat restart
REM   查看状态：deploy.bat status
REM   查看日志：deploy.bat logs
REM   备份数据库：deploy.bat backup
REM   帮助信息：deploy.bat help
REM ============================================================================

setlocal enabledelayedexpansion

REM 配置变量
set APP_NAME=stoma-care-backend
set APP_DIR=%~dp0
set BACKUP_DIR=%APP_DIR%backups

REM 颜色代码（需要 Windows 10 或更高版本）
set "ESC="

REM 检查参数
if "%1"=="" (
    call :print_error "缺少命令参数"
    echo.
    call :show_help
    exit /b 1
)

REM 路由命令
if /i "%1"=="init" goto init_deploy
if /i "%1"=="update" goto update_deploy
if /i "%1"=="restart" goto restart_service
if /i "%1"=="stop" goto stop_service
if /i "%1"=="status" goto show_status
if /i "%1"=="logs" goto show_logs
if /i "%1"=="backup" goto backup_database
if /i "%1"=="health" goto health_check
if /i "%1"=="help" goto show_help
if /i "%1"=="-h" goto show_help
if /i "%1"=="--help" goto show_help

call :print_error "未知命令: %1"
echo.
call :show_help
exit /b 1

REM ============================================================================
REM 初始化部署
REM ============================================================================
:init_deploy
call :print_info "开始初始化部署..."

REM 检查依赖
call :print_info "检查依赖..."
call :check_command "node"
call :check_command "npm"
call :check_command "pm2"
call :check_command "mysql"

call :print_success "依赖检查通过"

REM 检查 .env 文件
if not exist "%APP_DIR%.env" (
    call :print_error ".env 文件不存在！"
    call :print_info "请先创建 .env 文件"
    exit /b 1
)
call :print_success ".env 文件已存在"

REM 安装依赖
call :print_info "安装 npm 依赖..."
cd /d "%APP_DIR%"
call npm install --production
if errorlevel 1 (
    call :print_error "依赖安装失败"
    exit /b 1
)
call :print_success "依赖安装完成"

REM 创建必要的目录
call :print_info "创建必要的目录..."
if not exist "%APP_DIR%logs" mkdir "%APP_DIR%logs"
if not exist "%APP_DIR%uploads\assessments" mkdir "%APP_DIR%uploads\assessments"
if not exist "%APP_DIR%uploads\avatars" mkdir "%APP_DIR%uploads\avatars"
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
call :print_success "目录创建完成"

REM 初始化数据库
set /p INIT_DB="是否初始化数据库？这将清空现有数据！(Y/N): "
if /i "!INIT_DB!"=="Y" (
    call :print_info "初始化数据库..."
    call npm run init-db
    if errorlevel 1 (
        call :print_error "数据库初始化失败"
        exit /b 1
    )
    call :print_success "数据库初始化完成"
) else (
    call :print_warning "跳过数据库初始化"
)

REM 启动应用
call :print_info "启动应用..."
call pm2 start src/server.js --name %APP_NAME% -i 2
if errorlevel 1 (
    call :print_error "应用启动失败"
    exit /b 1
)

REM 保存 PM2 配置
call pm2 save

call :print_success "应用启动成功"
call pm2 status

call :print_success "初始化部署完成！"
call :print_info "运行 'deploy.bat logs' 查看日志"
goto :eof

REM ============================================================================
REM 更新部署
REM ============================================================================
:update_deploy
call :print_info "开始更新部署..."

cd /d "%APP_DIR%"

REM 检查是否是 Git 仓库
if exist ".git\" (
    call :print_info "拉取最新代码..."
    call git pull
    if errorlevel 1 (
        call :print_error "代码拉取失败"
        exit /b 1
    )
    call :print_success "代码更新完成"
) else (
    call :print_warning "未检测到 Git 仓库"
    call :print_info "请手动上传最新代码"
    pause
)

REM 更新依赖
call :print_info "更新依赖..."
call npm install --production
if errorlevel 1 (
    call :print_error "依赖更新失败"
    exit /b 1
)
call :print_success "依赖更新完成"

REM 重启应用
call :print_info "重启应用..."
call pm2 reload %APP_NAME%
if errorlevel 1 (
    call :print_error "应用重启失败"
    exit /b 1
)
call :print_success "应用重启完成"

call pm2 status
call :print_success "更新部署完成！"
goto :eof

REM ============================================================================
REM 重启服务
REM ============================================================================
:restart_service
call :print_info "重启服务..."
call pm2 restart %APP_NAME%
call pm2 status
call :print_success "服务重启完成"
goto :eof

REM ============================================================================
REM 停止服务
REM ============================================================================
:stop_service
call :print_info "停止服务..."
call pm2 stop %APP_NAME%
call pm2 status
call :print_success "服务已停止"
goto :eof

REM ============================================================================
REM 查看状态
REM ============================================================================
:show_status
call :print_info "服务状态："
call pm2 status
echo.
call pm2 show %APP_NAME%
goto :eof

REM ============================================================================
REM 查看日志
REM ============================================================================
:show_logs
call :print_info "查看日志（Ctrl+C 退出）..."
call pm2 logs %APP_NAME%
goto :eof

REM ============================================================================
REM 数据库备份
REM ============================================================================
:backup_database
call :print_info "开始数据库备份..."

REM 读取数据库配置（简化版，实际应从 .env 读取）
set /p DB_USER="请输入数据库用户名 [stoma_user]: "
if "!DB_USER!"=="" set DB_USER=stoma_user

set /p DB_PASSWORD="请输入数据库密码: "
if "!DB_PASSWORD!"=="" (
    call :print_error "密码不能为空"
    exit /b 1
)

set /p DB_NAME="请输入数据库名称 [stoma_care_db]: "
if "!DB_NAME!"=="" set DB_NAME=stoma_care_db

REM 生成备份文件名（时间戳）
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set TIMESTAMP=%mydate%_%mytime%
set BACKUP_FILE=%BACKUP_DIR%\db_backup_%TIMESTAMP%.sql

call :print_info "备份到: %BACKUP_FILE%"

REM 执行备份
mysqldump -u%DB_USER% -p%DB_PASSWORD% %DB_NAME% > "%BACKUP_FILE%"
if errorlevel 1 (
    call :print_error "备份失败"
    exit /b 1
)

call :print_success "备份完成: %BACKUP_FILE%"

REM 显示文件大小
dir "%BACKUP_FILE%" | find /i ".sql"

REM 清理旧备份（保留最近7天）
call :print_info "清理7天前的备份..."
forfiles /p "%BACKUP_DIR%" /m *.sql /d -7 /c "cmd /c del @path" 2>nul
call :print_success "备份完成"
goto :eof

REM ============================================================================
REM 健康检查
REM ============================================================================
:health_check
call :print_info "执行健康检查..."

REM 检查 PM2 状态
call :print_info "检查 PM2 状态..."
call pm2 ping >nul 2>&1
if errorlevel 1 (
    call :print_error "PM2 未运行"
) else (
    call :print_success "PM2 运行正常"
)

REM 检查应用进程
call pm2 list | find /i "%APP_NAME%" >nul 2>&1
if errorlevel 1 (
    call :print_error "应用进程未运行"
) else (
    call :print_success "应用进程运行中"
)

REM 检查 API 响应
call :print_info "检查 API 响应..."
curl -s http://localhost:3000/api/health >nul 2>&1
if errorlevel 1 (
    call :print_error "API 响应失败"
) else (
    call :print_success "API 响应正常"
)

call :print_success "健康检查完成"
goto :eof

REM ============================================================================
REM 显示帮助
REM ============================================================================
:show_help
echo 造口护理系统后端 - Windows 部署脚本
echo.
echo 使用方法：
echo   deploy.bat [命令]
echo.
echo 可用命令：
echo   init       - 初始化部署（首次部署使用）
echo   update     - 更新代码并重启
echo   restart    - 重启服务
echo   stop       - 停止服务
echo   status     - 查看服务状态
echo   logs       - 查看日志
echo   backup     - 备份数据库
echo   health     - 健康检查
echo   help       - 显示帮助
echo.
echo 示例：
echo   deploy.bat init       # 首次部署
echo   deploy.bat update     # 更新应用
echo   deploy.bat logs       # 查看日志
goto :eof

REM ============================================================================
REM 辅助函数
REM ============================================================================

:print_info
echo [INFO] %~1
goto :eof

:print_success
echo [SUCCESS] %~1
goto :eof

:print_warning
echo [WARNING] %~1
goto :eof

:print_error
echo [ERROR] %~1
goto :eof

:check_command
where %~1 >nul 2>&1
if errorlevel 1 (
    call :print_error "%~1 未安装，请先安装"
    exit /b 1
)
goto :eof

REM ============================================================================
REM 结束
REM ============================================================================
:eof
endlocal


