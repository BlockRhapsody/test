// ============================================================
// MetaKnow · 交互与逻辑
// 版本：V1.1
// URL 用短 key，pageMap 映射到真实路径
// ============================================================

(function () {
    'use strict';

    /* ==========================================================
       常量与工具
       ========================================================== */
    const THEME_KEY = 'mk_theme';
    const SIDEBAR_KEY = 'mk_sidebar_state';
    const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 分钟

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /* ==========================================================
       规范化 navigation item
       字符串 '快速开始' → { title: '快速开始', path: '快速开始' }
       对象也兼容，path 缺省时用 title
       ========================================================== */
    function normalizeItem(item) {
        if (typeof item === 'string') {
            return { title: item, path: item };
        }
        return {
            title: item.title || item.path || '',
            path: item.path || item.title || ''
        };
    }

    function highlight(text, query) {
        if (!query) return escapeHtml(text);
        const escaped = escapeHtml(text);
        const q = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(${q})`, 'gi');
        return escaped.replace(re, '<mark>$1</mark>');
    }

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /* ==========================================================
       全局状态
       ========================================================== */
    const state = {
        currentPath: null,
        sidebarOpen: false,
        searchOpen: false,
        searchIndex: 0,
        searchResults: []
    };

    /* ==========================================================
       主题管理
       ========================================================== */
    function getStoredTheme() {
        try {
            const saved = localStorage.getItem(THEME_KEY);
            if (saved === 'light' || saved === 'dark') return saved;
        } catch {}
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch {}
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);

        const btn = $('#themeBtn');
        if (btn && !prefersReducedMotion()) {
            btn.animate(
                [
                    { transform: 'rotate(0deg) scale(1)' },
                    { transform: 'rotate(180deg) scale(0.85)' },
                    { transform: 'rotate(360deg) scale(1)' }
                ],
                { duration: 450, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
            );
        }
    }

    /* ==========================================================
       侧边栏状态记忆
       ========================================================== */
    function saveSidebarState() {
        const open = [];
        $$('.nav-category-toggle.open').forEach((toggle) => {
            const title = toggle.querySelector('.cat-title')?.textContent?.trim();
            if (title) open.push(title);
        });
        try {
            sessionStorage.setItem(SIDEBAR_KEY, JSON.stringify(open));
        } catch {}
    }

    function restoreSidebarState() {
        let open = [];
        try {
            const raw = sessionStorage.getItem(SIDEBAR_KEY);
            if (raw) open = JSON.parse(raw);
        } catch {}

        $$('.nav-category-toggle').forEach((toggle) => {
            const title = toggle.querySelector('.cat-title')?.textContent?.trim();
            const submenu = toggle.nextElementSibling;
            if (open.includes(title)) {
                toggle.classList.add('open');
                if (submenu) submenu.classList.add('open');
            }
        });
    }

    /* ==========================================================
       侧边栏渲染
       ========================================================== */
    function renderSidebar() {
        const data = window.MetaKnowData;
        const nav = $('#sidebarNav');
        const footer = $('#sidebarFooter');
        if (!nav) return;

        const navigation = data?.navigation || [];
        const hasContent = navigation.some(
            (cat) => cat.items && cat.items.length > 0
        );

        if (!hasContent) {
            nav.innerHTML = `
                <div class="sidebar-empty" style="
                    padding: 2rem 1rem;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 0.82rem;
                    line-height: 1.7;
                ">
                    <i class="fas fa-folder-open" style="
                        display: block;
                        font-size: 1.6rem;
                        margin-bottom: 0.8rem;
                        opacity: 0.5;
                    "></i>
                    <p>还没有内容</p>
                    <p style="font-size: 0.75rem; opacity: 0.7; margin-top: 0.3rem;">
                        在 <code style="
                            font-family: var(--font-mono);
                            font-size: 0.72rem;
                            padding: 0.1rem 0.35rem;
                            background: var(--bg-code);
                            border-radius: 4px;
                        ">data.js</code> 中注册页面
                    </p>
                </div>
            `;
        } else {
            let html = '<ul>';
            navigation.forEach((category) => {
                if (!category.items || category.items.length === 0) return;

                html += '<li class="nav-category">';
                html += '<button class="nav-category-toggle" type="button">';
                html += `<i class="fas fa-${category.icon || 'folder'} cat-icon"></i>`;
                html += `<span class="cat-title">${escapeHtml(category.title)}</span>`;
                html += '<i class="fas fa-chevron-right cat-arrow"></i>';
                html += '</button>';
                html += '<ul class="nav-submenu">';
                category.items.forEach((rawItem) => {
                    const item = normalizeItem(rawItem);
                    html += `<li><a href="#${encodeURI(item.path)}" data-path="${escapeHtml(item.path)}">${escapeHtml(item.title)}</a></li>`;
                });
                html += '</ul></li>';
            });
            html += '</ul>';
            nav.innerHTML = html;
        }

        if (footer) {
            const version = data?.site?.version || '1.0.0';
            footer.innerHTML = `<span class="version"><i class="fas fa-code-branch"></i> v${escapeHtml(version)}</span>`;
        }

        bindSidebarEvents();
    }

    function bindSidebarEvents() {
        $$('.nav-category-toggle').forEach((toggle) => {
            toggle.addEventListener('click', () => {
                const submenu = toggle.nextElementSibling;
                toggle.classList.toggle('open');
                if (submenu) submenu.classList.toggle('open');
                saveSidebarState();
            });
        });
    }

    /* ==========================================================
       移动端侧边栏
       ========================================================== */
    function lockScroll() {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.setProperty('--scrollbar-width', scrollbarWidth + 'px');
        document.body.classList.add('scroll-locked');
    }

    function unlockScroll() {
        document.body.classList.remove('scroll-locked');
        document.documentElement.style.removeProperty('--scrollbar-width');
    }

    function openMobileSidebar() {
        state.sidebarOpen = true;
        $('#sidebar')?.classList.add('open');
        $('#mobileOverlay')?.classList.add('active');
        $('#hamburgerBtn')?.classList.add('open');
        $('#hamburgerBtn')?.setAttribute('aria-expanded', 'true');
        lockScroll();
    }

    function closeMobileSidebar() {
        state.sidebarOpen = false;
        $('#sidebar')?.classList.remove('open');
        $('#mobileOverlay')?.classList.remove('active');
        $('#hamburgerBtn')?.classList.remove('open');
        $('#hamburgerBtn')?.setAttribute('aria-expanded', 'false');
        unlockScroll();
    }

    function toggleMobileSidebar() {
        state.sidebarOpen ? closeMobileSidebar() : openMobileSidebar();
    }

    /* ==========================================================
       桌面端侧边栏展开/收起
       ========================================================== */
    const DESKTOP_SIDEBAR_KEY = 'mk_desktop_sidebar';

    function getDesktopSidebarOpen() {
        try {
            const saved = localStorage.getItem(DESKTOP_SIDEBAR_KEY);
            if (saved !== null) return saved === '1';
        } catch {}
        return true; // 默认展开
    }

    function setDesktopSidebar(open) {
        const sidebar = $('#sidebar');
        const wrapper = $('#mainWrapper');
        if (!sidebar || !wrapper) return;

        sidebar.classList.toggle('collapsed', !open);
        wrapper.classList.toggle('sidebar-collapsed', !open);

        try {
            localStorage.setItem(DESKTOP_SIDEBAR_KEY, open ? '1' : '0');
        } catch {}
    }

    function toggleDesktopSidebar() {
        const isOpen = !$('#sidebar')?.classList.contains('collapsed');
        setDesktopSidebar(!isOpen);
    }

    /* ==========================================================
       搜索
       ========================================================== */
    function performSearch(query) {
        const data = window.MetaKnowData;
        if (!data?.searchIndex) return [];

        const q = query.trim().toLowerCase();
        if (!q) return data.searchIndex.slice(0, 8);

        return data.searchIndex
            .map((item) => {
                const title = (item.title || '').toLowerCase();
                const summary = (item.summary || '').toLowerCase();
                const category = (item.category || '').toLowerCase();
                let score = 0;

                if (title === q) score += 100;
                else if (title.includes(q)) score += 50;
                if (summary.includes(q)) score += 20;
                if (category.includes(q)) score += 10;

                return { item, score };
            })
            .filter((r) => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 12)
            .map((r) => r.item);
    }

    function renderSearchResults(results, query) {
        const panel = $('#searchResults');
        if (!panel) return;

        if (!results.length) {
            panel.innerHTML = `
                <div class="search-empty">
                    <i class="fas fa-search"></i>
                    <p>${query ? '没有找到匹配的内容' : '还没有任何页面'}</p>
                </div>
            `;
            return;
        }

        let html = '<div class="search-results-inner">';
        results.forEach((item, i) => {
            // item.path 是短 key
            html += `
                <a class="search-result-item${i === state.searchIndex ? ' sel' : ''}"
                   href="#${encodeURI(item.path)}"
                   data-index="${i}"
                   style="animation-delay:${i * 25}ms">
                    <div class="search-result-icon">
                        <i class="fas fa-file-lines"></i>
                    </div>
                    <div class="search-result-body">
                        <div class="search-result-title">${highlight(item.title, query)}</div>
                        ${item.summary ? `<div class="search-result-desc">${highlight(item.summary, query)}</div>` : ''}
                        ${item.category ? `<span class="search-result-category">${escapeHtml(item.category)}</span>` : ''}
                    </div>
                </a>
            `;
        });
        html += '</div>';
        panel.innerHTML = html;
    }

    function openSearchPanel() {
        const panel = $('#searchResults');
        if (!panel) return;
        panel.classList.add('show');
        state.searchOpen = true;
    }

    function closeSearchPanel() {
        const panel = $('#searchResults');
        if (!panel) return;
        panel.classList.remove('show');
        state.searchOpen = false;
        state.searchIndex = 0;
    }

    function updateSearchSelection() {
        const items = $$('.search-result-item');
        items.forEach((el, i) => {
            el.classList.toggle('sel', i === state.searchIndex);
        });
        const sel = items[state.searchIndex];
        if (sel) sel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function initSearch() {
        const wrapper = $('#searchWrapper');
        const input = $('#searchInput');
        const clearBtn = $('#searchClear');
        const panel = $('#searchResults');
        if (!input || !wrapper || !panel) return;

        input.addEventListener('focus', () => {
            const results = performSearch(input.value);
            state.searchIndex = 0;
            state.searchResults = results;
            renderSearchResults(results, input.value);
            openSearchPanel();
        });

        input.addEventListener('input', () => {
            wrapper.classList.toggle('has-text', input.value.length > 0);
            const results = performSearch(input.value);
            state.searchIndex = 0;
            state.searchResults = results;
            renderSearchResults(results, input.value);
            openSearchPanel();
        });

        input.addEventListener('keydown', (e) => {
            const results = state.searchResults;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!results.length) return;
                state.searchIndex = (state.searchIndex + 1) % results.length;
                updateSearchSelection();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (!results.length) return;
                state.searchIndex = (state.searchIndex - 1 + results.length) % results.length;
                updateSearchSelection();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const item = results[state.searchIndex];
                if (item) {
                    location.hash = '#' + encodeURI(item.path);
                    closeSearchPanel();
                    input.blur();
                }
            } else if (e.key === 'Escape') {
                closeSearchPanel();
                input.blur();
            }
        });

        clearBtn?.addEventListener('click', () => {
            input.value = '';
            wrapper.classList.remove('has-text');
            closeSearchPanel();
            input.focus();
        });

        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target) && !panel.contains(e.target)) {
                closeSearchPanel();
            }
        });

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                input.focus();
                input.select();
            }
        });

        panel.addEventListener('click', (e) => {
            const item = e.target.closest('.search-result-item');
            if (item) {
                closeSearchPanel();
                input.blur();
            }
        });

        panel.addEventListener('pointermove', (e) => {
            const item = e.target.closest('.search-result-item');
            if (!item) return;
            const idx = +item.dataset.index;
            if (idx !== state.searchIndex) {
                state.searchIndex = idx;
                updateSearchSelection();
            }
        });
    }

    /* ==========================================================
       Markdown 渲染
       ========================================================== */
    function configureMarked() {
        if (typeof marked === 'undefined') return;
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: false,
            mangle: false
        });
    }

    function renderMarkdown(md) {
        if (typeof marked === 'undefined') {
            return '<pre>' + escapeHtml(md) + '</pre>';
        }

        let body = md;
        if (body.startsWith('---')) {
            const end = body.indexOf('\n---', 3);
            if (end !== -1) {
                body = body.slice(end + 4).replace(/^\s*\n/, '');
            }
        }

        try {
            return marked.parse(body);
        } catch (e) {
            console.warn('[MetaKnow] Markdown 解析失败:', e);
            return '<pre>' + escapeHtml(body) + '</pre>';
        }
    }

    function stripMarkedStyles(html) {
        return html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/\sclass="[^"]*marked[^"]*"/gi, '');
    }

    /* ==========================================================
       Wiki 双链语法 [[页面标题]]
       ========================================================== */
    function resolveWikiLinks(html) {
        const data = window.MetaKnowData;
        if (!data?.searchIndex) return html;

        return html.replace(/\[\[([^\]]+)\]\]/g, (match, title) => {
            const name = title.trim();
            const found = data.searchIndex.find((item) => item.title === name);
            if (found) {
                // found.path 是短 key，直接作为 href
                return `<a href="#${encodeURI(found.path)}">${name}</a>`;
            }
            return `<span class="wiki-link-broken" title="未找到页面">${name}</span>`;
        });
    }

    /* ==========================================================
       Giscus 评论区
       ========================================================== */
    function loadGiscus(path) {
        const container = $('#giscus-container');
        if (!container) return;

        container.innerHTML = '';

        // 首页不显示评论区
        if (!path || path === '/') return;

        const mount = document.createElement('div');
        mount.className = 'giscus';
        container.appendChild(mount);

        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.setAttribute('data-repo', 'BlockRhapsody/test');
        script.setAttribute('data-repo-id', 'R_kgDOUBIrTA');
        script.setAttribute('data-category', 'Announcements');
        script.setAttribute('data-category-id', 'DIC_kwDOUBIrTM4DGaTx');
        script.setAttribute('data-mapping', 'specific');
        script.setAttribute('data-term', path);   // 短 key 作为 term
        script.setAttribute('data-strict', '0');
        script.setAttribute('data-reactions-enabled', '1');
        script.setAttribute('data-emit-metadata', '0');
        script.setAttribute('data-input-position', 'top');
        script.setAttribute('data-theme', 'preferred_color_scheme');
        script.setAttribute('data-lang', 'zh-CN');
        script.setAttribute('crossorigin', 'anonymous');
        script.async = true;

        container.appendChild(script);
    }

    /* ==========================================================
       页面渲染
       ========================================================== */
    const contentRoot = () => $('#content-root');

    function renderWelcome() {
        const data = window.MetaKnowData;
        const site = data?.site || {};
        document.title = site.title || 'MetaKnow';
        state.currentPath = null;

        const root = contentRoot();
        if (!root) return;

        root.innerHTML = `
            <section class="welcome">
                <div class="welcome-mark">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2.2"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 3 3 8l9 5 9-5-9-5Z"/>
                        <path d="m3 16 9 5 9-5"/>
                        <path d="m3 12 9 5 9-5"/>
                    </svg>
                </div>
                <h1>${escapeHtml(site.title || 'MetaKnow')}</h1>
                <p class="tagline">${escapeHtml(site.description || '现代知识库引擎')}</p>

                <div class="welcome-hint">
                    <i class="fas fa-sparkles"></i>
                    <span>还没有内容，从下面三步开始</span>
                </div>

                <div class="welcome-steps">
                    <div class="welcome-step">
                        <span class="step-num">1</span>
                        <div class="step-body">
                            <div class="step-title">创建内容</div>
                            <div class="step-desc">
                                在 <code>pages/</code> 目录下新建 <code>.md</code> 或 <code>.html</code> 文件
                            </div>
                        </div>
                    </div>
                    <div class="welcome-step">
                        <span class="step-num">2</span>
                        <div class="step-body">
                            <div class="step-title">注册页面</div>
                            <div class="step-desc">
                                在 <code>data.js</code> 的 <code>pageMap</code> 与 <code>navigation</code> 中加入条目
                            </div>
                        </div>
                    </div>
                    <div class="welcome-step">
                        <span class="step-num">3</span>
                        <div class="step-body">
                            <div class="step-title">添加搜索</div>
                            <div class="step-desc">
                                在 <code>searchIndex</code> 中补充标题与摘要
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;

        const giscus = $('#giscus-container');
        if (giscus) giscus.innerHTML = '';
        const toc = $('#desktopToc');
        if (toc) toc.style.display = 'none';
    }

    /* ==========================================================
       右侧目录
       ========================================================== */
    function renderToc() {
        const tocNav = $('#tocNav');
        const tocContainer = $('#desktopToc');
        if (!tocNav || !tocContainer) return;

        const article = document.querySelector('.article');
        if (!article) {
            tocNav.innerHTML = '';
            tocContainer.style.display = 'none';
            return;
        }

        const headings = article.querySelectorAll('h2, h3');
        if (headings.length === 0) {
            tocNav.innerHTML = '';
            tocContainer.style.display = 'none';
            return;
        }

        // 恢复显示（因为可能是从首页切回来）
        tocContainer.style.display = '';

        let html = '';
        headings.forEach((h, i) => {
            if (!h.id) {
                h.id = 'heading-' + i;
            }
            const cls = h.tagName === 'H2' ? 'toc-h2' : 'toc-h3';
            // h3 缩进一点
            const indent = h.tagName === 'H3' ? 'padding-left:1.6rem;' : '';
            html += `<a href="#${h.id}" data-target="${h.id}" class="${cls}" style="${indent}">${h.textContent}</a>`;
        });
        tocNav.innerHTML = html;

        // 点击目录项平滑滚动
        tocNav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.getElementById(link.dataset.target);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    tocNav.querySelectorAll('a').forEach((a) => a.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });

        // 滚动高亮
        setupTocScrollSpy(headings);
    }

    function setupTocScrollSpy(headings) {
        const tocNav = $('#tocNav');
        if (!tocNav) return;

        // 断开之前的 observer（避免切页面后重复）
        if (window.__tocObserver) {
            window.__tocObserver.disconnect();
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        tocNav.querySelectorAll('a').forEach((a) => {
                            a.classList.toggle('active', a.dataset.target === id);
                        });
                    }
                });
            },
            {
                rootMargin: '-80px 0px -70% 0px',
                threshold: 0
            }
        );

        headings.forEach((h) => observer.observe(h));
        window.__tocObserver = observer;
    }

    function renderLoading() {
        const root = contentRoot();
        if (root) {
            root.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <span>加载中…</span>
                </div>
            `;
        }
        const giscus = $('#giscus-container');
        if (giscus) giscus.innerHTML = '';
    }

    function renderNotFound(path) {
        const root = contentRoot();
        if (!root) return;

        document.title = '页面不存在 · MetaKnow';

        root.innerHTML = `
            <div class="not-found">
                <div class="not-found-icon">
                    <i class="fas fa-compass"></i>
                </div>
                <h1>404</h1>
                <p class="nf-title">找不到这个页面</p>
                <p class="nf-desc">
                    你访问的页面可能已被移动、删除，或从未存在过。
                </p>
                <div class="nf-path">${escapeHtml(path)}</div>
                <div class="nf-actions">
                    <a href="#/" class="btn btn-primary">
                        <i class="fas fa-home"></i>
                        返回首页
                    </a>
                    <a href="https://github.com/BlockRhapsody" target="_blank" class="btn btn-secondary">
                        <i class="fas fa-circle-exclamation"></i>
                        反馈问题
                    </a>
                </div>
            </div>
        `;

        const giscus = $('#giscus-container');
        if (giscus) giscus.innerHTML = '';
        
        const toc = $('#desktopToc');
        if (toc) toc.style.display = 'none';
    }

    async function renderPage(path) {
        if (!path || path === '/' || path === '') {
            renderWelcome();
            return;
        }

        const data = window.MetaKnowData;

        /* 短 key → 真实路径 */
        let realPath = path;
        if (data?.pageMap && data.pageMap[path]) {
            realPath = data.pageMap[path];
        }

        state.currentPath = path;   // 状态用短 key
        renderLoading();

        // 找标题（用短 key 匹配 searchIndex）
        let pageTitle = path;
        if (data?.searchIndex) {
            const found = data.searchIndex.find((item) => item.path === path);
            if (found) pageTitle = found.title;
        }
        document.title = `${pageTitle} · ${data?.site?.title || 'MetaKnow'}`;

        /* 缓存 key 用短 key */
        const cacheKey = 'mk_cache_' + path;
        const cacheTimeKey = cacheKey + '_time';

        try {
            let content = null;
            const cached = sessionStorage.getItem(cacheKey);
            const cacheTime = sessionStorage.getItem(cacheTimeKey);

            if (cached && cacheTime && Date.now() - parseInt(cacheTime) < CACHE_MAX_AGE) {
                content = cached;
            } else {
                /* 用 realPath 去 fetch */
                const response = await fetch(realPath);
                if (!response.ok) {
                    if (response.status === 404) {
                        renderNotFound(path);
                        return;
                    }
                    throw new Error(`HTTP ${response.status}`);
                }
                content = await response.text();
                try {
                    sessionStorage.setItem(cacheKey, content);
                    sessionStorage.setItem(cacheTimeKey, String(Date.now()));
                } catch {}
            }

            /* ⭐ 用 realPath 判断文件类型 */
            const isMarkdown = realPath.toLowerCase().endsWith('.md');
            let html;

            if (isMarkdown) {
                html = renderMarkdown(content);
                html = stripMarkedStyles(html);
                html = resolveWikiLinks(html);
                html = `<article class="article">${html}</article>`;
            } else {
                html = content;
                if (!/<article[\s>]/i.test(html) && !/<!DOCTYPE/i.test(html)) {
                    html = `<article class="article">${html}</article>`;
                }
            }

            const root = contentRoot();
            if (root) {
                root.innerHTML = html;
                root.style.animation = 'none';
                void root.offsetWidth;
                root.style.animation = '';
                if (window.MetaKnowComponents && window.MetaKnowComponents.render) {
                    window.MetaKnowComponents.render(root);
                }
            }

            /* 侧边栏高亮用短 key */
            updateActiveNav(path);

            /* Giscus 用短 key 作为 term */
            loadGiscus(path);

            window.scrollTo({ top: 0, behavior: 'smooth' });

            /* 生成右侧目录 */
            renderToc();

        } catch (error) {
            console.error('[MetaKnow] 加载失败:', error);
            const root = contentRoot();
            if (root) {
                root.innerHTML = `
                    <div class="not-found">
                        <div class="not-found-icon">
                            <i class="fas fa-triangle-exclamation"></i>
                        </div>
                        <h1>加载失败</h1>
                        <p class="nf-title">无法加载页面内容</p>
                        <p class="nf-desc">${escapeHtml(error.message || '未知错误')}</p>
                        <div class="nf-actions">
                            <a href="#/" class="btn btn-primary">
                                <i class="fas fa-home"></i>
                                返回首页
                            </a>
                            <button class="btn btn-secondary" onclick="location.reload()">
                                <i class="fas fa-rotate-right"></i>
                                重新加载
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    }

    /* ==========================================================
       侧边栏高亮
       ========================================================== */
    function updateActiveNav(path) {
        $$('.nav-submenu a').forEach((link) => {
            const linkPath = link.dataset.path;
            const isActive = linkPath === path;
            link.classList.toggle('active', isActive);

            if (isActive) {
                const submenu = link.closest('.nav-submenu');
                const toggle = submenu?.previousElementSibling;
                if (submenu && !submenu.classList.contains('open')) {
                    submenu.classList.add('open');
                    toggle?.classList.add('open');
                }
            }
        });
    }

    /* ==========================================================
       路由
       ========================================================== */
    function parseHash() {
        const hash = location.hash || '#/';
        let path = hash.replace(/^#\/?/, '');
        try {
            path = decodeURIComponent(path);
        } catch {}
        return path;
    }

    function handleRoute() {
        const path = parseHash();
        if (path === state.currentPath) return;
        renderPage(path);
    }

    /* ==========================================================
       初始化
       ========================================================== */
    function init() {
        // 主题
        applyTheme(getStoredTheme());

        // Marked
        configureMarked();

        // 侧边栏
        renderSidebar();
        restoreSidebarState();

        // 桌面端侧边栏初始状态
        if (window.innerWidth >= 1024) {
            setDesktopSidebar(getDesktopSidebarOpen());
        }

        // 事件绑定
        $('#hamburgerBtn')?.addEventListener('click', () => {
            // 桌面端：切换侧边栏展开/收起
            if (window.innerWidth >= 1024) {
                toggleDesktopSidebar();
            } else {
                // 移动端：保持原逻辑
                toggleMobileSidebar();
            }
        });
        $('#mobileOverlay')?.addEventListener('click', closeMobileSidebar);
        $('#themeBtn')?.addEventListener('click', toggleTheme);

        // 搜索
        initSearch();

        // 路由
        handleRoute();
        window.addEventListener('hashchange', handleRoute);

        // 移动端点链接后关闭侧边栏
        document.addEventListener('click', (e) => {
            const link = e.target.closest('.sidebar a[href^="#"]');
            if (link && window.innerWidth < 1024) {
                setTimeout(closeMobileSidebar, 200);
            }
        });

        // 窗口尺寸变化
        let lastWidth = window.innerWidth;
        window.addEventListener('resize', () => {
            const w = window.innerWidth;
            if (lastWidth < 1024 && w >= 1024) {
                closeMobileSidebar();
                // 从移动端切到桌面端：恢复桌面端记忆的状态
                setDesktopSidebar(getDesktopSidebarOpen());
            }
            if (lastWidth >= 1024 && w < 1024) {
                // 从桌面端切到移动端：清除桌面端的收起状态
                $('#sidebar')?.classList.remove('collapsed');
                $('#mainWrapper')?.classList.remove('sidebar-collapsed');
            }
            lastWidth = w;
        }, { passive: true });

        // ESC 关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.sidebarOpen) {
                closeMobileSidebar();
            }
        });
    }

    // DOM 就绪
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
