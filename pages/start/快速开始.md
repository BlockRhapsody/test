---
title: 快速开始
description: 五分钟内搭建你的第一个 MetaKnow 知识库
---

# 快速开始

MetaKnow 是一个纯静态的知识库引擎。没有构建步骤，没有数据库，没有后端。

只要你会写 Markdown，就能维护一个属于自己的知识库。

## 一、目录结构

MetaKnow/
├── index.html 主界面
├── style.css 样式表
├── app.js 交互逻辑
├── data.js 索引与映射（唯一需要编辑的地方）
├── pages/ 所有内容
│ ├── quickstart.md
│ ├── about.md
│ └── guide/
│ └── writing.md
└── assets/
└── icons/

## 二、写第一篇文档

在 `pages/` 下新建一个 `.md` 文件：

```markdown
---
title: 我的第一篇文档
---

# 我的第一篇文档

你好，MetaKnow。
```

MetaKnow 会读取文件顶部的 YAML front matter，把 title 用作页面标题。

## 三、注册页面

打开 data.js，在 navigation 里加上这个页面：

```
{
    title: '开始',
    icon: 'rocket',
    items: [
        { title: '快速开始', path: 'pages/quickstart.md' },
        { title: '我的第一篇文档', path: 'pages/my-first.md' }   // ← 新增
    ]
}
```

同时在 searchIndex 里补一条索引，让它能被搜到：

```
{
    title: '我的第一篇文档',
    path: 'pages/my-first.md',
    category: '开始',
    summary: '一段简短的摘要，会显示在搜索结果里。'
}
```

## 四、刷新浏览器

打开 index.html，左侧会出现新的导航项。点它，页面就加载了。

底部会自动挂载评论区——第一位留言的用户会触发 Giscus 为该页面创建讨论帖。

## 下一步

- 想写更长、更结构化的文档？看看[编写指南](#/pages/docs/writing.md)
- 想了解 MetaKnow 本身？看看[关于 MetaKnow](#/pages/about/index.md)
