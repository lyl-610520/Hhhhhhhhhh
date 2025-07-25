# Just in Time - 恰逢其时

一个美妙的打卡与成长PWA应用，陪伴你的每一个美好时光。

## 🌟 特色功能

### 🎯 核心功能
- **智能打卡系统** - 支持起床、睡觉快捷打卡和自定义打卡
- **数据统计分析** - 精美的图表展示你的成长轨迹
- **游戏化体验** - 宠物养成、花朵种植、成就系统
- **智能问候** - 基于时间和天气的个性化问候语

### 🎨 视觉体验
- **毛玻璃效果** - 精致的UI设计，丝滑的交互动画
- **动态背景** - 24小时自动渐变，响应真实时间
- **四季之树** - Canvas绘制的水彩风格季节树
- **天气特效** - 实时天气显示和对应的视觉效果
- **星空夜景** - 夜晚时分的粒子星空和流星效果

### 🎵 多媒体功能
- **音乐播放器** - 内置5首治愈音乐，支持用户上传
- **音效系统** - 治愈轻柔的互动音效
- **语音通知** - 智能的系统推送通知

### 🌍 技术特色
- **PWA应用** - 可安装到桌面，支持离线使用
- **响应式设计** - 完美适配iPad、iPhone等设备
- **深浅色模式** - 自动或手动切换主题
- **中英双语** - 完整的国际化支持
- **实时天气** - 基于地理位置的准确天气信息

## 🚀 快速开始

### 环境要求
- 现代浏览器（支持PWA和ES6+）
- HTTPS环境（PWA必需）

### 安装运行

1. **克隆项目**
```bash
git clone <repository-url>
cd just-in-time
```

2. **安装依赖**
```bash
npm install
```

3. **开发环境**
```bash
npm run dev
```

4. **生产构建**
```bash
npm run build
```

5. **本地服务器**
```bash
npm run serve
```

### 快速体验
在支持PWA的浏览器中访问应用，即可看到安装提示。点击"添加到主屏幕"即可像原生应用一样使用。

## 📱 功能详解

### 主页功能
- **实时时钟** - 精确到秒的时间显示
- **动态问候** - 基于时间段和心理学的智能问候
- **快捷打卡** - 一键完成起床/睡觉打卡
- **自定义打卡** - 记录学习、工作、生活的每一个时刻
- **游戏化面板** - 查看宠物状态和花朵成长
- **闹钟功能** - 设置临时提醒

### 统计分析
- **类别分布图** - 直观的饼图展示打卡分布
- **睡眠趋势图** - 最近7日的睡眠时长分析
- **成长轨迹** - 长期的数据变化趋势

### 养成系统
- **宠物伙伴** - 可爱的宠物陪伴，支持换装
- **花朵种植** - 5个成长阶段，通过打卡获得阳光值
- **成就系统** - 丰富的成就挑战和奖励
- **成就花园** - 展示你的成就点数

### 个性化设置
- **主题切换** - 自动/浅色/深色模式
- **语言选择** - 中文/英文切换
- **宠物命名** - 给你的伙伴起个专属名字
- **天气偏好** - 个性化的天气显示设置
- **通知设置** - 自定义提醒时间
- **音效控制** - 开启/关闭音效

## 🛠 技术架构

### 前端技术栈
- **原生JavaScript ES6+** - 现代JavaScript特性
- **CSS3** - 毛玻璃效果、动画、响应式设计
- **Canvas API** - 四季树和粒子效果渲染
- **Chart.js** - 数据可视化图表
- **Web APIs** - 地理位置、通知、音频等

### PWA核心
- **Service Worker** - 离线缓存和后台同步
- **App Manifest** - 应用安装配置
- **Cache API** - 智能缓存策略
- **Background Sync** - 离线数据同步
- **Push Notifications** - 推送通知

### 数据管理
- **LocalStorage** - 用户数据持久化
- **IndexedDB** - 大容量数据存储（音频文件）
- **实时同步** - 自动数据保存和恢复

### 外部服务
- **WeatherAPI** - 实时天气数据
- **Google Fonts** - 高质量字体加载

## 🎨 设计理念

### 核心原则
- **陪伴与成长** - 成为用户的数字伴侣
- **丝滑一体化** - 流畅自然的交互体验
- **沉浸式氛围** - 动态响应环境的视觉设计
- **情感化内容** - 富有文学性和心理关怀的文案

### 视觉设计
- **毛玻璃美学** - 现代化的半透明效果
- **动态渐变** - 时间驱动的背景变化
- **粒子系统** - 生动的星空和天气效果
- **水彩风格** - 温暖自然的插画元素

### 交互设计
- **直觉操作** - 简单易懂的用户界面
- **即时反馈** - 快速响应的动画效果
- **情感化反馈** - 个性化的打卡鼓励消息
- **无障碍设计** - 支持键盘导航和屏幕阅读器

## 📊 数据隐私

- **本地存储** - 所有数据仅存储在用户设备本地
- **无用户追踪** - 不收集任何个人隐私信息
- **可控数据** - 用户可随时导出或清除数据
- **安全传输** - 外部API调用使用HTTPS加密

## 🔧 开发指南

### 目录结构
```
just-in-time/
├── index.html          # 主页面
├── manifest.json       # PWA配置
├── sw.js              # Service Worker
├── styles/
│   └── main.css       # 主样式文件
├── scripts/
│   ├── main.js        # 主应用逻辑
│   └── pwa.js         # PWA管理
├── icons/             # 应用图标
├── audio/             # 内置音频
└── screenshots/       # 应用截图
```

### 扩展开发
1. **添加新功能** - 在main.js中扩展应用类
2. **自定义主题** - 修改CSS变量定义
3. **新增语言** - 在i18n对象中添加翻译
4. **扩展成就** - 在CONFIG中定义新成就

### 调试技巧
- 打开开发者工具查看详细日志
- 使用`window.appState`和`window.app`调试状态
- Service Worker面板检查PWA功能
- 网络面板验证缓存策略

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 提交规范
- 功能请求：详细描述期望的功能
- Bug报告：提供复现步骤和环境信息
- 代码贡献：遵循现有代码风格

### 开发约定
- 使用中文注释增强可读性
- 保持代码的模块化和可维护性
- 优先考虑用户体验和性能

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢所有为这个项目贡献想法和代码的朋友们！

---

**Just in Time** - 让每一个时刻都恰逢其时 ✨