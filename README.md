# 🌟 现代化导航首页

一个美观的现代化导航首页，采用暗色主题设计，具有分页功能和丰富的交互体验。

## ✨ 特性

### 🎨 视觉设计
- **暗色主题** - 简洁的深色背景，护眼舒适
- **分页导航** - 清晰的分页切换，内容分类明确
- **磨砂玻璃效果** - 现代化的毛玻璃卡片设计
- **精美动效** - 流畅的悬停和过渡动画
- **响应式设计** - 完美适配各种设备尺寸

### 🔍 搜索功能
- **多搜索引擎支持** - Google、百度、Bing、GitHub等
- **智能搜索** - 点击搜索引擎快捷搜索
- **快捷键支持** - `Ctrl/Cmd + K` 快速聚焦搜索框
- **搜索建议** - 智能搜索建议功能
- **实时交互** - 搜索框焦点效果

### 📱 分页系统
- **7个分页** - 常用、开发服DEV、测试服ST、交付服FIX、其他后台、辅助工具、谷歌文档
- **快速切换** - 数字键1-7快速切换分页
- **平滑动画** - 分页切换的流畅过渡效果
- **内容分类** - 按功能模块清晰分类

### 🕐 实用功能
- **实时时钟** - 显示当前时间和日期
- **键盘快捷键** - 提升操作效率
- **性能优化** - 页面隐藏时暂停动画
- **移动端优化** - 专门的移动端适配
- **链接统计** - 记录链接点击情况

## 🚀 快速开始

1. **克隆项目**
   ```bash
   git clone [项目地址]
   cd navigation
   ```

2. **直接打开**
   ```bash
   # 在浏览器中打开 index.html
   open index.html
   ```

3. **本地服务器**（推荐）
   ```bash
   # 使用 Python
   python -m http.server 8000
   
   # 使用 Node.js
   npx serve .
   
   # 访问 http://localhost:8000
   ```

## 📁 项目结构

```
navigation/
├── index.html      # 主页面
├── style.css       # 样式文件
├── script.js       # 交互脚本
└── README.md       # 项目说明
```

## 🎯 核心技术

### 前端技术
- **HTML5** - 语义化结构
- **CSS3** - 现代化样式和动画
- **JavaScript** - 交互逻辑和动态效果
- **Web Fonts** - Google Fonts (Inter)

### 设计特色
- **暗色主题** - 深色背景配色方案
- **CSS Grid** - 响应式网格布局
- **CSS动画** - 流畅的过渡效果
- **分页系统** - 标签页切换功能

## 📋 分页内容

### 常用
- 开发DEV环境链接
- 测试ST环境链接  
- 交付FIX环境链接

### 开发服DEV
- 大厅Cocos相关链接
- 大厅Web相关链接
- 账服后台地址
- EGC/FG后台
- 数据分析工具
- 新官网和商户后台

### 测试服ST
- 大厅Cocos和Web链接
- 账服和EGC/FG后台
- 数据分析平台
- 新官网和商户后台

### 交付服FIX
- 大厅Cocos和Web链接
- 账服后台地址
- 大厅皮肤套（多种主题）
- EGC/FG后台

### 其他后台
- 试玩大厅
- FG总台
- FG旧官网
- CPF系统
- 客服相关
- IGC系统
- 工单系统
- 静态官网

### 辅助工具
- 开发工具（禅道、Jenkins等）
- 娱乐工具（贪吃蛇游戏）
- AI助理（各种AI工具）
- 美术Figma设计文件

### 谷歌文档
- 项目文档链接
- QA日报
- 主要事项
- 版本交付
- 任务总表等

## 🛠 自定义配置

### 修改搜索引擎
在 `script.js` 中修改 `searchEngines` 对象：

```javascript
const searchEngines = {
    'Google': 'https://www.google.com/search?q=',
    '您的搜索引擎': 'https://example.com/search?q=',
    // 添加更多搜索引擎
};
```

### 添加新分页
修改 `index.html` 中的分页导航：

```html
<button class="tab-btn" data-tab="newtab">新分页</button>
```

然后添加对应的内容区域：

```html
<div class="tab-panel" id="newtab">
    <div class="content-grid">
        <div class="content-section">
            <h2 class="section-title">新分类</h2>
            <div class="link-grid">
                <a href="https://example.com" target="_blank" class="link-card">新链接</a>
            </div>
        </div>
    </div>
</div>
```

### 自定义样式
在 `style.css` 中修改主题色彩：

```css
body {
    background: #your-dark-color;
}

.tab-btn.active {
    background: rgba(your-color, 0.2);
    border-color: rgba(your-color, 0.5);
}
```

## ⌨️ 键盘快捷键

- `Ctrl/Cmd + K` - 快速聚焦搜索框
- `1-7` - 快速切换分页（1=常用，2=开发服DEV，以此类推）
- `Enter` - 执行搜索
- `Tab` - 在搜索建议中选择

## 🌐 浏览器支持

- ✅ Chrome (推荐)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ IE 不支持

## 📱 移动端适配

项目完全响应式设计，在移动设备上具有：
- 触摸友好的按钮大小
- 优化的布局和间距
- 简化的交互方式
- 性能优化

## 🎨 设计理念

本项目采用现代化的暗色主题设计，注重：
- **简洁性** - 去除花哨的背景，专注内容
- **可用性** - 清晰的分页分类，快速找到目标
- **性能** - 优化的动画和交互效果
- **可访问性** - 良好的键盘导航支持

## 📄 许可证

MIT License - 自由使用和修改

## 🤝 贡献

欢迎提交Issues和Pull Requests来改进项目！

---

**享受您的现代化导航体验！** ✨ 