// ============================================================
// MetaKnow · 索引构建脚本
// 扫描 pages/ 下的所有 .md / .html 文件
// 从 front matter 抽 title / description / order / icon
// 生成 data-index.json
// ============================================================

const fs = require('fs');
const path = require('path');

/* ---------- 配置 ---------- */
const PAGES_DIR = path.join(__dirname, '..', 'pages');
const OUTPUT = path.join(__dirname, '..', 'data-index.json');

/* ---------- 工具函数 ---------- */

// 解析 Markdown 或 HTML 的 front matter
function parseFrontMatter(content, filePath) {
    // Markdown: --- 之间的 YAML
    // HTML: <!-- --- 之间的 YAML --- -->
    let yaml = '';
    let body = content;

    if (filePath.endsWith('.md')) {
        if (content.startsWith('---')) {
            const end = content.indexOf('\n---', 3);
            if (end !== -1) {
                yaml = content.slice(4, end);
                body = content.slice(end + 4).replace(/^\s*\n/, '');
            }
        }
    } else if (filePath.endsWith('.html')) {
        const m = content.match(/<!--\s*---([\s\S]*?)---\s*-->/);
        if (m) {
            yaml = m[1];
            body = content.replace(m[0], '').replace(/^\s*\n/, '');
        }
    }

    // 简单解析 YAML（只支持 key: value，够用）
    const meta = {};
    yaml.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const colonIdx = trimmed.indexOf(':');
        if (colonIdx === -1) return;

        const key = trimmed.slice(0, colonIdx).trim();
        let value = trimmed.slice(colonIdx + 1).trim();

        // 去掉引号
        value = value.replace(/^["']|["']$/g, '');

        // 尝试解析数组 [a, b, c]
        if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
        }
        // 尝试解析数字
        else if (/^-?\d+(\.\d+)?$/.test(value)) {
            value = parseFloat(value);
        }
        // 尝试解析布尔
        else if (value === 'true') value = true;
        else if (value === 'false') value = false;

        meta[key] = value;
    });

    return { meta, body };
}

// 从正文中抽第一段作为 description（如果 front matter 没写）
function extractDescription(body) {
    if (!body) return '';

    // 去掉代码块、标题、图片
    let text = body
        .replace(/^---[\s\S]*?---/, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]+`/g, '')
        .replace(/^#{1,6}\s+.+$/gm, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/[*_~`]/g, '')
        .trim();

    // 取前 80 个字作为摘要
    const firstPara = text.split(/\n\s*\n/)[0] || '';
    const summary = firstPara.replace(/\s+/g, ' ').trim();

    if (summary.length > 80) {
        return summary.slice(0, 80) + '…';
    }
    return summary;
}

// 递归扫描目录
function scanDir(dir, baseDir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach((entry) => {
        // 跳过隐藏文件和下划线开头的
        if (entry.name.startsWith('.') || entry.name.startsWith('_')) return;

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            results.push(...scanDir(fullPath, baseDir));
        } else if (entry.isFile()) {
            if (entry.name.endsWith('.md') || entry.name.endsWith('.html')) {
                results.push(fullPath);
            }
        }
    });

    return results;
}

// 生成短 key（页面标题）
function makeShortKey(title) {
    return title
        .replace(/\.(md|html)$/i, '')
        .replace(/^\d+[-_.]\s*/, '')  // 去掉 1- 前缀
        .trim();
}

/* ---------- 主流程 ---------- */

function build() {
    console.log('[build-index] 开始扫描:', PAGES_DIR);

    if (!fs.existsSync(PAGES_DIR)) {
        console.error('[build-index] pages/ 目录不存在');
        process.exit(1);
    }

    const files = scanDir(PAGES_DIR, PAGES_DIR);
    console.log('[build-index] 找到', files.length, '个文件');

    const pages = [];

    files.forEach((filePath) => {
        const relPath = path.relative(path.dirname(PAGES_DIR), filePath).replace(/\\/g, '/');
        const content = fs.readFileSync(filePath, 'utf-8');
        const { meta, body } = parseFrontMatter(content, filePath);

        // 跳过 draft
        if (meta.draft === true || meta.draft === 'true') {
            console.log('[build-index] 跳过 draft:', relPath);
            return;
        }

        // 从路径推信息
        const relToPages = path.relative(PAGES_DIR, filePath).replace(/\\/g, '/');
        const pathParts = relToPages.split('/');
        const fileName = pathParts[pathParts.length - 1];

        // 从文件名抽 title
        const fileNameNoExt = fileName.replace(/\.(md|html)$/i, '');
        const titleFromFile = makeShortKey(fileNameNoExt);

        // 分类（第一级文件夹名）
        const category = pathParts.length > 1 ? pathParts[0] : '';

        // order 排序：用 front matter 的 order，没有则按文件名前缀数字
        let order = meta.order;
        if (order === undefined) {
            const numMatch = fileNameNoExt.match(/^(\d+)/);
            order = numMatch ? parseInt(numMatch[1], 10) : 9999;
        }

        const page = {
            title: meta.title || titleFromFile,
            path: relPath,
            category: category,
            description: meta.description || extractDescription(body),
            icon: meta.icon || '',
            order: order,
            tags: meta.tags || []
        };

        pages.push(page);
    });

    // 按 category 分组，按 order 排序
    const categories = {};
    pages.forEach((page) => {
        const cat = page.category || '_root';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(page);
    });

    // 生成 navigation
    const navigation = [];

    // 如果有 _root 分类（pages/ 根目录下的文件），放最前面
    if (categories._root) {
        categories._root.sort((a, b) => a.order - b.order);
        navigation.push({
            title: '主页',
            icon: 'home',
            items: categories._root.map((p) => p.title)
        });
    }

    // 其他文件夹作为分类
    Object.keys(categories)
        .filter((cat) => cat !== '_root')
        .sort()
        .forEach((cat) => {
            const items = categories[cat].sort((a, b) => a.order - b.order);
            navigation.push({
                title: cat.replace(/^\d+[-_.]\s*/, ''),  // 去掉 "1- " 前缀
                icon: 'folder',
                items: items.map((p) => p.title)
            });
        });

    // 生成 searchIndex
    const searchIndex = pages
        .map((p) => ({
            title: p.title,
            path: p.title,       // 短 key = title
            category: p.category.replace(/^\d+[-_.]\s*/, '') || '',
            summary: p.description || ''
        }))
        .sort((a, b) => {
            if (a.category !== b.category) return a.category.localeCompare(b.category);
            return 0;
        });

    // pageMap
    const pageMap = {};
    pages.forEach((p) => {
        pageMap[p.title] = p.path;
    });

    const output = {
        generatedAt: new Date().toISOString(),
        pageCount: pages.length,
        navigation: navigation,
        searchIndex: searchIndex,
        pageMap: pageMap
    };

    fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n', 'utf-8');
    console.log('[build-index] 完成，写入', OUTPUT);
    console.log('[build-index] 共', pages.length, '个页面，', navigation.length, '个分类');
}

build();
