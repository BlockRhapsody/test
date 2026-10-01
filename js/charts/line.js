// ============================================================
// MetaKnow Charts · 折线图
// ============================================================

import {
    niceScale, scaleLinear, svgEl, formatNumber,
    getColor, escapeHtml
} from './utils.js';

/* 生成平滑曲线路径（Catmull-Rom 转 Bezier）
   输入点数组 [{x, y}, ...]，输出 path 的 d 属性 */
function smoothPath(points) {
    if (points.length < 2) return '';

    let d = 'M ' + points[0].x + ' ' + points[0].y;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] || points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ' C ' + cp1x + ' ' + cp1y + ' ' + cp2x + ' ' + cp2y + ' ' + p2.x + ' ' + p2.y;
    }

    return d;
}

/* 折线路径（直线连） */
function straightPath(points) {
    if (points.length < 2) return '';
    let d = 'M ' + points[0].x + ' ' + points[0].y;
    for (let i = 1; i < points.length; i++) {
        d += ' L ' + points[i].x + ' ' + points[i].y;
    }
    return d;
}

/* 面积路径（首尾闭合到 x 轴） */
function areaPath(points, baseY) {
    if (points.length < 2) return '';
    let d = straightPath(points);
    d += ' L ' + points[points.length - 1].x + ' ' + baseY;
    d += ' L ' + points[0].x + ' ' + baseY;
    d += ' Z';
    return d;
}

export function renderLine(data, options) {
    const width  = options.width  || 640;
    const height = options.height || 400;

    const labels = data.labels || [];
    const values = data.values || [];

    // 组装 series
    const series = data.series && data.series.length
        ? data.series
        : (values.length
            ? [{ label: options.legend || '', values: values, color: options.color || null }]
            : []);

    const hasData = series.some(function (s) {
        return s.values && s.values.length > 0;
    });

    if (!hasData) {
        return '<div class="chart-error">没有数据</div>';
    }

    // 判断是否需要旋转 X 轴标签
    const needRotate = labels.some(function (l) {
        return String(l).length > 4;
    });

    const pad = {
        top: 44,
        right: 24,
        bottom: needRotate ? 80 : 56,
        left: 56
    };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;

    // 求数据范围（含负数）
    let maxVal = -Infinity;
    let minVal = Infinity;
    series.forEach(function (s) {
        s.values.forEach(function (v) {
            if (v > maxVal) maxVal = v;
            if (v < minVal) minVal = v;
        });
    });
    if (minVal > 0) minVal = 0;   // 数据都是正数时，Y 轴从 0 开始

    const scale = niceScale(minVal, maxVal, 5);
    const toY = scaleLinear([scale.min, scale.max], [pad.top + plotH, pad.top]);

    const itemCount = labels.length || (series[0] && series[0].values.length) || 0;
    if (itemCount === 0) {
        return '<div class="chart-error">没有可显示的数据项</div>';
    }

    // X 坐标
    const slotW = itemCount > 1 ? plotW / (itemCount - 1) : 0;
    const xAt = function (i) {
        if (itemCount === 1) return pad.left + plotW / 2;
        return pad.left + slotW * i;
    };

    const parts = [];
    parts.push('<svg viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="xMidYMid meet">');

    // 标题
    if (options.title) {
        parts.push(svgEl('text', {
            x: width / 2, y: 24,
            'text-anchor': 'middle',
            class: 'chart-title'
        }, escapeHtml(options.title)));
    }

    // 网格线 + Y 轴刻度
    scale.ticks.forEach(function (t) {
        const y = toY(t);
        parts.push(svgEl('line', {
            x1: pad.left, y1: y,
            x2: width - pad.right, y2: y,
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

    // Y 轴
    parts.push(svgEl('line', {
        x1: pad.left, y1: pad.top,
        x2: pad.left, y2: pad.top + plotH,
        class: 'axis-line'
    }));

    const smooth = options.smooth === 'true' || options.smooth === true;
    const area = options.area === 'true' || options.area === true;
    const showDot = !(options.dot === 'false' || options.dot === false);

    // 绘制每条线
    series.forEach(function (s, si) {
        const color = s.color || getColor(si, options.palette);
        const points = [];

        for (let i = 0; i < itemCount; i++) {
            const val = s.values[i];
            if (val === undefined || val === null || isNaN(val)) continue;
            points.push({
                x: xAt(i),
                y: toY(val),
                val: val,
                label: labels[i] !== undefined ? labels[i] : String(i + 1)
            });
        }

        if (points.length === 0) return;

        // 面积填充
        if (area) {
            parts.push(svgEl('path', {
                d: areaPath(points, pad.top + plotH),
                fill: color,
                'fill-opacity': 0.12,
                stroke: 'none'
            }));
        }

        // 折线
        const d = smooth ? smoothPath(points) : straightPath(points);
        parts.push(svgEl('path', {
            d: d,
            stroke: color,
            'stroke-width': 2,
            fill: 'none',
            'stroke-linejoin': 'round',
            'stroke-linecap': 'round',
            class: 'line-path'
        }));

        // 数据点
        if (showDot) {
            points.forEach(function (p) {
                const tip = (s.label ? s.label + ': ' : '') +
                    p.label + ': ' + formatNumber(p.val);

                parts.push(svgEl('circle', {
                    cx: p.x, cy: p.y, r: 4,
                    fill: '#ffffff',
                    stroke: color,
                    'stroke-width': 2,
                    class: 'line-point',
                    'data-tooltip': escapeHtml(tip)
                }));
            });
        }
    });

    // X 轴标签
    let step = 1;
    if (itemCount > 16) step = 3;
    else if (itemCount > 10) step = 2;

    const labelY = pad.top + plotH + 22;

    labels.forEach(function (label, i) {
        if (i % step !== 0) return;

        const x = xAt(i);
        const attrs = { x: x, y: labelY, class: 'axis-text' };

        if (needRotate) {
            attrs['text-anchor'] = 'end';
            attrs.transform = 'rotate(-30 ' + x + ' ' + labelY + ')';
        } else {
            attrs['text-anchor'] = 'middle';
        }

        parts.push(svgEl('text', attrs, escapeHtml(label)));
    });

    // 图例
    if (series.length > 1) {
        const legendY = height - 16;
        let legendX = pad.left;
        series.forEach(function (s, si) {
            const color = s.color || getColor(si, options.palette);

            // 短线
            parts.push(svgEl('line', {
                x1: legendX, y1: legendY - 4,
                x2: legendX + 16, y2: legendY - 4,
                stroke: color,
                'stroke-width': 2.5,
                'stroke-linecap': 'round'
            }));

            // 圆点
            parts.push(svgEl('circle', {
                cx: legendX + 8, cy: legendY - 4, r: 3,
                fill: '#ffffff',
                stroke: color,
                'stroke-width': 2
            }));

            // 文字
            parts.push(svgEl('text', {
                x: legendX + 22, y: legendY,
                class: 'legend-text'
            }, escapeHtml(s.label || '')));

            legendX += 22 + (s.label ? String(s.label).length * 12 + 24 : 24);
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
