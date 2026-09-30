// ============================================================
// MetaKnow Charts · 条形图呃呃呃
// ============================================================

import {
    niceScale, scaleLinear, svgEl, formatNumber,
    getColor, escapeHtml
} from './utils.js';

export function renderBar(data, options) {
    const width  = options.width  || 640;
    const height = options.height || 400;
    const pad = { top: 44, right: 24, bottom: 56, left: 56 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;

    const labels = data.labels || [];
    const values = data.values || [];

    if (!values.length) {
        return '<div class="chart-error">没有数据</div>';
    }

    const series = data.series && data.series.length
        ? data.series
        : [{ label: options.legend || '', values: values, color: options.color || null }];

    // 求最大值
    let maxVal = 0;
    series.forEach(function (s) {
        s.values.forEach(function (v) {
            if (v > maxVal) maxVal = v;
        });
    });

    const scale = niceScale(0, maxVal, 5);
    const toY = scaleLinear([scale.min, scale.max], [pad.top + plotH, pad.top]);

    const parts = [];
    parts.push('<svg viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="xMidYMid meet">');

    // 标题
    if (options.title) {
        parts.push(svgEl('text', {
            x: width / 2,
            y: 24,
            'text-anchor': 'middle',
            class: 'chart-title'
        }, escapeHtml(options.title)));
    }

    // 网格线 + Y 轴刻度
    scale.ticks.forEach(function (t) {
        const y = toY(t);
        parts.push(svgEl('line', {
            x1: pad.left, y1: y, x2: width - pad.right, y2: y,
            class: 'grid-line'
        }));
        parts.push(svgEl('text', {
            x: pad.left - 10, y: y + 4,
            'text-anchor': 'end',
            class: 'axis-text'
        }, formatNumber(t)));
    });

    // X 轴基线
    parts.push(svgEl('line', {
        x1: pad.left, y1: pad.top + plotH,
        x2: width - pad.right, y2: pad.top + plotH,
        class: 'axis-line'
    }));

    // 条形
    const groupCount = series.length;
    const slotW = plotW / values.length;
    const barW = slotW * 0.7 / groupCount;
    const groupPad = (slotW - barW * groupCount) / 2;

    values.forEach(function (v, i) {
        series.forEach(function (s, si) {
            const val = s.values[i];
            if (val === undefined || val === null || isNaN(val)) return;

            const x = pad.left + slotW * i + groupPad + barW * si;
            const y = toY(val);
            const h = toY(scale.min) - y;
            const color = s.color || getColor(si, options.palette);

            const tip = (s.label ? s.label + ': ' : '') +
                (labels[i] !== undefined ? labels[i] + ': ' : '') +
                formatNumber(val);

            parts.push(svgEl('rect', {
                x: x, y: y,
                width: barW,
                height: Math.max(h, 0),
                rx: 4,
                fill: color,
                class: 'bar',
                'data-tooltip': escapeHtml(tip)
            }));
        });
    });

    // X 轴标签
    labels.forEach(function (label, i) {
        const x = pad.left + slotW * i + slotW / 2;
        parts.push(svgEl('text', {
            x: x, y: pad.top + plotH + 22,
            'text-anchor': 'middle',
            class: 'axis-text'
        }, escapeHtml(label)));
    });

    // 图例（多系列时才显示）
    if (groupCount > 1) {
        const legendY = height - 16;
        let legendX = pad.left;
        series.forEach(function (s, si) {
            const color = s.color || getColor(si, options.palette);
            parts.push(svgEl('rect', {
                x: legendX, y: legendY - 10,
                width: 12, height: 12,
                rx: 3, fill: color
            }));
            parts.push(svgEl('text', {
                x: legendX + 18, y: legendY,
                class: 'legend-text'
            }, escapeHtml(s.label || '')));
            legendX += 18 + (s.label ? s.label.length * 12 + 24 : 24);
        });
    }

    parts.push('</svg>');

    const chartId = 'chart-' + Math.random().toString(36).slice(2, 8);
    return '<div class="mk-chart" data-chart-id="' + chartId + '">' +
        parts.join('') + '</div>';
}
