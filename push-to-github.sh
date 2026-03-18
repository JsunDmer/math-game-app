#!/bin/bash

# 推送到GitHub的脚本
# 使用方法: ./push-to-github.sh <你的GitHub用户名>

if [ -z "$1" ]; then
    echo "❌ 请提供GitHub用户名"
    echo "用法: ./push-to-github.sh your-username"
    exit 1
fi

USERNAME=$1
REPO_URL="https://github.com/$USERNAME/math-game-app.git"

echo "🎮 数字乐园 - 推送到GitHub"
echo "=========================="
echo "GitHub用户名: $USERNAME"
echo "仓库地址: $REPO_URL"
echo ""

# 初始化git（如果还没有）
if [ ! -d ".git" ]; then
    echo "📦 初始化Git仓库..."
    git init
fi

# 添加所有文件
echo "📁 添加文件到Git..."
git add .

# 提交
echo "💾 提交更改..."
git commit -m "Initial commit: Math Game Android App with GitHub Actions"

# 添加远程仓库
echo "🔗 配置远程仓库..."
git remote remove origin 2>/dev/null
git remote add origin $REPO_URL

# 推送到main分支
echo "🚀 推送到GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功!"
    echo ""
    echo "📱 查看仓库: https://github.com/$USERNAME/math-game-app"
    echo "⚙️  查看Actions: https://github.com/$USERNAME/math-game-app/actions"
    echo ""
    echo "下一步:"
    echo "1. 访问Actions页面查看构建状态"
    echo "2. 等待构建完成（约3-5分钟）"
    echo "3. 下载Artifacts中的APK文件"
else
    echo ""
    echo "❌ 推送失败"
    echo ""
    echo "可能的原因:"
    echo "1. 仓库不存在 - 请先在GitHub创建仓库"
    echo "2. 需要登录 - 运行: git push -u origin main"
    echo "3. 权限问题 - 检查GitHub账号权限"
fi
