// ============================================================
// MetaKnow Charts · 工具函数
// ============================================================

/* 计算"漂亮的"刻度范围
   输入 [3, 97]，输出 { min:0, max:100, step:25, ticks:[0,25,50,75,100] } */
export function niceScale(min, max, maxTicks = 5) {
    if (min === max) {
        if (min === 0) return { min: 0, max: 1, step: 1, ticks: [0, 1] };
        min = Math.min(0, min);
        max = Math.max(0, max);
    }

    const range = max - min;
    if (range === 0) return { min: 0, max: 1, step: 1, ticks: [0, 1] };

    const rawStep = range / maxTicks;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const norm = rawStep / mag;
    let step;
    if (norm <= 1) step = 1;
    else if (norm <= 2) step = 2;
    else if (norm <= 5) step = 5;
    else step = 10;
    step *= mag;

    const niceMin = Math.floor(min / step) * step;
    const niceMax = Math.ceil(max / step) * step;

    const ticks = [];
    for (let v = niceMin; v <= niceMax + 1e-9; v += step) {
        ticks.push(Math.round(v * 1e9) / 1e9);
    }

    return { min: niceMin, max: niceMax, step: step, ticks: ticks };
}

/* 数值 → SVG 坐标的线性映射
   scaleLinear([0,100], [400,0])  返回一个函数 v => y */
export function scaleLinear(domain, range) {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    const dSpan = d1 - d0 || 1;
    return function (v) {
        return r0 + (v - d0) / dSpan * (r1 - r0);
    };
}

/* 生成 SVG 元素字符串 */
export function svgEl(tag, attrs, children) {
    let a = '';
    for (const k in attrs) {
        if (attrs[k] === null || attrs[k] === undefined) continue;
        const val = String(attrs[k]).replace(/"/g, '&quot;');
        a += ' ' + k + '="' + val + '"';
    }
    if (children === undefined || children === '') {
        return '<' + tag + a + '/>';
    }
    return '<' + tag + a + '>' + children + '</' + tag + '>';
}

/* 格式化数字：1200 → 1.2k，1200000 → 1.2M */
export function formatNumber(n) {
    if (n === 0) return '0';
    const abs = Math.abs(n);
    if (abs >= 1e8) return (n / 1e8).toFixed(1).replace(/\.0$/, '') + '亿';
    if (abs >= 1e4) return (n / 1e4).toFixed(1).replace(/\.0$/, '') + '万';
    if (abs >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(Math.round(n * 100) / 100);
}

/* 从预设色板取色 */
export const DEFAULT_PALETTE = [
    '#5a6cf3', '#4CAF50', '#ff6b6b', '#ffb347',
    '#ab47bc', '#26c6da', '#f7c948', '#8a8a9e'
];

export function getColor(index, palette) {
    const p = palette && palette.length ? palette : DEFAULT_PALETTE;
    return p[index % p.length];
}

/* 解析 "a, b, c" → ['a', 'b', 'c'] */
export function parseCSV(str) {
    if (!str) return [];
    return str.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
}

/* 解析 "1, 2, 3" → [1, 2, 3] */
export function parseNumberList(str) {
    if (!str) return [];
    return str.split(',').map(function (s) {
        return parseFloat(s.trim());
    }).filter(function (n) { return !isNaN(n); });
}

/* HTML 转义 */
export function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
