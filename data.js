// ============================================================
// MetaKnow · 索引与映射
// 版本：V1.1
//
// 这是唯一需要编辑的地方。
// 每次新增页面时，只需在 navigation 和 searchIndex 中注册。
// ============================================================

window.MetaKnowData = {

    /* ---------- 站点信息 ---------- */
    site: {
        title: 'MetaKnow',
        description: '现代知识库引擎',
        version: '1.0.0'
    },

    /* ---------- 侧边栏导航 ---------- */
    // icon 使用 FontAwesome class（不带 "fa-" 前缀的部分）
    // 例如：'book', 'code', 'gamepad', 'flask', 'compass'
    navigation: [
        // 示例（内容为空时自动隐藏空分类）：
        // {
        //     title: '开始',
        //     icon: 'compass',
        //     items: [
        //         { title: '快速开始', path: 'pages/quickstart.md' },
        //         { title: '安装指南', path: 'pages/install.md' }
        //     ]
        // },
    ],

    /* ---------- 首页卡片 ---------- */
    // 留空则首页显示欢迎页
    cards: [],

    /* ---------- 搜索索引 ---------- */
    // 每条记录对应一个页面，用于搜索匹配和高亮
    searchIndex: [
        // 示例：
        // {
        //     title: '快速开始',
        //     path: 'pages/quickstart.md',
        //     category: '开始',
        //     summary: '五分钟内搭建你的第一个知识库。'
        // },
    ]
};
