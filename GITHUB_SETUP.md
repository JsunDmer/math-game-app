# GitHub Actions 自动构建配置指南

## 🚀 快速开始

### 1. 创建GitHub仓库

```bash
# 在项目目录初始化git
cd /Users/sunjian/project/ai_kids_tech/math-game-app
git init
git add .
git commit -m "Initial commit: Math Game Android App"

# 在GitHub上创建新仓库，然后推送
git remote add origin https://github.com/YOUR_USERNAME/math-game-app.git
git branch -M main
git push -u origin main
```

### 2. 配置自动构建

推送代码后，GitHub Actions会自动开始构建。你可以在仓库页面的 **Actions** 标签中查看构建进度。

## 📦 获取APK

### 方法1: 从Artifacts下载 (推荐)

1. 打开GitHub仓库页面
2. 点击 **Actions** 标签
3. 选择最新的工作流运行
4. 在页面底部找到 **Artifacts** 部分
5. 下载 `app-debug` 文件
6. 解压后得到 `app-debug.apk`

### 方法2: 从Releases下载

每次推送到main分支，会自动创建一个预发布版本：

1. 打开GitHub仓库页面
2. 点击右侧的 **Releases**
3. 找到最新的 **Development Build**
4. 下载APK文件

### 方法3: 手动触发构建

1. 打开GitHub仓库页面
2. 点击 **Actions** 标签
3. 选择 **Build Android APK** 工作流
4. 点击 **Run workflow** 按钮
5. 选择构建类型 (debug/release)
6. 点击 **Run workflow**

## 🔐 配置Release签名 (可选)

如果要发布到应用商店，需要配置签名密钥：

### 1. 生成密钥库

```bash
keytool -genkey -v -keystore math-game.keystore -alias mathgame -keyalg RSA -keysize 2048 -validity 10000
```

### 2. 在GitHub添加Secrets

1. 打开GitHub仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 添加以下secrets：
   - `KEYSTORE_PASSWORD`: 密钥库密码
   - `KEY_ALIAS`: 密钥别名 (mathgame)
   - `KEY_PASSWORD`: 密钥密码

### 3. 上传密钥库

将密钥库转为base64：

```bash
base64 -i math-game.keystore -o math-game.keystore.base64
```

然后添加secret：`KEYSTORE_BASE64`

### 4. 修改构建配置

在 `.github/workflows/build-android.yml` 中添加：

```yaml
- name: Setup Keystore
  run: |
    echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > android/app/math-game.keystore
```

## 📝 工作流程说明

### 触发条件

工作流会在以下情况自动运行：
- ✅ 推送到 `main` 或 `master` 分支
- ✅ 修改了 `www/`、`android/` 或工作流文件
- ✅ 手动触发 (workflow_dispatch)

### 构建流程

1. **检出代码** - 获取最新代码
2. **安装Node.js** - 设置Node.js 20环境
3. **安装依赖** - 运行 `npm ci`
4. **设置Java** - 安装JDK 17
5. **设置Android SDK** - 配置Android构建环境
6. **缓存Gradle** - 加速后续构建
7. **同步Capacitor** - 同步Web资源到安卓项目
8. **构建APK** - 生成Debug或Release版本
9. **上传Artifacts** - 保存构建结果
10. **创建Release** - 自动发布到Releases页面

## 🛠️ 自定义配置

### 修改应用信息

编辑 `capacitor.config.json`：

```json
{
  "appId": "com.yourcompany.appname",
  "appName": "你的应用名称",
  "version": "1.0.0"
}
```

### 修改构建版本号

编辑 `android/app/build.gradle`：

```gradle
android {
    defaultConfig {
        versionCode 1
        versionName "1.0.0"
    }
}
```

### 添加构建触发条件

编辑 `.github/workflows/build-android.yml`：

```yaml
on:
  push:
    tags:
      - 'v*'  # 只在推送tag时构建
```

## 🐛 故障排除

### 构建失败

1. **检查日志**
   - 打开Actions页面
   - 点击失败的工作流
   - 查看详细的错误日志

2. **常见问题**
   - **Gradle缓存问题**: 删除缓存重新运行
   - **依赖问题**: 检查 `package.json` 是否正确
   - **权限问题**: 确保GitHub Token有正确权限

3. **本地测试**
   ```bash
   cd /Users/sunjian/project/ai_kids_tech/math-game-app
   npm ci
   npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```

### APK安装失败

1. **启用未知来源安装**
   - 设置 → 安全 → 允许安装未知来源应用

2. **检查签名**
   - Debug版本可以直接安装
   - Release版本需要正确签名

3. **检查Android版本**
   - 最低支持Android 5.1 (API 22)

## 📚 相关链接

- [GitHub Actions文档](https://docs.github.com/en/actions)
- [Capacitor文档](https://capacitorjs.com/docs)
- [Android构建指南](https://developer.android.com/studio/build)

## 💡 提示

- 每次推送代码会自动触发构建
- Artifacts保留30天
- Release版本需要配置签名才能安装
- 可以在手机设置中启用"开发者选项"查看详细日志
