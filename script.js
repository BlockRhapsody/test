// ===== 导航 HTML =====
const navbarHTML = `
    <div class="container">
        <div class="logo" id="logoHome">
            <i class="fas fa-brain"></i>
            <span>弘思科技</span>
        </div>
        <div class="nav-links">
            <a href="/index.html" data-page="index">首页</a>
            <a href="/pages/products.html" data-page="products">产品</a>
            <a href="/pages/contact.html" data-page="contact">联系</a>
        </div>
        <div class="nav-cta">
            <a href="/pages/contact.html" class="btn-primary"><i class="fas fa-phone-alt"></i> 咨询</a>
        </div>
    </div>
`;

// ===== 页脚 HTML =====
const footerHTML = `
    <div class="container">
        <div class="footer-col">
            <h4><i class="fas fa-brain" style="color: var(--accent);"></i> 弘思科技</h4>
            <p>智慧城市建设者 · 互联网+实践者</p>
            <p style="margin-top: 8px; font-size: 0.8rem; opacity: 0.6;">
                © 2026 深圳市弘思科技有限公司
            </p>
        </div>
        <div class="footer-col">
            <h4>业务</h4>
            <a href="/pages/products.html">群防群治平台</a>
            <a href="/pages/products.html">义警管理平台</a>
            <a href="/pages/products.html">智慧公安解决方案</a>
        </div>
        <div class="footer-col">
            <h4>关于</h4>
            <a href="/index.html#about">公司简介</a>
            <a href="/pages/products.html">核心技术</a>
            <a href="/index.html#trust">成功案例</a>
        </div>
        <div class="footer-col">
            <h4>联系</h4>
            <p><i class="fas fa-map-pin"></i> 深圳宝安 · 中粮集团大厦15楼08</p>
            <p><i class="fas fa-envelope"></i> 496139470@qq.com</p>
            <p><i class="fas fa-phone"></i> 189-0285-6929</p>
        </div>
    </div>
    <div class="footer-bottom container">
        <span>专注IT · 服务世界 — 以科技驱动应用创新，赋能客户成功</span>
    </div>
`;

// ===== 渲染公共部分 =====
document.addEventListener('DOMContentLoaded', function() {
    // 渲染导航
    const navbar = document.getElementById('navbar');
    if (navbar) {
        navbar.className = 'navbar';
        navbar.innerHTML = navbarHTML;

        // Logo 点击返回首页
        const logo = document.getElementById('logoHome');
        if (logo) {
            logo.addEventListener('click', function() {
                window.location.href = '/index.html';
            });
        }
    }

    // 渲染页脚
    const footer = document.getElementById('footer');
    if (footer) {
        footer.className = 'footer';
        footer.innerHTML = footerHTML;
    }

    // 高亮当前页面导航（根据 URL 路径）
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        // 判断当前路径是否匹配
        if (currentPath === href || 
            (currentPath.includes('/pages/') && href.includes('/pages/')) ||
            (currentPath === '/' && href === '/index.html') ||
            (currentPath === '/index.html' && href === '/index.html')) {
            link.classList.add('active');
        }
    });

    // 首页锚点平滑滚动
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        });
    });
});