---
title: 组件测试
description: MetaKnow 组件系统的完整测试页面
---

# 组件测试

## 行内组件

状态：[[标签:已完成|green]] [[标签:进行中|orange]] [[标签:已废弃|gray]]

快捷键：[[按键:⌘K]]

重点：[[高亮:这里很重要|yellow]]

徽章：[[徽章:v2.0|purple]]

图标：[[图标:rocket]] [[图标:book]] [[图标:star|yellow]]

颜色名 / 十六进制 / 主题变量：
[[标签:预设|success]] [[标签:自定义|#ff00ff]] [[标签:主题|accent]]

链接：[[链接:GitHub|https://github.com]]

## 块级组件

### Callout

```callout
type=info
默认蓝色提示，支持 **Markdown** 行内语法，也支持 `代码`。
```

```callout
type=warning 颜色=purple 标题=自定义紫
用紫色显示的警告框，颜色支持预设色名。
```

```callout
type=success 颜色=#00aaff 标题=完全自定义
颜色可以写十六进制。
```

```callout
type=danger 标题=危险
这是一条危险提示。
```

```callout
type=tip 标题=小技巧
用 `type=tip` 可以显示灯泡图标。
```

### Grid + Card

```grid
列数=2
:::card
标题=快速开始 图标=rocket
五分钟搭起你的第一个知识库。
:::card
标题=编写指南 图标=book 颜色=green
完整写作参考。
```

三列卡片：

```grid
列数=3
:::card
标题=开始 图标=play
从这里入门。
:::card
标题=文档 图标=book
查阅资料。
:::card
标题=关于 图标=info-circle
了解更多。
```

### Details

```details
标题=点击展开详情
这里是 **折叠** 内容，默认收起，点击标题展开。
```

```details
标题=默认展开的也可以自定义
支持 **Markdown**，也支持 `代码`。
```

### Steps

```steps
1. 安装依赖
2. 初始化项目
3. 启动开发服务器
```

```steps
创建文件
写入内容
提交到仓库
```

（没有编号也能自动加）

### Tabs

```tabs
:::tab 安装
使用 npm 安装：

`npm i -g @metaknow/cli`
:::tab 使用
直接 import 即可：

`import { MetaKnow } from '@metaknow/core'`
:::tab 配置
在 `data.js` 中配置站点信息即可。
```

## 综合示例

下面是一个把多种组件组合使用的例子：

```callout
type=info 标题=提示
以下是一个完整的工作流示例。
```

```steps
1. **创建内容** — 在 pages 目录下新建 md 文件
2. **注册页面** — 在 data.js 的 pageMap 中加入条目
3. **添加搜索** — 在 searchIndex 中补充摘要
```

```grid
列数=2
:::card
标题=快速开始 图标=rocket 链接=#快速开始
五分钟搭起你的第一个知识库。
:::card
标题=编写指南 图标=book 链接=#编写指南
组件语法的完整参考。
```

```details
标题=点击展开更多说明
如果你遇到问题，可以：

- 检查 `data.js` 是否语法正确
- 检查 `components.js` 是否在 `app.js` 之前引入
- 打开浏览器控制台查看报错
```

```callout
type=success 标题=完成
现在你已经掌握了所有组件。
```
