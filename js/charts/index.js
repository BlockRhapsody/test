// ============================================================
// MetaKnow Charts · 入口 + 路由哈哈哈
// 语法：
//   ```chart
//   type: bar
//   title: xxx
//   labels: a, b, c
//   data: 1, 2, 3
//   ```
// 多系列：
//   任意非保留字 key 会被当作一个 series
// ============================================================

import { renderBar } from './bar.js';
import { renderLine } from './line.js';
import { bindTooltipEvents } from './tooltip.js';
import { parseCSV, parseNumberList } from './utils.js';

/* ---------- 渲染器路由 ---------- */
const RENDERERS = {
    bar: renderBar
    line: renderLine,
    // pie / histogram / boxplot 后续加
};

/* ---------- 保留字 ---------- */
const RESERVED = [
    'type', '类型',
    'title', '标题',
    'labels', '标签',
    'data', '数据',
    'color', '颜色',
    'width', 'height',
    'palette', '图例'
];

function isReserved(key) {
    return RESERVED.indexOf(key.toLowerCase()) !== -1;
}

/* ---------- 解析 chart 代码块 ---------- */
function parseChartConfig(codeEl) {
    const raw = codeEl.textContent || '';
    const lines = raw.split('\n');

    const options = {};
    const data = { labels: [], values: [], series: [] };
    let type = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;

        const key = line.slice(0, colonIdx).trim();
        const val = line.slice(colonIdx + 1).trim();
        const keyLower = key.toLowerCase();

        if (!isReserved(key)) {
            // 值里含逗号或数字 → 当作 series
            if (val.indexOf(',') !== -1 || /^-?\d/.test(val)) {
                data.series.push({
                    label: key,
                    values: parseNumberList(val),
                    color: null
                });
            } else {
                // 否则当作普通选项（smooth / area / dot 等）
                options[key] = val;
            }
            continue;
        }

        switch (keyLower) {
            case 'type':
            case '类型':
                type = val.toLowerCase();
                break;

            case 'title':
            case '标题':
                options.title = val;
                break;

            case 'labels':
            case '标签':
                data.labels = parseCSV(val);
                break;

            case 'data':
            case '数据':
                data.values = parseNumberList(val);
                break;

            case 'color':
            case '颜色':
                options.color = val;
                break;

            case 'width':
                options.width = parseInt(val, 10) || undefined;
                break;

            case 'height':
                options.height = parseInt(val, 10) || undefined;
                break;

            case 'palette':
                options.palette = parseCSV(val);
                break;

            case '图例':
                options.legend = val;
                break;

            default:
                options[key] = val;
        }
    }

    return { type: type, data: data, options: options };
}

/* ---------- 对外：渲染单个 chart 代码块 ---------- */
export function renderChart(codeEl) {
    const conf = parseChartConfig(codeEl);

    if (!conf.type) {
        return '<div class="chart-error">图表缺少 type 属性</div>';
    }

    const renderer = RENDERERS[conf.type];
    if (!renderer) {
        return '<div class="chart-error">未知的图表类型：' + conf.type + '</div>';
    }

    try {
        return renderer(conf.data, conf.options);
    } catch (e) {
        console.error('[MetaKnow Charts] 渲染失败:', e);
        return '<div class="chart-error">图表渲染失败：' + (e.message || '') + '</div>';
    }
}

/* ---------- 对外：绑定所有图表的 tooltip ---------- */
export function bindChartTooltips(container) {
    container.querySelectorAll('.mk-chart').forEach(function (el) {
        if (el.dataset.tooltipBound) return;
        el.dataset.tooltipBound = '1';
        bindTooltipEvents(el);
    });
}
