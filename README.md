# 数字乐园 - 安卓应用

## 项目结构

```
math-game-app/
├── www/                    # Web应用文件
│   └── index.html         # 主游戏文件
├── android/               # 安卓原生项目
├── capacitor.config.json  # Capacitor配置
└── package.json          # npm配置
```

## 构建APK步骤

### 方法1: 使用Android Studio (推荐)

1. 下载并安装 [Android Studio](https://developer.android.com/studio)

2. 打开项目:
   ```bash
   npx cap open android
   ```
   或手动打开 `android` 文件夹

3. 在Android Studio中:
   - 等待Gradle同步完成
   - 点击菜单 `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - APK将生成在 `android/app/build/outputs/apk/debug/app-debug.apk`

### 方法2: 使用命令行 (需要配置Android SDK)

```bash
# 进入安卓项目目录
cd android

# 构建Debug APK
./gradlew assembleDebug

# 或构建Release APK
./gradlew assembleRelease
```

### 方法3: 使用在线构建服务

如果没有Android开发环境，可以使用:
- [Capacitor Cloud](https://capacitorjs.com/)
- [Ionic Appflow](https://ionic.io/appflow)
- [GitHub Actions](https://github.com/features/actions) 自动构建

## 应用信息

- **应用名称**: 数字乐园
- **包名**: com.aikids.mathgame
- **版本**: 1.0.0
- **最低Android版本**: API 22 (Android 5.1)

## 功能特性

✅ 离线运行 - 无需网络连接
✅ 原生体验 - 流畅的触摸交互
✅ 4种游戏模式:
  - 🔢 数数乐园
  - 🎯 数字配对
  - 🔗 数字接龙
  - ➕ 趣味加法
✅ 进度保存 - 自动记录学习进度
✅ 语音播报 - 数字发音指导

## 更新Web内容

修改 `www/index.html` 后，同步到安卓项目:

```bash
npx cap copy android
```

然后在Android Studio中重新构建APK。

## 发布到应用商店

### 生成签名密钥

```bash
keytool -genkey -v -keystore math-game.keystore -alias mathgame -keyalg RSA -keysize 2048 -validity 10000
```

### 配置签名

在 `android/app/build.gradle` 中添加:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("math-game.keystore")
            storePassword "your-password"
            keyAlias "mathgame"
            keyPassword "your-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

### 构建Release APK

```bash
cd android
./gradlew assembleRelease
```

APK位置: `android/app/build/outputs/apk/release/app-release.apk`

## 注意事项

1. 首次安装需要在设置中允许"安装未知来源应用"
2. 应用需要存储权限来保存学习进度
3. 建议使用Android 5.1及以上版本

## 技术支持

- [Capacitor文档](https://capacitorjs.com/docs)
- [Android开发者指南](https://developer.android.com/guide)
