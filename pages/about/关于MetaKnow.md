---
title: 关于 MetaKnow
description: MetaKnow 是什么、为什么存在、以及它是怎么实现的
---

# 关于 MetaKnow

**MetaKnow 是一个现代知识库引擎。**

它不绑定任何特定领域——可以承载技术文档、团队知识、Minecraft 服务器规则、个人笔记，或者任何你需要长期维护的内容。

## 为什么叫 MetaKnow

"Meta" 有两层含义：

- **元（Meta）** — 知识本身的知识。文档不只是信息，还有结构、关系、上下文。
- **超越（Meta-）** — 超越传统 Wiki。不止于"存"，更在于"连"。

"Know" 则很简单——它处理的是知识。

## 设计原则

### 一、内容与呈现分离

`data.js` 只定义"有什么"——导航结构、搜索索引、站点信息。

具体内容全部放在 `pages/` 下，用 Markdown 或 HTML 书写。

修改样式不会影响内容，修改内容不会破坏布局。

### 二、零构建

不需要 webpack、不需要 npm install、不需要编译。

把文件丢进仓库，用 GitHub Pages 托管，就完成了部署。

### 三、渐进增强

- **基础**：纯静态 HTML + Markdown
- **增强**：主题切换、搜索、评论区
- **可选**：PWA、离线缓存、多语言

每一层都可以独立工作，没有强制依赖。

### 四、对读者友好

- 首屏加载快，无 JS 阻塞
- 键盘可导航（`⌘K` 打开搜索，`↑↓` 选择，`Enter` 跳转）
- 移动端/桌面端自适应
- 深色/浅色/跟随系统

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 渲染 | 原生 HTML/CSS/JS | 无框架 |
| Markdown | marked.js | 客户端解析 |
| 图标 | FontAwesome 6 | 统一图标语言 |
| 评论 | Giscus | 基于 GitHub Discussions |
| 主题 | CSS 变量 | 支持动态切换 |
| 缓存 | sessionStorage | 页面级缓存 |

## 内容组织

```
MetaKnow/
├── pages/ 所有内容
│ ├── quickstart.md
│ ├── about.md
│ └── guide/
│ └── writing.md
├── assets/
│ ├── icons/ 图标与 favicon
│ ├── images/ 图片
│ ├── fonts/ 字体
│ └── audio/ 音频
├── data.js 索引与映射
├── style.css 样式表
├── app.js 交互逻辑
└── index.html 主界面
```

## 浏览器支持

- Chrome / Edge 90+
- Firefox 88+
- Safari 14+
- 移动端 iOS Safari 14+ / Chrome Android 90+

## 参与贡献

发现了问题？有改进建议？

- 提 Issue：描述你遇到的问题或想法
- 提 PR：修复 Bug、补充文档、优化样式
- 留评论：每个页面底部都有评论区，欢迎留言讨论

## 许可协议

MetaKnow 的代码以 MIT 协议开源。你可以自由使用、修改、分发。

文档内容（`pages/` 下的文件）的版权归各自作者所有。

## 下一步

- 想开始使用？看看[[快速开始]]
- 想知道怎么写文档？看看[[编写指南]]

---

*MetaKnow · 让知识自由流动*
