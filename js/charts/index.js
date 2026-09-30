// ============================================================
// MetaKnow Charts · 入口 + 路由
// ============================================================

import { renderBar } from './bar.js';
import { bindTooltipEvents } from './tooltip.js';
import { parseCSV, parseNumberList } from './utils.js';

const RENDERERS = {
    bar: renderBar
    // line / pie / histogram / boxplot 后续加
};

/* 解析 ```chart xxx 的配置 */
function parseChartConfig(codeEl) {
    const raw = codeEl.textContent || '';
    const lines = raw.split('\n');

    // 第一行是 type（bar / line / pie ...）
    const type = (lines[0] || '').trim().toLowerCase();

    const options = {};
    const data = { labels: [], values: [], series: [] };

    let currentSeries = null;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // 支持缩进的 series 子项
        const indentMatch = line.match(/^(\s+)(.+)$/);
        const isIndented = !!indentMatch;

        const content = isIndented ? indentMatch[2] : line;
        const colonIdx = content.indexOf(':');
        if (colonIdx === -1) continue;

        const key = content.slice(0, colonIdx).trim();
        const val = content.slice(colonIdx + 1).trim();

        // 顶层 key
        if (!isIndented) {
            currentSeries = null;
            switch (key) {
                case 'title':
                case '标题':
                    options.title = val; break;
                case 'labels':
                case '标签':
                    data.labels = parseCSV(val); break;
                case 'data':
                case '数据':
                    data.values = parseNumberList(val); break;
                case 'color':
                case '颜色':
                    options.color = val; break;
                case 'width':
                    options.width = parseInt(val, 10) || undefined; break;
                case 'height':
                    options.height = parseInt(val, 10) || undefined; break;
                case 'series':
                case '系列':
                    // 后面缩进行会填充
                    break;
                default:
                    options[key] = val;
            }
        } else {
            // series 子项
            if (!data.series) data.series = [];
            const s = {
                label: key,
                values: parseNumberList(val),
                color: null
            };
            data.series.push(s);
            currentSeries = s;
        }
    }

    return { type: type, data: data, options: options };
}

export function renderChart(codeEl) {
    const conf = parseChartConfig(codeEl);
    const renderer = RENDERERS[conf.type];

    if (!renderer) {
        return '<div class="chart-error">未知的图表类型：' +
            (conf.type || '空') + '</div>';
    }

    try {
        return renderer(conf.data, conf.options);
    } catch (e) {
        console.error('[MetaKnow Charts] 渲染失败:', e);
        return '<div class="chart-error">图表渲染失败</div>';
    }
}

export function bindChartTooltips(container) {
    container.querySelectorAll('.mk-chart').forEach(function (el) {
        if (el.dataset.tooltipBound) return;
        el.dataset.tooltipBound = '1';
        bindTooltipEvents(el);
    });
}
