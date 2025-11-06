#!/bin/bash

# 数据大屏 GitHub Pages 部署脚本
# 使用方法：
# 1. chmod +x deploy-to-github-pages.sh
# 2. ./deploy-to-github-pages.sh

echo "=================================="
echo "数据大屏 GitHub Pages 部署工具"
echo "=================================="
echo ""

# 检查 git 是否已安装
if ! command -v git &> /dev/null; then
    echo "❌ 错误: 未安装 Git"
    echo "请先安装 Git: https://git-scm.com/"
    exit 1
fi

# 检查必要文件是否存在
if [ ! -f "index.html" ]; then
    echo "❌ 错误: 找不到 index.html 文件"
    echo "请确保在项目根目录运行此脚本"
    exit 1
fi

if [ ! -f "config.prod.js" ]; then
    echo "❌ 错误: 找不到 config.prod.js 文件"
    exit 1
fi

echo "✅ 文件检查通过"
echo ""

# 创建临时部署目录
DEPLOY_DIR="github-pages-deploy"
echo "📁 创建部署目录..."
rm -rf $DEPLOY_DIR
mkdir $DEPLOY_DIR

# 复制必要文件
echo "📋 复制文件..."
cp index.html $DEPLOY_DIR/
cp config.prod.js $DEPLOY_DIR/
cp .nojekyll $DEPLOY_DIR/
cp DEPLOYMENT.md $DEPLOY_DIR/README.md  # 作为仓库说明

echo "✅ 文件复制完成"
echo ""
echo "📦 部署目录内容:"
ls -lh $DEPLOY_DIR/
echo ""

# 进入部署目录
cd $DEPLOY_DIR

# 初始化 git（如果还没有）
if [ ! -d ".git" ]; then
    echo "🔧 初始化 Git 仓库..."
    git init
    git branch -M main
fi

# 添加文件
echo "📝 添加文件到 Git..."
git add .

# 提交
echo "💾 提交更改..."
git commit -m "部署数据大屏到 GitHub Pages - $(date +'%Y-%m-%d %H:%M:%S')"

echo ""
echo "=================================="
echo "✅ 准备工作完成！"
echo "=================================="
echo ""
echo "接下来请按照以下步骤操作："
echo ""
echo "1️⃣  在 GitHub 上创建新仓库"
echo "   访问: https://github.com/new"
echo "   仓库名: stoma-dashboard (或其他名称)"
echo "   类型: Public (公开)"
echo ""
echo "2️⃣  关联远程仓库并推送"
echo "   cd $DEPLOY_DIR"
echo "   git remote add origin https://github.com/你的用户名/stoma-dashboard.git"
echo "   git push -u origin main"
echo ""
echo "3️⃣  启用 GitHub Pages"
echo "   进入仓库 Settings → Pages"
echo "   Source: main 分支, / (root) 目录"
echo "   保存后等待几分钟"
echo ""
echo "4️⃣  访问你的数据大屏"
echo "   https://你的用户名.github.io/stoma-dashboard/"
echo ""
echo "=================================="
echo "部署目录: $(pwd)"
echo "=================================="

