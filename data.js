// ============================================================
// MetaKnow · 索引与映射
// 版本：V1.0
//
// 这是唯一需要编辑的地方。
// 每次新增页面时，只需在 navigation 和 searchIndex 中注册。
// ============================================================

window.MetaKnowData = {

    site: {
        title: 'MetaKnow',
        description: '现代知识库引擎',
        version: '1.0.0'
    },

    navigation: [
        {
            title: '开始',
            icon: 'rocket',
            items: [
                { title: '快速开始', path: 'pages/start/快速开始.md' }
            ]
        },
        {
            title: '文档',
            icon: 'book',
            items: [
                { title: '编写指南', path: 'pages/docs/编写指南.md' }
            ]
        },
        {
            title: '关于',
            icon: 'circle-info',
            items: [
                { title: '关于 MetaKnow', path: 'pages/about/关于MetaKnow.md' }
            ]
        }
    ],

    cards: [],

    searchIndex: [
        {
            title: '快速开始',
            path: 'pages/start/快速开始.md',
            category: '开始',
            summary: '五分钟内搭建你的第一个 MetaKnow 知识库。'
        },
        {
            title: '编写指南',
            path: 'pages/docs/编写指南.md',
            category: '文档',
            summary: 'Markdown、HTML、YAML front matter 的完整写作参考。'
        },
        {
            title: '关于 MetaKnow',
            path: 'pages/about/关于MetaKnow.md',
            category: '关于',
            summary: 'MetaKnow 是什么、设计哲学、技术栈、许可协议。'
        }
    ]
};
