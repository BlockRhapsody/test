// ============================================================
// MetaKnow · 组件系统
// 版本：V1.1
//
// 行内语法：[[类型:内容|参数]]
//   无类型：[[标题]]  → 双链
//   有类型：[[标签:文字|green]] [[按键:⌘K]] [[图标:rocket]] [[高亮:重点|yellow]]
//
// 块级语法：```callout info 颜色=red 标题=xxx
//   callout / card / grid / details / steps / tabs
//
// 颜色参数支持：
//   - 预设色名（green / success / warning）→ data.js colors
//   - 十六进制（#ff00ff）
//   - CSS 颜色名（red / blue）
//   - 主题变量（accent / text-primary）
// ============================================================

(function () {
    'use strict';

    var CALLOUT_ICONS = {
        info:    'fa-circle-info',
        warn:    'fa-triangle-exclamation',
        warning: 'fa-triangle-exclamation',
        danger:  'fa-circle-exclamation',
        error:   'fa-circle-exclamation',
        success: 'fa-circle-check',
        note:    'fa-note-sticky',
        tip:     'fa-lightbulb'
    };

    var THEME_VARS = [
        'accent', 'accent-hover', 'accent-bg',
        'text-primary', 'text-secondary', 'text-muted',
        'border-color', 'border-strong',
        'bg-primary', 'bg-secondary', 'bg-code'
    ];

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderInlineMd(text) {
        if (!text) return '';
        var html = escapeHtml(text);
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    function parseAttrs(line) {
        var parts = (line || '').trim().split(/\s+/);
        var attrs = {};
        var type = '';
        for (var i = 0; i < parts.length; i++) {
            var p = parts[i];
            var m = p.match(/^([\w\u4e00-\u9fa5]+)=(.+)$/);
            if (m) {
                attrs[m[1]] = m[2];
            } else if (i === 0 && p) {
                type = p;
            }
        }
        return { type: type, attrs: attrs };
    }

    function getFullText(codeEl) {
        var info = codeEl.dataset.info || '';
        var raw = codeEl.textContent || '';
        if (!info) return raw;
        return info + '\n' + raw;
    }

    function hexWithAlpha(hex, alpha) {
        var h = hex.replace('#', '');
        if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
        if (h.length !== 6) return null;
        var a = Math.round(alpha * 255).toString(16).padStart(2, '0');
        return '#' + h + a;
    }

    function resolveColor(input) {
        if (!input) return null;
        var raw = String(input).trim();
        if (!raw) return null;

        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) {
            return {
                color: raw,
                bg: hexWithAlpha(raw, 0.13),
                border: hexWithAlpha(raw, 0.35)
            };
        }

        var preset = (window.MetaKnowData && window.MetaKnowData.colors) || {};
        if (preset[raw]) {
            var c = preset[raw];
            return {
                color: c,
                bg: hexWithAlpha(c, 0.13),
                border: hexWithAlpha(c, 0.35)
            };
        }

        if (THEME_VARS.indexOf(raw) !== -1) {
            var v = 'var(--' + raw + ')';
            return {
                color: v,
                bg: 'color-mix(in srgb, ' + v + ' 13%, transparent)',
                border: 'color-mix(in srgb, ' + v + ' 35%, transparent)'
            };
        }

        if (/^[a-z]+$/i.test(raw)) {
            return {
                color: raw,
                bg: 'color-mix(in srgb, ' + raw + ' 13%, transparent)',
                border: 'color-mix(in srgb, ' + raw + ' 35%, transparent)'
            };
        }

        return null;
    }

    function colorToVars(c, prefix) {
        if (!c) return '';
        var parts = [];
        if (c.color)  parts.push(prefix + '-color:' + c.color);
        if (c.bg)     parts.push(prefix + '-bg:' + c.bg);
        if (c.border) parts.push(prefix + '-border:' + c.border);
        return parts.join(';');
    }

    function colorToInline(c) {
        if (!c) return '';
        var parts = [];
        if (c.color)  parts.push('color:' + c.color);
        if (c.bg)     parts.push('background:' + c.bg);
        if (c.border) parts.push('border-color:' + c.border);
        return parts.join(';');
    }

    function renderCallout(codeEl) {
        var raw = getFullText(codeEl);
        var lines = raw.split('\n');
        var firstLine = (lines[0] || '').trim();
        var rest = lines.slice(1).join('\n').trim();
        var type, attrs, body;

        if (/^type\s*=/.test(firstLine)) {
            var parsed = parseAttrs(firstLine);
            type = parsed.attrs.type || parsed.type || 'info';
            attrs = parsed.attrs;
            body = rest;
        } else if (/^[\w]+\s/.test(firstLine) && rest) {
            var parsed2 = parseAttrs(firstLine);
            type = parsed2.type || 'info';
            attrs = parsed2.attrs;
            body = rest;
        } else {
            type = 'info';
            attrs = {};
            body = raw.trim();
        }

        var icon = CALLOUT_ICONS[type] || CALLOUT_ICONS.info;
        var title = attrs.标题 || attrs.title || '';
        var colorInput = attrs.颜色 || attrs.color;
        var custom = colorInput ? resolveColor(colorInput) : null;
        var customVars = custom ? colorToVars(custom, '--callout') : '';
        var colorClass = custom ? '' : 'callout-' + type;

        return '<div class="callout ' + colorClass + '"' +
            (customVars ? ' style="' + customVars + '"' : '') + '>' +
            '<div class="callout-icon"><i class="fas ' + icon + '"></i></div>' +
            '<div class="callout-body">' +
            (title ? '<div class="callout-title">' + escapeHtml(title) + '</div>' : '') +
            '<div class="callout-content">' + renderInlineMd(body) + '</div>' +
            '</div></div>';
    }

    function buildCardHtml(attrs, body) {
        var title = attrs.标题 || attrs.title || '';
        var icon = attrs.图标 || attrs.icon || '';
        var href = attrs.链接 || attrs.href || '';
        var colorInput = attrs.颜色 || attrs.color;
        var custom = colorInput ? resolveColor(colorInput) : null;
        var cardVars = custom ? colorToVars(custom, '--card') : '';

        var iconHtml = icon ? '<i class="fas fa-' + escapeHtml(icon) + '"></i>' : '';
        var titleHtml = title
            ? '<div class="card-head">' + iconHtml + '<span>' + escapeHtml(title) + '</span></div>'
            : '';
        var inner = titleHtml + '<div class="card-body">' + renderInlineMd(body) + '</div>';

        if (href) {
            return '<a class="mk-card" href="' + escapeHtml(href) + '"' +
                (cardVars ? ' style="' + cardVars + '"' : '') + '>' + inner + '</a>';
        }
        return '<div class="mk-card"' +
            (cardVars ? ' style="' + cardVars + '"' : '') + '>' + inner + '</div>';
    }

    function renderCard(codeEl) {
        var raw = getFullText(codeEl);
        var lines = raw.split('\n');
        var attrs = parseAttrs(lines[0] || '').attrs;
        var body = lines.slice(1).join('\n').trim();
        return buildCardHtml(attrs, body);
    }

    function renderGrid(codeEl) {
        var raw = getFullText(codeEl);
        var lines = raw.split('\n');
        var firstLine = (lines[0] || '').trim();
        var cols = 2;
        var bodyStart = 1;

        if (/列数|cols/.test(firstLine)) {
            var attrs = parseAttrs(firstLine).attrs;
            cols = parseInt(attrs.列数 || attrs.cols || '2', 10);
        } else if (firstLine && !/^:::/.test(firstLine)) {
            bodyStart = 0;
        } else {
            bodyStart = 1;
        }

        var body = lines.slice(bodyStart).join('\n');
        var cardBlocks = body.split(/^:::\s*card\s*/m).slice(1);
        var cards = [];

        if (cardBlocks.length > 0) {
            cards = cardBlocks.map(function (block) {
                var blockLines = block.split('\n');
                var attrsLine = blockLines[0] || '';
                var content = blockLines.slice(1).join('\n').trim();
                var cardAttrs = parseAttrs(attrsLine).attrs;
                return buildCardHtml(cardAttrs, content);
            });
        } else {
            var oldRegex = /```card([\s\S]*?)```/g;
            var m;
            while ((m = oldRegex.exec(body)) !== null) {
                var blockLines2 = m[1].trim().split('\n');
                var attrsLine2 = blockLines2[0] || '';
                var content2 = blockLines2.slice(1).join('\n').trim();
                var cardAttrs2 = parseAttrs(attrsLine2).attrs;
                cards.push(buildCardHtml(cardAttrs2, content2));
            }
        }

        return '<div class="mk-grid" style="--cols:' + cols + '">' + cards.join('') + '</div>';
    }

    function renderDetails(codeEl) {
        var raw = getFullText(codeEl);
        var lines = raw.split('\n');
        var attrs = parseAttrs(lines[0] || '').attrs;
        var body = lines.slice(1).join('\n').trim();

        var title = attrs.标题 || attrs.title || '展开';
        var colorInput = attrs.颜色 || attrs.color;
        var custom = colorInput ? resolveColor(colorInput) : null;
        var detVars = custom ? colorToVars(custom, '--details') : '';
        var id = 'det-' + Math.random().toString(36).slice(2, 8);

        return '<div class="mk-details"' +
            (detVars ? ' style="' + detVars + '"' : '') + '>' +
            '<button class="mk-details-toggle" type="button" data-target="' + id + '">' +
            '<i class="fas fa-chevron-right"></i>' +
            '<span>' + escapeHtml(title) + '</span>' +
            '</button>' +
            '<div class="mk-details-body" id="' + id + '">' +
            '<div class="mk-details-inner">' + renderInlineMd(body) + '</div>' +
            '</div></div>';
    }

    function renderSteps(codeEl) {
        var raw = getFullText(codeEl);
        var lines = raw.split('\n').filter(function (l) { return l.trim(); });
        var items = lines.map(function (l) {
            return l.replace(/^\d+[\.\)]\s*/, '').trim();
        });

        var itemsHtml = items.map(function (item, i) {
            return '<li class="mk-step">' +
                '<span class="mk-step-num">' + (i + 1) + '</span>' +
                '<div class="mk-step-content">' + renderInlineMd(item) + '</div>' +
                '</li>';
        }).join('');

        return '<ol class="mk-steps">' + itemsHtml + '</ol>';
    }

    function renderTabs(codeEl) {
        var raw = getFullText(codeEl);
        var parts = raw.split(/^:::\s*tab\s+(.+)$/m);
        var tabs = [];

        for (var i = 1; i < parts.length; i += 2) {
            tabs.push({
                title: (parts[i] || '').trim(),
                content: (parts[i + 1] || '').trim()
            });
        }

        if (!tabs.length) {
            var sections = raw.split(/^==\s*(.+?)\s*==\s*$/gm);
            for (var j = 1; j < sections.length; j += 2) {
                tabs.push({
                    title: sections[j].trim(),
                    content: (sections[j + 1] || '').trim()
                });
            }
        }

        if (!tabs.length) {
            return '<p style="color:var(--text-muted)">（tabs 内容为空）</p>';
        }

        var id = 'tabs-' + Math.random().toString(36).slice(2, 8);

        var navHtml = tabs.map(function (t, i) {
            return '<button class="mk-tab' + (i === 0 ? ' active' : '') +
                '" type="button" data-tab="' + id + '-' + i + '">' +
                escapeHtml(t.title) + '</button>';
        }).join('');

        var panelsHtml = tabs.map(function (t, i) {
            return '<div class="mk-tab-panel' + (i === 0 ? ' active' : '') +
                '" data-panel="' + id + '-' + i + '">' +
                renderInlineMd(t.content) + '</div>';
        }).join('');

        return '<div class="mk-tabs" data-id="' + id + '">' +
            '<div class="mk-tabs-nav">' + navHtml + '</div>' +
            '<div class="mk-tabs-body">' + panelsHtml + '</div>' +
            '</div>';
    }

    async function processBlocks(container) {
        const blocks = container.querySelectorAll('pre > code[class*="language-"]');

        for (const codeEl of blocks) {
            const lang = codeEl.className.replace('language-', '').split(/\s+/)[0];

            let html = null;
            switch (lang) {
                case 'callout': html = renderCallout(codeEl); break;
                case 'card':    html = renderCard(codeEl);    break;
                case 'grid':    html = renderGrid(codeEl);    break;
                case 'details': html = renderDetails(codeEl); break;
                case 'steps':   html = renderSteps(codeEl);   break;
                case 'tabs':    html = renderTabs(codeEl);    break;
                case 'chart':   html = await renderChartAsync(codeEl); break;
                default: continue;
            }

            if (html !== null) {
                const pre = codeEl.parentNode;
                const wrapper = document.createElement('div');
                wrapper.innerHTML = html.trim();
                if (wrapper.firstElementChild) {
                    pre.parentNode.replaceChild(wrapper.firstElementChild, pre);
                }
            }
        }
    }

    async function renderChartAsync(codeEl) {
        try {
            const mod = await import('./charts/index.js');
            return mod.renderChart(codeEl);
        } catch (e) {
            console.error('[MetaKnow] 图表加载失败:', e);
            return '<div class="chart-error">图表加载失败</div>';
        }
    }

    async function bindChartTooltipsAsync(root) {
        if (!root.querySelector('.mk-chart')) return;
        try {
            const mod = await import('./charts/index.js');
            mod.bindChartTooltips(root);
        } catch (e) { /* ignore */ }
    }

    function processInline(container) {
        var walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function (node) {
                    var p = node.parentNode;
                    if (!p) return NodeFilter.FILTER_REJECT;
                    var tag = p.nodeName.toLowerCase();
                    if (['code', 'pre', 'script', 'style', 'a'].indexOf(tag) !== -1) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    if (!/\[\[[^\]]+\]\]/.test(node.nodeValue)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        var nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);

        nodes.forEach(function (node) {
            var html = node.nodeValue.replace(
                /\[\[([^\]]+)\]\]/g,
                function (match, inner) {
                    var colonIdx = inner.indexOf(':');
                    if (colonIdx === -1) return match;

                    var type = inner.slice(0, colonIdx).trim();
                    var rest = inner.slice(colonIdx + 1).trim();
                    var pipeIdx = rest.lastIndexOf('|');
                    var content = pipeIdx === -1 ? rest : rest.slice(0, pipeIdx).trim();
                    var param = pipeIdx === -1 ? '' : rest.slice(pipeIdx + 1).trim();

                    switch (type) {
                        case '标签':
                        case 'tag': {
                            var c = param ? resolveColor(param) : null;
                            var style = c ? colorToInline(c) : '';
                            return '<span class="mk-tag"' +
                                (style ? ' style="' + style + '"' : '') + '>' +
                                escapeHtml(content) + '</span>';
                        }
                        case '按键':
                        case 'kbd':
                            return '<kbd class="mk-kbd">' + escapeHtml(content) + '</kbd>';
                        case '高亮':
                        case 'mark': {
                            var c2 = param ? resolveColor(param) : null;
                            var style2 = c2 ? 'background:' + c2.bg + ';color:inherit' : '';
                            return '<mark class="mk-mark"' +
                                (style2 ? ' style="' + style2 + '"' : '') + '>' +
                                escapeHtml(content) + '</mark>';
                        }
                        case '徽章':
                        case 'badge': {
                            var c3 = param ? resolveColor(param) : null;
                            var style3 = c3 ? colorToInline(c3) : '';
                            return '<span class="mk-badge"' +
                                (style3 ? ' style="' + style3 + '"' : '') + '>' +
                                escapeHtml(content) + '</span>';
                        }
                        case '图标':
                        case 'icon': {
                            var c4 = param ? resolveColor(param) : null;
                            var style4 = c4 ? 'color:' + c4.color : '';
                            return '<i class="fas fa-' + escapeHtml(content) + ' mk-icon"' +
                                (style4 ? ' style="' + style4 + '"' : '') + '></i>';
                        }
                      case '链接':
                      case 'link':
                          return '<a class="mk-link" href="' + escapeHtml(param) + '">' +
                              escapeHtml(content) + '</a>';
                      case '外链':
                      case 'external':
                      case 'newtab':
                          return '<a class="mk-link mk-link-external" href="' + escapeHtml(param) +
                              '" target="_blank" rel="noopener noreferrer">' +
                              escapeHtml(content) +
                              ' <i class="fas fa-arrow-up-right-from-square"></i></a>';
                    }
                }
            );

            if (html !== node.nodeValue) {
                var span = document.createElement('span');
                span.innerHTML = html;
                node.parentNode.replaceChild(span, node);
            }
        });
    }

    function bindInteractions(container) {
        container.querySelectorAll('.mk-details-toggle').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var target = document.getElementById(btn.dataset.target);
                if (!target) return;
                var wrap = btn.closest('.mk-details');
                var open = wrap.classList.toggle('open');

                if (open) {
                    target.style.maxHeight = 'none';
                    var h = target.scrollHeight;
                    target.style.maxHeight = '0';
                    void target.offsetHeight;
                    target.style.maxHeight = h + 'px';
                } else {
                    target.style.maxHeight = '0';
                }
            });
        });

        container.querySelectorAll('.mk-tabs').forEach(function (tabsEl) {
            tabsEl.querySelectorAll('.mk-tab').forEach(function (tab) {
                tab.addEventListener('click', function () {
                    var id = tab.dataset.tab;
                    tabsEl.querySelectorAll('.mk-tab').forEach(function (t) {
                        t.classList.toggle('active', t === tab);
                    });
                    tabsEl.querySelectorAll('.mk-tab-panel').forEach(function (p) {
                        p.classList.toggle('active', p.dataset.panel === id);
                    });
                });
            });
        });
    }

    async function renderComponents(root) {
        if (!root) root = document;
        await processBlocks(root);
        processInline(root);
        bindInteractions(root);
        await bindChartTooltipsAsync(root);
    }

    window.MetaKnowComponents = {
        render: renderComponents,
        resolveColor: resolveColor,
        colorToVars: colorToVars,
        colorToInline: colorToInline
    };
})();
