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

    /* ==========================================================
       常量
       ========================================================== */
    const CALLOUT_ICONS = {
        info:    'fa-circle-info',
        warn:    'fa-triangle-exclamation',
        warning: 'fa-triangle-exclamation',
        danger:  'fa-circle-exclamation',
        error:   'fa-circle-exclamation',
        success: 'fa-circle-check',
        note:    'fa-note-sticky',
        tip:     'fa-lightbulb'
    };

    const THEME_VARS = [
        'accent', 'accent-hover', 'accent-bg',
        'text-primary', 'text-secondary', 'text-muted',
        'border-color', 'border-strong',
        'bg-primary', 'bg-secondary', 'bg-code'
    ];

    /* ==========================================================
       工具函数
       ========================================================== */
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
        let html = escapeHtml(text);
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    function parseFenceMeta(line) {
        const parts = (line || '').trim().split(/\s+/);
        const type = parts[0] || '';
        const attrs = {};
        parts.slice(1).forEach((p) => {
            const m = p.match(/^(\w+)=(.+)$/);
            if (m) attrs[m[1]] = m[2];
        });
        return { type, attrs };
    }

    /* ==========================================================
       颜色解析
       ========================================================== */
    function hexWithAlpha(hex, alpha) {
        let h = hex.replace('#', '');
        if (h.length === 3) h = h.split('').map((c) => c + c).join('');
        if (h.length !== 6) return null;
        const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
        return '#' + h + a;
    }

    function resolveColor(input) {
        if (!input) return null;
        const raw = input.trim();
        if (!raw) return null;

        // 十六进制
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) {
            return {
                color: raw,
                bg: hexWithAlpha(raw, 0.13),
                border: hexWithAlpha(raw, 0.35)
            };
        }

        // data.js 预设
        const preset = window.MetaKnowData?.colors || {};
        if (preset[raw]) {
            const c = preset[raw];
            return {
                color: c,
                bg: hexWithAlpha(c, 0.13),
                border: hexWithAlpha(c, 0.35)
            };
        }

        // 主题变量
        if (THEME_VARS.includes(raw)) {
            const v = `var(--${raw})`;
            return {
                color: v,
                bg: `color-mix(in srgb, ${v} 13%, transparent)`,
                border: `color-mix(in srgb, ${v} 35%, transparent)`
            };
        }

        // CSS 颜色名
        if (/^[a-z]+$/i.test(raw)) {
            return {
                color: raw,
                bg: `color-mix(in srgb, ${raw} 13%, transparent)`,
                border: `color-mix(in srgb, ${raw} 35%, transparent)`
            };
        }

        return null;
    }

    /* 块级组件：输出 CSS 变量（配合 CSS 里的 var(--xxx-color, ...)） */
    function colorToVars(c, prefix) {
        if (!c) return '';
        const parts = [];
        if (c.color)  parts.push(`${prefix}-color:${c.color}`);
        if (c.bg)     parts.push(`${prefix}-bg:${c.bg}`);
        if (c.border) parts.push(`${prefix}-border:${c.border}`);
        return parts.join(';');
    }

    /* 行内组件：输出直接属性（tag / badge / mark 直接用） */
    function colorToInline(c, opts = {}) {
        if (!c) return '';
        const parts = [];
        if (opts.color !== false && c.color) parts.push(`color:${c.color}`);
        if (opts.bg !== false && c.bg) parts.push(`background:${c.bg}`);
        if (opts.border !== false && c.border) parts.push(`border-color:${c.border}`);
        return parts.join(';');
    }

    /* ==========================================================
       块级组件
       ========================================================== */
    function renderCallout(codeEl) {
        const raw = codeEl.textContent;
        const lines = raw.split('\n');
        const meta = parseFenceMeta(lines[0]);
        const body = lines.slice(1).join('\n').trim();

        const type = meta.type || 'info';
        const icon = CALLOUT_ICONS[type] || CALLOUT_ICONS.info;
        const title = meta.attrs.标题 || meta.attrs.title || '';

        const colorInput = meta.attrs.颜色 || meta.attrs.color;
        const custom = colorInput ? resolveColor(colorInput) : null;
        const customVars = custom ? colorToVars(custom, '--callout') : '';
        const colorClass = custom ? '' : `callout-${type}`;

        return `
            <div class="callout ${colorClass}"${customVars ? ` style="${customVars}"` : ''}>
                <div class="callout-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="callout-body">
                    ${title ? `<div class="callout-title">${escapeHtml(title)}</div>` : ''}
                    <div class="callout-content">${renderInlineMd(body)}</div>
                </div>
            </div>
        `;
    }

    function renderCard(codeEl) {
        const raw = codeEl.textContent;
        const lines = raw.split('\n');
        const meta = parseFenceMeta(lines[0]);
        const body = lines.slice(1).join('\n').trim();

        const title = meta.attrs.标题 || meta.attrs.title || '';
        const icon = meta.attrs.图标 || meta.attrs.icon || '';
        const href = meta.attrs.链接 || meta.attrs.href || '';

        const colorInput = meta.attrs.颜色 || meta.attrs.color;
        const custom = colorInput ? resolveColor(colorInput) : null;
        const cardVars = custom ? colorToVars(custom, '--card') : '';

        const iconHtml = icon
            ? `<i class="fas fa-${escapeHtml(icon)}"></i>`
            : '';
        const titleHtml = title
            ? `<div class="card-head">${iconHtml}<span>${escapeHtml(title)}</span></div>`
            : '';
        const inner = `${titleHtml}<div class="card-body">${renderInlineMd(body)}</div>`;

        return href
            ? `<a class="mk-card" href="${escapeHtml(href)}"${cardVars ? ` style="${cardVars}"` : ''}>${inner}</a>`
            : `<div class="mk-card"${cardVars ? ` style="${cardVars}"` : ''}>${inner}</div>`;
    }

    function renderGrid(codeEl) {
        const raw = codeEl.textContent;
        const lines = raw.split('\n');
        const meta = parseFenceMeta(lines[0]);
        const cols = parseInt(meta.attrs.列数 || meta.attrs.cols || '2', 10);
        const cards = [];

        // 方案 A：新语法 ==card
        const newSyntax = raw.split(/^==card\s+/m).slice(1);
        if (newSyntax.length > 0) {
            newSyntax.forEach((block) => {
                const blockLines = block.split('\n');
                const firstLine = blockLines[0] || '';
                const rest = blockLines.slice(1).join('\n').trim();
                cards.push({ metaLine: firstLine, body: rest });
            });
        }

        // 方案 B：兜底旧语法 ```card（以防用户写老格式）
        if (cards.length === 0) {
            const cardRegex = /```card([\s\S]*?)```/g;
            let m;
            while ((m = cardRegex.exec(raw)) !== null) {
                const blockLines = m[1].trim().split('\n');
                const firstLine = blockLines[0] || '';
                const rest = blockLines.slice(1).join('\n').trim();
                cards.push({ metaLine: firstLine, body: rest });
            }
        }

        const cardsHtml = cards.map(({ metaLine, body }) => {
            const cardMeta = parseFenceMeta(metaLine);
            const title = cardMeta.attrs.标题 || cardMeta.attrs.title || '';
            const icon = cardMeta.attrs.图标 || cardMeta.attrs.icon || '';
            const href = cardMeta.attrs.链接 || cardMeta.attrs.href || '';
            const colorInput = cardMeta.attrs.颜色 || cardMeta.attrs.color;
            const custom = colorInput ? resolveColor(colorInput) : null;
            const cardVars = custom ? colorToVars(custom, '--card') : '';

            const iconHtml = icon ? `<i class="fas fa-${escapeHtml(icon)}"></i>` : '';
            const titleHtml = title
                ? `<div class="card-head">${iconHtml}<span>${escapeHtml(title)}</span></div>`
                : '';
            const inner = `${titleHtml}<div class="card-body">${renderInlineMd(body)}</div>`;

            return href
                ? `<a class="mk-card" href="${escapeHtml(href)}"${cardVars ? ` style="${cardVars}"` : ''}>${inner}</a>`
                : `<div class="mk-card"${cardVars ? ` style="${cardVars}"` : ''}>${inner}</div>`;
        }).join('');

        return `<div class="mk-grid" style="--cols:${cols}">${cardsHtml}</div>`;
    }

    function renderDetails(codeEl) {
        const raw = codeEl.textContent;
        const lines = raw.split('\n');
        const meta = parseFenceMeta(lines[0]);
        const body = lines.slice(1).join('\n').trim();
        const title = meta.attrs.标题 || meta.attrs.title || '展开';

        const colorInput = meta.attrs.颜色 || meta.attrs.color;
        const custom = colorInput ? resolveColor(colorInput) : null;
        const detVars = custom ? colorToVars(custom, '--details') : '';

        const id = 'det-' + Math.random().toString(36).slice(2, 8);

        return `
            <div class="mk-details"${detVars ? ` style="${detVars}"` : ''}>
                <button class="mk-details-toggle" data-target="${id}">
                    <i class="fas fa-chevron-right"></i>
                    <span>${escapeHtml(title)}</span>
                </button>
                <div class="mk-details-body" id="${id}">
                    <div class="mk-details-inner">${renderInlineMd(body)}</div>
                </div>
            </div>
        `;
    }

    function renderSteps(codeEl) {
        const raw = codeEl.textContent;
        const lines = raw.split('\n').filter((l) => l.trim());
        const items = lines.map((l) => l.replace(/^\d+[\.\)]\s*/, '').trim());

        const itemsHtml = items.map((item, i) => `
            <li class="mk-step">
                <span class="mk-step-num">${i + 1}</span>
                <div class="mk-step-content">${renderInlineMd(item)}</div>
            </li>
        `).join('');

        return `<ol class="mk-steps">${itemsHtml}</ol>`;
    }

    function renderTabs(codeEl) {
        const raw = codeEl.textContent;
        const sections = raw.split(/^==\s*(.+?)\s*==\s*$/gm);
        const tabs = [];
        for (let i = 1; i < sections.length; i += 2) {
            tabs.push({
                title: sections[i].trim(),
                content: (sections[i + 1] || '').trim()
            });
        }

        if (!tabs.length) return '<p style="color:var(--text-muted)">（tabs 内容为空）</p>';

        const id = 'tabs-' + Math.random().toString(36).slice(2, 8);

        const navHtml = tabs.map((t, i) =>
            `<button class="mk-tab${i === 0 ? ' active' : ''}" data-tab="${id}-${i}">${escapeHtml(t.title)}</button>`
        ).join('');

        const panelsHtml = tabs.map((t, i) =>
            `<div class="mk-tab-panel${i === 0 ? ' active' : ''}" data-panel="${id}-${i}">${renderInlineMd(t.content)}</div>`
        ).join('');

        return `
            <div class="mk-tabs" data-id="${id}">
                <div class="mk-tabs-nav">${navHtml}</div>
                <div class="mk-tabs-body">${panelsHtml}</div>
            </div>
        `;
    }

    /* ==========================================================
       块级处理入口
       ========================================================== */
    function processBlocks(container) {
        const blocks = container.querySelectorAll('pre > code[class*="language-"]');

        blocks.forEach((codeEl) => {
            const lang = codeEl.className.replace('language-', '').split(/\s+/)[0];

            let html = null;
            switch (lang) {
                case 'callout': html = renderCallout(codeEl); break;
                case 'card':    html = renderCard(codeEl);    break;
                case 'grid':    html = renderGrid(codeEl);    break;
                case 'details': html = renderDetails(codeEl); break;
                case 'steps':   html = renderSteps(codeEl);   break;
                case 'tabs':    html = renderTabs(codeEl);    break;
                default: return;
            }

            if (html !== null) {
                const pre = codeEl.parentNode;
                const wrapper = document.createElement('div');
                wrapper.innerHTML = html;
                pre.parentNode.replaceChild(wrapper.firstElementChild, pre);
            }
        });
    }

    /* ==========================================================
       行内处理
       ========================================================== */
    function processInline(container) {
        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    const p = node.parentNode;
                    if (!p) return NodeFilter.FILTER_REJECT;
                    const tag = p.nodeName.toLowerCase();
                    if (['code', 'pre', 'script', 'style', 'a'].includes(tag)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    if (!/\[\[[^\]]+\]\]/.test(node.nodeValue)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);

        nodes.forEach((node) => {
            const html = node.nodeValue.replace(
                /\[\[([^\]]+)\]\]/g,
                (match, inner) => {
                    const colonIdx = inner.indexOf(':');
                    if (colonIdx === -1) return match; // 双链，交给 resolveWikiLinks

                    const type = inner.slice(0, colonIdx).trim();
                    const rest = inner.slice(colonIdx + 1).trim();

                    const pipeIdx = rest.lastIndexOf('|');
                    const content = pipeIdx === -1 ? rest : rest.slice(0, pipeIdx).trim();
                    const param = pipeIdx === -1 ? '' : rest.slice(pipeIdx + 1).trim();

                    switch (type) {
                        case '标签':
                        case 'tag': {
                            const c = param ? resolveColor(param) : null;
                            const style = c ? colorToInline(c) : '';
                            return `<span class="mk-tag"${style ? ` style="${style}"` : ''}>${escapeHtml(content)}</span>`;
                        }
                        case '按键':
                        case 'kbd':
                            return `<kbd class="mk-kbd">${escapeHtml(content)}</kbd>`;
                        case '高亮':
                        case 'mark': {
                            const c = param ? resolveColor(param) : null;
                            const style = c ? `background:${c.bg};color:inherit` : '';
                            return `<mark class="mk-mark"${style ? ` style="${style}"` : ''}>${escapeHtml(content)}</mark>`;
                        }
                        case '徽章':
                        case 'badge': {
                            const c = param ? resolveColor(param) : null;
                            const style = c ? colorToInline(c) : '';
                            return `<span class="mk-badge"${style ? ` style="${style}"` : ''}>${escapeHtml(content)}</span>`;
                        }
                        case '图标':
                        case 'icon': {
                            const c = param ? resolveColor(param) : null;
                            const style = c ? `color:${c.color}` : '';
                            return `<i class="fas fa-${escapeHtml(content)} mk-icon"${style ? ` style="${style}"` : ''}></i>`;
                        }
                        case '链接':
                        case 'link':
                            return `<a class="mk-link" href="${escapeHtml(param)}">${escapeHtml(content)}</a>`;
                        default:
                            return match;
                    }
                }
            );

            if (html !== node.nodeValue) {
                const span = document.createElement('span');
                span.innerHTML = html;
                node.parentNode.replaceChild(span, node);
            }
        });
    }

    /* ==========================================================
       交互绑定
       ========================================================== */
    function bindInteractions(container) {
        container.querySelectorAll('.mk-details-toggle').forEach((btn) => {
            btn.addEventListener('click', () => {
                const target = document.getElementById(btn.dataset.target);
                if (!target) return;
                const wrap = btn.closest('.mk-details');
                const open = wrap.classList.toggle('open');
                target.style.maxHeight = open ? target.scrollHeight + 'px' : '0';
            });
        });

        container.querySelectorAll('.mk-tabs').forEach((tabsEl) => {
            tabsEl.querySelectorAll('.mk-tab').forEach((tab) => {
                tab.addEventListener('click', () => {
                    const id = tab.dataset.tab;
                    tabsEl.querySelectorAll('.mk-tab').forEach((t) => {
                        t.classList.toggle('active', t === tab);
                    });
                    tabsEl.querySelectorAll('.mk-tab-panel').forEach((p) => {
                        p.classList.toggle('active', p.dataset.panel === id);
                    });
                });
            });
        });
    }

    /* ==========================================================
       主入口
       ========================================================== */
    function renderComponents(root) {
        if (!root) root = document;
        processBlocks(root);
        processInline(root);
        bindInteractions(root);
    }

    window.MetaKnowComponents = {
        render: renderComponents,
        resolveColor,
        colorToVars,
        colorToInline
    };
})();
