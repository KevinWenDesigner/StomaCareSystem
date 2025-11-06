@echo off
chcp 65001 >nul
cls

REM 数据大屏 GitHub Pages 部署脚本 (Windows)
REM 使用方法：双击运行此文件

echo ==================================
echo 数据大屏 GitHub Pages 部署工具
echo ==================================
echo.

REM 检查 git 是否已安装
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未安装 Git
    echo 请先安装 Git: https://git-scm.com/
    pause
    exit /b 1
)

REM 检查必要文件是否存在
if not exist "index.html" (
    echo ❌ 错误: 找不到 index.html 文件
    echo 请确保在项目根目录运行此脚本
    pause
    exit /b 1
)

if not exist "config.prod.js" (
    echo ❌ 错误: 找不到 config.prod.js 文件
    pause
    exit /b 1
)

echo ✅ 文件检查通过
echo.

REM 创建临时部署目录
set DEPLOY_DIR=github-pages-deploy
echo 📁 创建部署目录...
if exist "%DEPLOY_DIR%" rmdir /s /q "%DEPLOY_DIR%"
mkdir "%DEPLOY_DIR%"

REM 复制必要文件
echo 📋 复制文件...
copy /y "index.html" "%DEPLOY_DIR%\"
copy /y "config.prod.js" "%DEPLOY_DIR%\"
copy /y ".nojekyll" "%DEPLOY_DIR%\"
copy /y "DEPLOYMENT.md" "%DEPLOY_DIR%\README.md"

echo ✅ 文件复制完成
echo.
echo 📦 部署目录内容:
dir /b "%DEPLOY_DIR%"
echo.

REM 进入部署目录
cd "%DEPLOY_DIR%"

REM 初始化 git（如果还没有）
if not exist ".git" (
    echo 🔧 初始化 Git 仓库...
    git init
    git branch -M main
)

REM 添加文件
echo 📝 添加文件到 Git...
git add .

REM 提交
echo 💾 提交更改...
git commit -m "部署数据大屏到 GitHub Pages - %date% %time%"

echo.
echo ==================================
echo ✅ 准备工作完成！
echo ==================================
echo.
echo 接下来请按照以下步骤操作：
echo.
echo 1️⃣  在 GitHub 上创建新仓库
echo    访问: https://github.com/new
echo    仓库名: stoma-dashboard (或其他名称)
echo    类型: Public (公开)
echo.
echo 2️⃣  关联远程仓库并推送
echo    cd %DEPLOY_DIR%
echo    git remote add origin https://github.com/你的用户名/stoma-dashboard.git
echo    git push -u origin main
echo.
echo 3️⃣  启用 GitHub Pages
echo    进入仓库 Settings → Pages
echo    Source: main 分支, / (root) 目录
echo    保存后等待几分钟
echo.
echo 4️⃣  访问你的数据大屏
echo    https://你的用户名.github.io/stoma-dashboard/
echo.
echo ==================================
echo 部署目录: %cd%
echo ==================================
echo.
echo 是否现在打开 GitHub 创建仓库页面？
echo 1 = 是
echo 2 = 否
echo.
set /p choice="请选择 (1/2): "

if "%choice%"=="1" (
    start https://github.com/new
    echo.
    echo 已打开浏览器，请在 GitHub 创建仓库
)

echo.
echo 按任意键退出...
pause >nul

