/**
 * 古典音乐演出排期 — 主应用脚本
 */
(function () {
  'use strict';

  // ============ 状态 ============
  const state = {
    currentView: 'home',
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,
    filters: {},
    searchKeyword: '',
    performances: [],
  };

  // ============ DOM 缓存 ============
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ============ 初始化 ============
  function init() {
    loadHeroStats();
    loadPerformances();
    loadFilterOptions();
  }

  // ============ 导航 ============
  window.navigate = function (view) {
    state.currentView = view;

    // 更新导航链接状态
    $$('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.nav === view);
    });

    // 切换视图
    $$('.view').forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById('view-' + view);
    if (targetView) targetView.classList.add('active');

    // 按需加载数据
    if (view === 'home') {
      loadPerformances();
      loadHeroStats();
    } else if (view === 'search') {
      loadFilterOptions();
    }

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 关闭移动菜单
    document.getElementById('mobileMenu').classList.remove('show');
  };

  window.toggleMobileMenu = function () {
    document.getElementById('mobileMenu').classList.toggle('show');
  };

  // ============ 首页数据 ============
  async function loadHeroStats() {
    try {
      const [perfRes, venueRes] = await Promise.all([
        fetch('/api/performances?status=published&page_size=1'),
        fetch('/api/venues?page_size=1'),
      ]);
      const perfData = await perfRes.json();
      const venueData = await venueRes.json();

      // 即将上演（未来演出）
      const upcomingRes = await fetch('/api/performances?status=published&date_from=' +
        new Date().toISOString().split('T')[0] + '&page_size=1');
      const upcomingData = await upcomingRes.json();

      document.getElementById('statUpcoming').textContent = upcomingData.total || 0;
      document.getElementById('statTotal').textContent = perfData.total || 0;
      document.getElementById('statVenues').textContent = venueData.total || 0;
    } catch (e) {
      console.error('加载统计数据失败:', e);
    }
  }

  // 是否显示已结束演出
  let showPast = false;

  async function loadPerformances(page = 1) {
    const grid = document.getElementById('perfGrid');
    grid.innerHTML = '<div class="loading">加载中...</div>';

    try {
      const city = document.getElementById('citySelect').value;
      const params = new URLSearchParams({
        page,
        page_size: state.pageSize,
      });
      // 默认只显示 upcoming，勾选后显示全部
      if (!showPast) {
        params.append('date_from', new Date().toISOString().split('T')[0]);
      }
      params.append('status', 'published');
      if (city) params.append('city', city);

      const res = await fetch('/api/performances?' + params);
      const data = await res.json();

      state.currentPage = data.page || 1;
      state.totalPages = data.total_pages || 1;
      state.performances = data.data || [];

      if (state.performances.length === 0) {
        grid.innerHTML = `
          <div class="loading">
            <div style="font-size:48px;margin-bottom:16px;">🎵</div>
            <div>暂无演出信息</div>
            <div style="font-size:13px;color:var(--text-light);margin-top:8px;">敬请期待更多精彩演出</div>
          </div>`;
      } else {
        grid.innerHTML = state.performances.map(p => renderCard(p)).join('');
      }

      renderPagination('pagination', page, data.total_pages || 1, loadPerformances);
    } catch (e) {
      console.error('加载演出失败:', e);
      grid.innerHTML = '<div class="loading">加载失败，请刷新重试</div>';
    }
  }

  window.onCityChange = function () {
    loadPerformances(1);
  };

  window.toggleShowPast = function (cb) {
    showPast = cb.checked;
    loadPerformances(1);
  };

  // ============ 渲染演出卡片 ============
  function renderCard(p) {
    const d = new Date(p.date_time);
    const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
    const monthDay = months[d.getMonth()] + d.getDate() + '日';
    const time = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');

    const orchestra = p.orchestra ? (p.orchestra.name_zh || p.orchestra.name) : '';
    const conductor = p.conductor ? (p.conductor.name_zh || p.conductor.name) : '';
    const venue = p.venue ? (p.venue.name_zh || p.venue.name) : '';
    const pieces = (p.pieces || []).filter(pc => pc.composer).slice(0, 4);

    const isPast = p.status === 'past' || d < new Date();
    const pastClass = isPast ? ' past' : '';

    return `
    <div class="perf-card${pastClass}" onclick="openDetail(${p.id})">
      <div class="perf-card-date">
        <span class="date-day">${d.getDate()}</span>
        <span class="date-month">${monthDay.split('月')[0]}月</span>
        <span class="date-weekday">${weekdays[d.getDay()]}</span>
        <span class="date-time">${time}</span>
        ${isPast ? '<span class="past-badge">已结束</span>' : ''}
      </div>
      <div class="perf-card-body">
        <div class="card-title">${escHtml(p.title)}</div>
        ${p.subtitle ? `<div class="card-subtitle">${escHtml(p.subtitle)}</div>` : ''}
        <div class="card-meta">
          ${orchestra ? `<div class="card-meta-item"><span class="card-meta-icon">🎺</span>${escHtml(orchestra)}</div>` : ''}
          ${conductor ? `<div class="card-meta-item"><span class="card-meta-icon">🎯</span>${escHtml(conductor)}</div>` : ''}
          ${venue ? `<div class="card-meta-item"><span class="card-meta-icon">📍</span>${escHtml(venue)}</div>` : ''}
        </div>
        ${pieces.length > 0 ? `<div class="card-composers">${pieces.map(pc =>
          `<span class="composer-tag">${escHtml(pc.composer.name_zh || pc.composer.name)}</span>`
        ).join('')}</div>` : ''}
      </div>
    </div>`;
  }

  // ============ 分页渲染 ============
  function renderPagination(containerId, current, total, onClick) {
    const container = document.getElementById(containerId);
    if (total <= 1) {
      container.innerHTML = '';
      return;
    }

    let html = '';
    html += `<button ${current <= 1 ? 'disabled' : ''} onclick="event.stopPropagation();(${onClick.name})(${current-1})">‹ 上一页</button>`;

    // 页码按钮
    const pages = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      pages.push(i);
    }
    if (pages[0] > 1) {
      html += `<button onclick="event.stopPropagation();(${onClick.name})(1)">1</button>`;
      if (pages[0] > 2) html += `<span class="page-info">...</span>`;
    }
    for (const p of pages) {
      html += `<button class="${p === current ? 'active' : ''}" onclick="event.stopPropagation();(${onClick.name})(${p})">${p}</button>`;
    }
    if (pages[pages.length - 1] < total) {
      if (pages[pages.length - 1] < total - 1) html += `<span class="page-info">...</span>`;
      html += `<button onclick="event.stopPropagation();(${onClick.name})(${total})">${total}</button>`;
    }

    html += `<button ${current >= total ? 'disabled' : ''} onclick="event.stopPropagation();(${onClick.name})(${current+1})">下一页 ›</button>`;
    html += `<span class="page-info">共 ${total} 页</span>`;
    container.innerHTML = html;
  }

  // ============ 快捷筛选 ============
  window.quickFilter = function (type) {
    const today = new Date().toISOString().split('T')[0];
    let dateFrom = today, dateTo = '';

    if (type === 'today') {
      dateTo = today;
    } else if (type === 'week') {
      const weekLater = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      dateTo = weekLater;
    }

    // 切换到搜索页
    navigate('search');

    // 设置日期
    setTimeout(() => {
      document.getElementById('fDateFrom').value = dateFrom;
      if (dateTo) document.getElementById('fDateTo').value = dateTo;
      doSearch();
    }, 100);
  };

  // ============ 搜索 ============
  // ============ 可搜索选择器 ============

  // 存储所有选项数据
  const filterData = {};
  // 存储当前选中的值 { composer: {id, name}, conductor: {id, name}, ... }
  const selectedFilters = {};

  // 去重：按指定 key 去掉重复项，避免数据库残留重复导致下拉框出现重复选项
  function dedupeByKey(items, key) {
    const seen = new Map();
    for (const item of items) {
      const k = item[key];
      if (!seen.has(k)) seen.set(k, item);
    }
    return Array.from(seen.values());
  }

  async function loadFilterOptions() {
    try {
      const [composers, conductors, performers, orchestras, venues] = await Promise.all([
        fetch('/api/composers?page_size=200').then(r => r.json()),
        fetch('/api/conductors?page_size=200').then(r => r.json()),
        fetch('/api/performers?page_size=200').then(r => r.json()),
        fetch('/api/orchestras?page_size=200').then(r => r.json()),
        fetch('/api/venues?page_size=200').then(r => r.json()),
      ]);

      filterData.composer = dedupeByKey((composers.data || []).map(item => ({
        id: item.id,
        name: item.name_zh || item.name,
        extra: item.era || '',
      })), 'name');
      filterData.conductor = dedupeByKey((conductors.data || []).map(item => ({
        id: item.id,
        name: item.name_zh || item.name,
        extra: item.nationality || '',
      })), 'name');
      filterData.performer = dedupeByKey((performers.data || []).map(item => ({
        id: item.id,
        name: item.name_zh || item.name,
        extra: item.instrument || '',
      })), 'name');
      filterData.orchestra = dedupeByKey((orchestras.data || []).map(item => ({
        id: item.id,
        name: item.name_zh || item.name,
        extra: item.country || '',
      })), 'name');
      filterData.venue = dedupeByKey((venues.data || []).map(item => ({
        id: item.id,
        name: item.name_zh || item.name,
        extra: item.city || '',
      })), 'name');
      // 城市数据
      const cities = [...new Set((venues.data || []).map(v => v.city).filter(Boolean))].sort();
      filterData.city = cities.map(c => ({ id: c, name: c, extra: '' }));

      // 渲染所有下拉选项
      for (const key of Object.keys(filterData)) {
        renderDropdownOptions(key);
      }
    } catch (e) {
      console.error('加载筛选选项失败:', e);
    }
  }

  function renderDropdownOptions(key) {
    const container = document.querySelector(`.searchable-select[data-filter="${key}"]`);
    if (!container) return;
    const optsContainer = container.querySelector('.ss-options');
    const items = filterData[key] || [];
    optsContainer.innerHTML = items.map(item =>
      `<div class="ss-option" data-id="${escHtml(String(item.id))}" data-name="${escHtml(item.name)}" onclick="selectFilterOption(this, '${key}')">
        <span>${escHtml(item.name)}${item.extra ? `<span class="ss-opt-extra">${escHtml(item.extra)}</span>` : ''}</span>
      </div>`
    ).join('');
  }

  // 打开/关闭下拉面板
  window.toggleSearchableSelect = function (triggerEl) {
    const container = triggerEl.closest('.searchable-select');
    const dropdown = container.querySelector('.ss-dropdown');
    const searchInput = container.querySelector('.ss-search');
    const isOpen = dropdown.classList.contains('show');

    // 关闭所有其他面板
    document.querySelectorAll('.ss-dropdown.show').forEach(d => d.classList.remove('show'));
    document.querySelectorAll('.ss-trigger.active').forEach(t => t.classList.remove('active'));

    if (!isOpen) {
      dropdown.classList.add('show');
      triggerEl.classList.add('active');
      // 重置搜索输入
      searchInput.value = '';
      filterSearchableOptions(searchInput);
      // 聚焦搜索框
      setTimeout(() => searchInput.focus(), 50);
    }
  };

  // 搜索过滤选项
  window.filterSearchableOptions = function (inputEl) {
    const container = inputEl.closest('.searchable-select');
    const opts = container.querySelectorAll('.ss-option');
    const q = inputEl.value.trim().toLowerCase();
    let visibleCount = 0;
    opts.forEach(opt => {
      const name = (opt.dataset.name || '').toLowerCase();
      const match = !q || name.includes(q);
      opt.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });
    // 显示空提示
    let emptyEl = container.querySelector('.ss-option-empty');
    if (visibleCount === 0) {
      if (!emptyEl) {
        emptyEl = document.createElement('div');
        emptyEl.className = 'ss-option-empty';
        emptyEl.textContent = '无匹配选项';
        container.querySelector('.ss-options').appendChild(emptyEl);
      }
      emptyEl.style.display = '';
    } else if (emptyEl) {
      emptyEl.style.display = 'none';
    }
  };

  // 选择选项
  window.selectFilterOption = function (optionEl, key) {
    const id = optionEl.dataset.id;
    const name = optionEl.dataset.name;
    const container = optionEl.closest('.searchable-select');

    // 更新选中状态
    const prevSelected = container.querySelector('.ss-option.selected');
    if (prevSelected) prevSelected.classList.remove('selected');

    if (id === selectedFilters[key]?.id) {
      // 点击已选中的 → 取消选择
      delete selectedFilters[key];
      container.querySelector('.ss-text').textContent = key === 'city' ? '全部城市' :
        key === 'composer' ? '全部作曲家' : key === 'conductor' ? '全部指挥家' :
        key === 'performer' ? '全部演奏家' : key === 'orchestra' ? '全部乐团' : '全部场所';
      container.querySelector('.ss-text').classList.add('placeholder');
    } else {
      // 选中新选项
      optionEl.classList.add('selected');
      selectedFilters[key] = { id, name };
      container.querySelector('.ss-text').textContent = name;
      container.querySelector('.ss-text').classList.remove('placeholder');
    }

    // 关闭下拉
    container.querySelector('.ss-dropdown').classList.remove('show');
    container.querySelector('.ss-trigger').classList.remove('active');

    // 触发搜索（显式用 window 避免 strict 模式下作用域问题）
    window.doSearch();
  };

  // 点击外部关闭
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.searchable-select')) {
      document.querySelectorAll('.ss-dropdown.show').forEach(d => d.classList.remove('show'));
      document.querySelectorAll('.ss-trigger.active').forEach(t => t.classList.remove('active'));
    }
  });

  // ============ 搜索 ============

  window.doSearch = function (page = 1) {
    const keyword = document.getElementById('searchKeyword').value.trim();
    const composerId = selectedFilters.composer?.id;
    const conductorId = selectedFilters.conductor?.id;
    const performerId = selectedFilters.performer?.id;
    const orchestraId = selectedFilters.orchestra?.id;
    const venueId = selectedFilters.venue?.id;
    const city = selectedFilters.city?.id;
    const dateFrom = document.getElementById('fDateFrom').value;
    const dateTo = document.getElementById('fDateTo').value;

    // 显示已选筛选标签
    const activeTags = [];
    if (selectedFilters.composer) activeTags.push({label:'作曲家',name:selectedFilters.composer.name,key:'composer'});
    if (selectedFilters.conductor) activeTags.push({label:'指挥家',name:selectedFilters.conductor.name,key:'conductor'});
    if (selectedFilters.performer) activeTags.push({label:'演奏家',name:selectedFilters.performer.name,key:'performer'});
    if (selectedFilters.orchestra) activeTags.push({label:'乐团',name:selectedFilters.orchestra.name,key:'orchestra'});
    if (selectedFilters.venue) activeTags.push({label:'场所',name:selectedFilters.venue.name,key:'venue'});
    if (selectedFilters.city) activeTags.push({label:'城市',name:selectedFilters.city.name,key:'city'});
    if (dateFrom) activeTags.push({label:'从',name:dateFrom,key:'dateFrom'});
    if (dateTo) activeTags.push({label:'至',name:dateTo,key:'dateTo'});

    const tagsHtml = activeTags.length > 0
      ? '<div class="active-filter-tags">' + activeTags.map(t =>
          `<span class="active-tag">${t.label}: ${escHtml(t.name)} <a href="javascript:void(0)" onclick="removeFilter('${t.key}')" class="active-tag-x">✕</a></span>`
        ).join('') + '</div>'
      : '';

    const hasFilters = composerId || conductorId || performerId || orchestraId || venueId || city || dateFrom || dateTo;

    const params = new URLSearchParams({ page, page_size: state.pageSize, status: 'published' });
    if (composerId) params.append('composer_id', composerId);
    if (conductorId) params.append('conductor_id', conductorId);
    if (performerId) params.append('performer_id', performerId);
    if (orchestraId) params.append('orchestra_id', orchestraId);
    if (venueId) params.append('venue_id', venueId);
    if (city) params.append('city', city);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    if (keyword) params.append('q', keyword);

    let url;
    if (keyword) {
      url = '/api/search?' + params;
    } else if (hasFilters) {
      url = '/api/performances?' + params;
    } else {
      url = '/api/performances?' + params;
    }

    // 保存 tags HTML 用于结果显示
    window._activeTagsHtml = tagsHtml;
    fetchSearchResults(url, page);
  };

  // 移除单个筛选
  window.removeFilter = function(key) {
    if (key === 'dateFrom') { document.getElementById('fDateFrom').value = ''; window.doSearch(); return; }
    if (key === 'dateTo') { document.getElementById('fDateTo').value = ''; window.doSearch(); return; }
    if (selectedFilters[key]) {
      const container = document.querySelector(`.searchable-select[data-filter="${key}"]`);
      if (container) {
        container.querySelector('.ss-text').textContent = key === 'city' ? '全部城市' :
          key === 'composer' ? '全部作曲家' : key === 'conductor' ? '全部指挥家' :
          key === 'performer' ? '全部演奏家' : key === 'orchestra' ? '全部乐团' : '全部场所';
        container.querySelector('.ss-text').classList.add('placeholder');
        const sel = container.querySelector('.ss-option.selected');
        if (sel) sel.classList.remove('selected');
      }
      delete selectedFilters[key];
      window.doSearch();
    }
  };

  async function fetchSearchResults(url, page) {
    const grid = document.getElementById('searchGrid');
    grid.innerHTML = '<div class="loading">搜索中...</div>';

    // 显示激活的筛选标签
    const tagsHtml = window._activeTagsHtml || '';
    const resultsHeader = document.querySelector('.search-results .results-header');
    if (resultsHeader) {
      const existingTags = resultsHeader.querySelector('.active-filter-tags');
      if (existingTags) existingTags.remove();
      if (tagsHtml) {
        resultsHeader.insertAdjacentHTML('beforeend', tagsHtml);
      }
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      const performances = data.data || [];

      const countEl = document.getElementById('filterCount');
      countEl.textContent = '共找到 ' + (data.total || performances.length) + ' 场演出';

      const titleEl = document.getElementById('resultsTitle');
      titleEl.textContent = '搜索结果 (' + (data.total || performances.length) + ')';

      if (performances.length === 0) {
        grid.innerHTML = `
          <div class="loading">
            <div style="font-size:48px;margin-bottom:16px;">🔍</div>
            <div>未找到相关演出</div>
            <div style="font-size:13px;color:var(--text-light);margin-top:8px;">试试调整筛选条件或换个关键词</div>
          </div>`;
        document.getElementById('searchPagination').innerHTML = '';
        return;
      }

      grid.innerHTML = performances.map(p => renderCard(p)).join('');
      renderPagination('searchPagination', data.page || 1, data.total_pages || 1, doSearch);
    } catch (e) {
      console.error('搜索失败:', e);
      grid.innerHTML = '<div class="loading">搜索失败，请重试</div>';
    }
  }

  window.clearFilters = function () {
    // 清空选择状态
    for (const key of Object.keys(selectedFilters)) {
      delete selectedFilters[key];
    }
    // 重置 UI
    document.querySelectorAll('.searchable-select .ss-text').forEach(el => {
      const key = el.closest('.searchable-select').dataset.filter;
      const defaults = {
        composer: '全部作曲家', conductor: '全部指挥家', performer: '全部演奏家',
        orchestra: '全部乐团', venue: '全部场所', city: '全部城市',
      };
      el.textContent = defaults[key] || '全部';
      el.classList.add('placeholder');
    });
    document.querySelectorAll('.searchable-select .ss-option.selected').forEach(o => o.classList.remove('selected'));

    document.getElementById('searchKeyword').value = '';
    document.getElementById('fDateFrom').value = '';
    document.getElementById('fDateTo').value = '';
    document.getElementById('filterCount').textContent = '';
    document.getElementById('resultsTitle').textContent = '所有演出';
    document.getElementById('searchGrid').innerHTML = '<div class="loading">输入关键词或选择筛选条件开始搜索</div>';
    document.getElementById('searchPagination').innerHTML = '';
    // 清除筛选标签
    window._activeTagsHtml = '';
    document.querySelectorAll('.active-filter-tags').forEach(el => el.remove());
  };

  // ============ 详情弹窗 ============
  window.openDetail = async function (id) {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    modal.classList.add('show');
    content.innerHTML = '<div class="loading" style="padding:60px;">加载中...</div>';
    document.body.style.overflow = 'hidden';

    try {
      const res = await fetch('/api/performances/' + id);
      const p = await res.json();
      content.innerHTML = renderDetail(p);
    } catch (e) {
      console.error('加载详情失败:', e);
      content.innerHTML = '<div class="loading" style="padding:60px;">加载失败</div>';
    }
  };

  window.closeDetail = function (e) {
    if (e && e.target !== document.getElementById('detailModal')) return;
    document.getElementById('detailModal').classList.remove('show');
    document.body.style.overflow = '';
  };

  // ESC 关闭
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.getElementById('detailModal').classList.remove('show');
      document.body.style.overflow = '';
    }
  });

  function renderDetail(p) {
    const d = new Date(p.date_time);
    const dateStr = d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日 ' +
      String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    const endStr = p.end_time ? new Date(p.end_time).toLocaleString('zh-CN') : '';

    let html = '';

    // 海报
    if (p.poster_url) {
      html += `<img src="${escHtml(p.poster_url)}" alt="" class="detail-poster" onerror="this.style.display='none'">`;
    }

    html += `<div class="detail-content">`;

    // 标题
    html += `<h1 class="detail-title">${escHtml(p.title)}</h1>`;
    if (p.subtitle) html += `<div class="detail-subtitle">${escHtml(p.subtitle)}</div>`;

    // 基本信息
    html += `<div class="detail-section"><span class="detail-section-title">基本信息</span>`;
    html += `<div class="detail-info-row"><span class="detail-info-label">📅 演出时间</span><div><span class="detail-info-value">${dateStr}</span>${endStr ? `<div class="detail-info-sub">预计 ${endStr} 结束</div>` : ''}</div></div>`;

    if (p.venue) {
      html += `<div class="detail-info-row"><span class="detail-info-label">📍 演出场所</span><div><span class="detail-info-value">${escHtml(p.venue.name_zh || p.venue.name)}</span>${p.venue.address ? `<div class="detail-info-sub">${escHtml(p.venue.address)}</div>` : ''}</div></div>`;
    }

    if (p.orchestra) {
      html += `<div class="detail-info-row"><span class="detail-info-label">🎺 乐团</span><div><span class="detail-info-value">${escHtml(p.orchestra.name_zh || p.orchestra.name)}</span>${p.orchestra.description ? `<div class="detail-info-sub">${escHtml(p.orchestra.description)}</div>` : ''}</div></div>`;
    }

    if (p.conductor) {
      html += `<div class="detail-info-row"><span class="detail-info-label">🎯 指挥</span><div><span class="detail-info-value">${escHtml(p.conductor.name_zh || p.conductor.name)}</span>${p.conductor.bio ? `<div class="detail-info-sub">${escHtml(p.conductor.bio)}</div>` : ''}</div></div>`;
    }

    // 演奏家
    const performers = p.performancePerformers || [];
    if (performers.length > 0) {
      html += `<div class="detail-info-row"><span class="detail-info-label">🎻 演奏家</span><div>`;
      performers.forEach(pp => {
        html += `<span class="detail-info-value">${escHtml(pp.performer.name_zh || pp.performer.name)}</span>`;
        if (pp.role || pp.instrument) {
          html += `<span class="detail-info-sub">${[pp.role, pp.instrument].filter(Boolean).join(' · ')}</span>`;
        }
      });
      html += `</div></div>`;
    }

    html += `</div>`;

    // 曲目单
    const pieces = p.pieces || [];
    if (pieces.length > 0) {
      html += `<div class="detail-section"><span class="detail-section-title">🎼 曲目单</span>`;
      html += `<ul class="piece-list">`;
      pieces.forEach((pc, i) => {
        html += `<li class="piece-item">
          <span class="piece-num">${i + 1}</span>
          <div class="piece-detail">
            <div class="piece-name">${escHtml(pc.piece_name)}</div>
            ${pc.piece_name_zh ? `<div class="piece-name-zh">${escHtml(pc.piece_name_zh)}</div>` : ''}
            <div class="piece-meta">
              ${pc.composer ? `<span class="composer-tag">${escHtml(pc.composer.name_zh || pc.composer.name)}</span>` : ''}
              ${pc.opus_number ? `<span style="font-size:12px;color:var(--text-light);">${escHtml(pc.opus_number)}</span>` : ''}
            </div>
            ${pc.notes ? `<div style="font-size:13px;color:var(--text-light);margin-top:4px;">${escHtml(pc.notes)}</div>` : ''}
          </div>
        </li>`;
      });
      html += `</ul></div>`;
    }

    // 演出介绍
    if (p.description || p.program_notes) {
      html += `<div class="detail-section"><span class="detail-section-title">📖 演出介绍</span>`;
      html += `<p style="line-height:1.8;color:var(--text-secondary);white-space:pre-wrap;">${escHtml(p.description || p.program_notes)}</p>`;
      html += `</div>`;
    }

    // 购票
    if (p.ticket_url) {
      html += `<a href="${escHtml(p.ticket_url)}" target="_blank" rel="noopener" class="detail-ticket">🎫 前往购票</a>`;
    }

    // 来源
    if (p.source) {
      html += `<div class="detail-source">数据来源：${escHtml(p.source)}${!p.source_verified ? '<span class="unverified">（待审核）</span>' : ''}</div>`;
    }

    html += `</div>`;
    return html;
  }

  // ============ 工具函数 ============
  function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ============ 启动 ============
  init();
})();
