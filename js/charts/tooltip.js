// ============================================================
// MetaKnow Charts · Tooltip
// 方案 B：JS + 绝对定位，跟随鼠标多维度
// ============================================================

let tooltipEl = null;

function ensureTooltip() {
    if (tooltipEl) return tooltipEl;
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'mk-chart-tooltip';
    document.body.appendChild(tooltipEl);
    return tooltipEl;
}

function positionTooltip(el, x, y) {
    const rect = el.getBoundingClientRect();
    let left = x + 14;
    let top = y - rect.height - 14;

    if (left + rect.width > window.innerWidth - 8) {
        left = x - rect.width - 14;
    }
    if (top < 8) {
        top = y + 20;
    }

    el.style.left = left + 'px';
    el.style.top = top + 'px';
}

export function showTooltip(html, x, y) {
    const el = ensureTooltip();
    el.innerHTML = html;
    el.classList.add('show');
    positionTooltip(el, x, y);
}

export function hideTooltip() {
    if (tooltipEl) tooltipEl.classList.remove('show');
}

export function bindTooltipEvents(container) {
    container.addEventListener('mouseover', function (e) {
        const target = e.target.closest('[data-tooltip]');
        if (!target) return;
        showTooltip(target.getAttribute('data-tooltip'), e.clientX, e.clientY);
    });

    container.addEventListener('mousemove', function (e) {
        const target = e.target.closest('[data-tooltip]');
        if (!target) return;
        if (tooltipEl) positionTooltip(tooltipEl, e.clientX, e.clientY);
    });

    container.addEventListener('mouseout', function (e) {
        const target = e.target.closest('[data-tooltip]');
        if (!target) return;
        hideTooltip();
    });

    // 触摸端
    container.addEventListener('touchstart', function (e) {
        const target = e.target.closest('[data-tooltip]');
        if (!target) return;
        const t = e.touches[0];
        showTooltip(target.getAttribute('data-tooltip'), t.clientX, t.clientY);
    }, { passive: true });

    container.addEventListener('touchend', function () {
        setTimeout(hideTooltip, 1500);
    });
}
