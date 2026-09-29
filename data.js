// ============================================================
// MetaKnow · 索引与映射
// 版本：V1.1
// URL 用短 key（= 页面标题），pageMap 映射到真实路径
// ============================================================

window.MetaKnowData = {

    /* ---------- 站点信息 ---------- */
    site: {
        title: 'MetaKnow',
        description: '现代知识库引擎',
        version: '1.0.0'
    },

    /* ---------- 颜色预设 ---------- */
    /* 用户在 Markdown 里可以写 [[标签:文字|green]]，也可以写 |#4CAF50，也可以写 |accent */
    colors: {
        // 常用色名
        green:  '#4CAF50',
        blue:   '#4a9eff',
        red:    '#ff6b6b',
        orange: '#ffb347',
        yellow: '#f7c948',
        purple: '#ab47bc',
        cyan:   '#26c6da',
        pink:   '#ff6ec7',
        gray:   '#8a8a9e',
        grey:   '#8a8a9e',
        // 语义别名（可改）
        success: '#4CAF50',
        warning: '#ffb347',
        danger:  '#ff6b6b',
        info:    '#4a9eff',
        note:    '#8a8a9e',
        tip:     '#f7c948'
    },

    /* ---------- 短 key → 真实文件路径 ----------
       key 就是页面标题（navigation 和 searchIndex 里的 title）
    ------------------------------------------------ */
    /* pageMap: {
        '快速开始': 'pages/start/快速开始.md',
        '编写指南': 'pages/docs/编写指南.md',
        '测试': 'pages/docs/test.md',
        '关于 MetaKnow': 'pages/about/关于MetaKnow.md'
    },

    /* ---------- 侧边栏导航 ---------- */
    /* navigation: [
        {
            title: '开始',
            icon: 'rocket',
            items: ['快速开始']
        },
        {
            title: '文档',
            icon: 'book',
            items: ['编写指南', '测试']
        },
        {
            title: '关于',
            icon: 'circle-info',
            items: ['关于 MetaKnow']
        }
    ],

    /* ---------- 首页卡片 ---------- */
    /* cards: [],

    /* ---------- 搜索索引 ---------- */
    /* searchIndex: [
        {
            title: '快速开始',
            path: '快速开始',
            category: '开始',
            summary: '五分钟内搭建你的第一个 MetaKnow 知识库。'
        },
        {
            title: '编写指南',
            path: '编写指南',
            category: '文档',
            summary: 'Markdown、HTML、YAML front matter 的完整写作参考。'
        },
        {
            title: '关于 MetaKnow',
            path: '关于 MetaKnow',
            category: '关于',
            summary: 'MetaKnow 是什么、设计哲学、技术栈、许可协议。'
        }
    ]
};
