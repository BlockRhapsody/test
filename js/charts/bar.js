// ============================================================
// MetaKnow Charts · 条形图
// ============================================================

import {
    niceScale, scaleLinear, svgEl, formatNumber,
    getColor, escapeHtml
} from './utils.js';

export function renderBar(data, options) {
    const width  = options.width  || 640;
    const height = options.height || 400;
    const needRotateCheck = (data.labels || []).some(function (l) {
        return String(l).length > 4;
    });
    const pad = {
        top: 44,
        right: 24,
        bottom: needRotateCheck ? 80 : 56,
        left: 56
    };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;

    const labels = data.labels || [];
    const values = data.values || [];

    // 组装 series
    const series = data.series && data.series.length
        ? data.series
        : (values.length
            ? [{ label: options.legend || '', values: values, color: options.color || null }]
            : []);

    // 检查有没有数据
    const hasData = series.some(function (s) {
        return s.values && s.values.length > 0;
    });

    if (!hasData) {
        return '<div class="chart-error">没有数据</div>';
    }

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

    // 每组数据的数量 = labels 数量（或第一个 series 的长度）
    const groupCount = series.length;
    const itemCount = labels.length || (series[0] && series[0].values.length) || 0;

    if (itemCount === 0) {
        return '<div class="chart-error">没有可显示的数据项</div>';
    }

    const slotW = plotW / itemCount;
    const barW = slotW * 0.7 / groupCount;
    const groupPad = (slotW - barW * groupCount) / 2;

    // 条形
    for (let i = 0; i < itemCount; i++) {
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
    }

    // X 轴标签
    const labelCount = labels.length;

    // 计算间隔：标签太多时隔一个显示
    let step = 1;
    if (labelCount > 16) step = 3;
    else if (labelCount > 10) step = 2;

    // 判断是否需要旋转：任一标签超过 4 个字就旋转
    const needRotate = labels.some(function (l) {
        return String(l).length > 4;
    });

    const labelY = pad.top + plotH + 22;

    labels.forEach(function (label, i) {
        // 间隔显示：保留能被 step 整除的
        if (i % step !== 0) return;

        const x = pad.left + slotW * i + slotW / 2;
        const attrs = {
            x: x,
            y: labelY,
            class: 'axis-text'
        };

        if (needRotate) {
            attrs['text-anchor'] = 'end';
            attrs.transform = 'rotate(-30 ' + x + ' ' + labelY + ')';
        } else {
            attrs['text-anchor'] = 'middle';
        }

        parts.push(svgEl('text', attrs, escapeHtml(label)));
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
    const customWidth = options.width
        ? ' style="max-width:' + options.width + 'px"'
        : '';
    return '<div class="mk-chart" data-chart-id="' + chartId + '"' + customWidth + '>' +
        parts.join('') + '</div>';
}
