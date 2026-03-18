#!/bin/bash

# 数字乐园安卓应用构建脚本

echo "🎮 数字乐园 - 安卓应用构建"
echo "============================"

# 检查是否安装了Android SDK
if [ -z "$ANDROID_SDK_ROOT" ] && [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  未检测到Android SDK环境变量"
    echo ""
    echo "请安装Android Studio并配置环境变量:"
    echo "export ANDROID_SDK_ROOT=~/Library/Android/sdk"
    echo "export PATH=\$PATH:\$ANDROID_SDK_ROOT/platform-tools"
    echo ""
    echo "或者使用Android Studio打开项目进行构建:"
    echo "npx cap open android"
    exit 1
fi

# 同步Web资源到安卓项目
echo "📦 同步Web资源..."
npx cap copy android

# 进入安卓项目目录
cd android

# 检查Gradle是否存在
if [ ! -f "./gradlew" ]; then
    echo "⚠️  未找到gradlew，尝试使用gradle wrapper..."
    gradle wrapper
fi

# 构建Debug APK
echo "🔨 构建Debug APK..."
./gradlew assembleDebug

# 检查构建结果
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 构建成功!"
    echo ""
    echo "APK文件位置:"
    echo "  📱 Debug版本: app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "安装到设备:"
    echo "  adb install app/build/outputs/apk/debug/app-debug.apk"
else
    echo ""
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi
