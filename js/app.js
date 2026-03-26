/**
 * ToolBox - Main App Logic
 * Handles: Language, Theme, Search, Favorites, History, Counters, PWA
 */

// ===== TOOL DATA =====
const TOOLS = [
  // File/Document Tools
  { id: 'pdf-to-word', name: { ar: 'PDF إلى Word', en: 'PDF to Word' }, desc: { ar: 'تحويل PDF إلى Word', en: 'Convert PDF to Word' }, icon: '📄', cat: 'files', url: 'tools/pdf-to-word.html' },
  { id: 'word-to-pdf', name: { ar: 'Word إلى PDF', en: 'Word to PDF' }, desc: { ar: 'تحويل Word إلى PDF', en: 'Convert Word to PDF' }, icon: '📝', cat: 'files', url: 'tools/word-to-pdf.html' },
  { id: 'pdf-merger', name: { ar: 'دمج PDF', en: 'PDF Merger' }, desc: { ar: 'دمج ملفات PDF', en: 'Merge PDF files' }, icon: '🔗', cat: 'files', url: 'tools/pdf-merger.html' },
  { id: 'pdf-splitter', name: { ar: 'تقسيم PDF', en: 'PDF Splitter' }, desc: { ar: 'تقسيم PDF إلى صفحات', en: 'Split PDF pages' }, icon: '✂️', cat: 'files', url: 'tools/pdf-splitter.html' },
  { id: 'pptx-to-pdf', name: { ar: 'PowerPoint إلى PDF', en: 'PowerPoint to PDF' }, desc: { ar: 'تحويل PPTX إلى PDF', en: 'Convert PPTX to PDF' }, icon: '📊', cat: 'files', url: 'tools/pptx-to-pdf.html' },
  { id: 'image-compressor', name: { ar: 'ضغط الصور', en: 'Image Compressor' }, desc: { ar: 'تصغير حجم الصور', en: 'Reduce image size' }, icon: '🖼️', cat: 'files', url: 'tools/image-compressor.html' },
  { id: 'image-converter', name: { ar: 'تحويل صيغة الصور', en: 'Image Converter' }, desc: { ar: 'PNG ↔ JPG ↔ WEBP', en: 'PNG ↔ JPG ↔ WEBP' }, icon: '🔄', cat: 'files', url: 'tools/image-converter.html' },
  { id: 'image-resizer', name: { ar: 'تغيير حجم الصور', en: 'Image Resizer' }, desc: { ar: 'تغيير أبعاد الصورة', en: 'Resize images' }, icon: '📐', cat: 'files', url: 'tools/image-resizer.html' },
  // Text Tools
  { id: 'word-counter', name: { ar: 'عداد الكلمات', en: 'Word Counter' }, desc: { ar: 'عد الكلمات والأحرف', en: 'Count words & chars' }, icon: '🔤', cat: 'text', url: 'tools/word-counter.html' },
  { id: 'case-converter', name: { ar: 'تحويل الأحرف', en: 'Case Converter' }, desc: { ar: 'كبير ↔ صغير', en: 'UPPER ↔ lower' }, icon: 'Aa', cat: 'text', url: 'tools/case-converter.html' },
  { id: 'remove-diacritics', name: { ar: 'إزالة التشكيل', en: 'Remove Diacritics' }, desc: { ar: 'إزالة تشكيل النص العربي', en: 'Remove Arabic vowels' }, icon: '🇸🇦', cat: 'text', url: 'tools/remove-diacritics.html' },
  { id: 'lorem-ipsum', name: { ar: 'نص عشوائي', en: 'Lorem Ipsum' }, desc: { ar: 'توليد نص عشوائي', en: 'Generate placeholder text' }, icon: '📃', cat: 'text', url: 'tools/lorem-ipsum.html' },
  { id: 'base64', name: { ar: 'Base64', en: 'Base64' }, desc: { ar: 'تشفير وفك تشفير Base64', en: 'Encode/decode Base64' }, icon: '🔐', cat: 'text', url: 'tools/base64.html' },
  { id: 'url-encoder', name: { ar: 'تشفير URL', en: 'URL Encoder' }, desc: { ar: 'تشفير وفك تشفير URL', en: 'Encode/decode URLs' }, icon: '🌐', cat: 'text', url: 'tools/url-encoder.html' },
  { id: 'number-converter', name: { ar: 'محوّل الأرقام العربية', en: 'Arabic Number Converter' }, desc: { ar: '١٢٣ ↔ 123 تحويل الأرقام', en: 'Arabic ↔ Western numerals' }, icon: '🔢', cat: 'text', url: 'tools/number-converter.html' },
  // Calculators
  { id: 'age-calculator', name: { ar: 'حاسبة العمر', en: 'Age Calculator' }, desc: { ar: 'احسب عمرك بدقة', en: 'Calculate exact age' }, icon: '🎂', cat: 'calc', url: 'tools/age-calculator.html' },
  { id: 'bmi-calculator', name: { ar: 'حاسبة BMI', en: 'BMI Calculator' }, desc: { ar: 'مؤشر كتلة الجسم', en: 'Body Mass Index' }, icon: '⚖️', cat: 'calc', url: 'tools/bmi-calculator.html' },
  { id: 'currency-converter', name: { ar: 'تحويل العملات', en: 'Currency Converter' }, desc: { ar: 'دولار ↔ دينار عراقي', en: 'USD ↔ IQD & more' }, icon: '💱', cat: 'calc', url: 'tools/currency-converter.html' },
  { id: 'percentage-calculator', name: { ar: 'حاسبة النسبة', en: 'Percentage Calculator' }, desc: { ar: 'حسابات النسب المئوية', en: 'Percentage calculations' }, icon: '%', cat: 'calc', url: 'tools/percentage-calculator.html' },
  { id: 'loan-calculator', name: { ar: 'حاسبة القروض', en: 'Loan Calculator' }, desc: { ar: 'احسب أقساطك الشهرية', en: 'Monthly payment calc' }, icon: '🏦', cat: 'calc', url: 'tools/loan-calculator.html' },
  { id: 'gpa-calculator', name: { ar: 'حاسبة المعدل', en: 'GPA Calculator' }, desc: { ar: 'حساب المعدل الدراسي', en: 'Calculate GPA & CGPA' }, icon: '🎓', cat: 'calc', url: 'tools/gpa-calculator.html' },
  { id: 'timezone-converter', name: { ar: 'محوّل المناطق الزمنية', en: 'Timezone Converter' }, desc: { ar: 'تحويل الوقت بين المناطق', en: 'Convert time zones' }, icon: '🕐', cat: 'calc', url: 'tools/timezone-converter.html' },
  { id: 'screen-ppi', name: { ar: 'حاسبة PPI للشاشة', en: 'Screen PPI Calculator' }, desc: { ar: 'احسب كثافة البكسل', en: 'Pixels per inch calc' }, icon: '📱', cat: 'calc', url: 'tools/screen-ppi.html' },
  // Design Tools
  { id: 'color-picker', name: { ar: 'منتقي الألوان', en: 'Color Picker' }, desc: { ar: 'HEX, RGB, HSL', en: 'HEX, RGB, HSL values' }, icon: '🎨', cat: 'design', url: 'tools/color-picker.html' },
  { id: 'qr-generator', name: { ar: 'مولد QR Code', en: 'QR Generator' }, desc: { ar: 'إنشاء باركود QR', en: 'Generate QR codes' }, icon: '📷', cat: 'design', url: 'tools/qr-generator.html' },
  { id: 'gradient-generator', name: { ar: 'مولد التدرجات', en: 'Gradient Generator' }, desc: { ar: 'إنشاء تدرجات CSS', en: 'CSS gradient creator' }, icon: '🌈', cat: 'design', url: 'tools/gradient-generator.html' },
  // Dev Tools
  { id: 'my-ip', name: { ar: 'عنوان IP', en: 'My IP Address' }, desc: { ar: 'اعرف IP الخاص بك', en: 'Show your IP info' }, icon: '🖥️', cat: 'dev', url: 'tools/my-ip.html' },
  { id: 'password-generator', name: { ar: 'مولد كلمات المرور', en: 'Password Generator' }, desc: { ar: 'إنشاء باسوورد قوي', en: 'Generate strong passwords' }, icon: '🔑', cat: 'dev', url: 'tools/password-generator.html' },
  { id: 'markdown-preview', name: { ar: 'معاينة Markdown', en: 'Markdown Preview' }, desc: { ar: 'كتابة ومعاينة Markdown', en: 'Live Markdown preview' }, icon: '📋', cat: 'dev', url: 'tools/markdown-preview.html' },
  { id: 'speed-test', name: { ar: 'اختبار سرعة الإنترنت', en: 'Internet Speed Test' }, desc: { ar: 'فحص سرعة تحميل ورفع', en: 'Test download & upload speed' }, icon: '⚡', cat: 'dev', url: 'tools/speed-test.html' },
];

const CATEGORIES = {
  all: { ar: 'الكل', en: 'All', icon: '🔧' },
  files: { ar: 'ملفات', en: 'Files', icon: '📁' },
  text: { ar: 'نصوص', en: 'Text', icon: '🔤' },
  calc: { ar: 'حاسبات', en: 'Calculators', icon: '🔢' },
  design: { ar: 'تصميم', en: 'Design', icon: '🎨' },
  dev: { ar: 'مطورين', en: 'Developer', icon: '💻' },
};

// ===== BASE PATH (handles GitHub Pages subdir deployment) =====
const BASE_PATH = window.location.pathname.includes('/tools/') ? '../' : '';

// ===== STATE =====
let currentLang = localStorage.getItem('tb_lang') || 'ar';
let currentTheme = localStorage.getItem('tb_theme') || 'dark';
let favorites = JSON.parse(localStorage.getItem('tb_favorites') || '[]');
let history = JSON.parse(localStorage.getItem('tb_history') || '[]');
let usageCounts = JSON.parse(localStorage.getItem('tb_usage') || '{}');
let currentCat = 'all';

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  applyLang(currentLang);
  applyTheme(currentTheme);
  initPWA();

  if (document.getElementById('tools-grid-main')) {
    renderCategoryTabs();
    renderAllTools();
    renderFavorites();
    renderHistory();
    renderPopular();
    initSearch();
    updateHeroStats();
    simulateLiveUsers();
  }

  initSearch();
});

// ===== LANGUAGE =====
function applyLang(lang) {
  currentLang = lang;
  window.currentLang = lang;
  localStorage.setItem('tb_lang', lang);
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  // Update lang toggle button
  const langBtn = document.getElementById('lang-btn');
  if (langBtn) langBtn.textContent = lang === 'ar' ? 'EN' : 'عربي';

  // Translate all elements with data-ar / data-en
  document.querySelectorAll('[data-ar]').forEach(el => {
    el.textContent = lang === 'ar' ? el.dataset.ar : (el.dataset.en || el.dataset.ar);
  });
  document.querySelectorAll('[data-ar-placeholder]').forEach(el => {
    el.placeholder = lang === 'ar' ? el.dataset.arPlaceholder : (el.dataset.enPlaceholder || el.dataset.arPlaceholder);
  });
}

function toggleLang() {
  applyLang(currentLang === 'ar' ? 'en' : 'ar');
  if (document.getElementById('tools-grid-main')) {
    renderCategoryTabs();
    renderAllTools();
    renderFavorites();
    renderHistory();
    renderPopular();
    updateHeroStats();
  }
}

// ===== THEME =====
function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('tb_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// ===== SEARCH =====
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  if (!searchInput || !searchResults) return;

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) { searchResults.classList.remove('active'); return; }

    const results = TOOLS.filter(t =>
      t.name[currentLang].toLowerCase().includes(q) ||
      t.name['ar'].toLowerCase().includes(q) ||
      t.name['en'].toLowerCase().includes(q) ||
      t.desc[currentLang].toLowerCase().includes(q)
    ).slice(0, 8);

    searchResults.innerHTML = results.length ? results.map(t => `
      <a href="${BASE_PATH}${t.url}" class="search-result-item" onclick="trackToolUse('${t.id}')">
        <span class="item-icon">${t.icon}</span>
        <div>
          <div class="item-name">${t.name[currentLang]}</div>
          <div class="item-cat">${CATEGORIES[t.cat][currentLang]}</div>
        </div>
      </a>
    `).join('') : `<div class="search-result-item"><div class="item-name" style="color:var(--text-muted)">${currentLang === 'ar' ? 'لا نتائج' : 'No results'}</div></div>`;

    searchResults.classList.add('active');
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove('active');
    }
  });

  // Filter homepage tools
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    filterHomepageTools(q);
  });
}

function filterHomepageTools(q) {
  const grid = document.getElementById('tools-grid-main');
  if (!grid) return;
  if (!q) {
    renderAllTools(currentCat);
    return;
  }
  const filtered = TOOLS.filter(t =>
    t.name[currentLang].toLowerCase().includes(q) ||
    t.name['ar'].toLowerCase().includes(q) ||
    t.name['en'].toLowerCase().includes(q)
  );
  grid.innerHTML = filtered.length ? filtered.map(toolCardHTML).join('') : `
    <div class="empty-state" style="grid-column:1/-1">
      <span class="icon">🔍</span>
      <p>${currentLang === 'ar' ? 'لا توجد أدوات مطابقة' : 'No matching tools'}</p>
    </div>`;
}

// ===== RENDER TOOLS =====
function toolCardHTML(t) {
  const isFav = favorites.includes(t.id);
  const count = usageCounts[t.id] || 0;
  return `
    <a href="${BASE_PATH}${t.url}" class="tool-card" onclick="trackToolUse('${t.id}')">
      <span class="tool-icon">${t.icon}</span>
      <div class="tool-name">${t.name[currentLang]}</div>
      <div class="tool-desc">${t.desc[currentLang]}</div>
      ${count > 0 ? `<div style="font-size:0.7rem;color:var(--text-muted);margin-top:6px">${count} ${currentLang === 'ar' ? 'استخدام' : 'uses'}</div>` : ''}
      <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFav(event,'${t.id}')" title="${currentLang === 'ar' ? 'مفضلة' : 'Favorite'}">
        ${isFav ? '❤️' : '🤍'}
      </button>
    </a>`;
}

function renderCategoryTabs() {
  const wrap = document.getElementById('cat-tabs');
  if (!wrap) return;
  wrap.innerHTML = Object.entries(CATEGORIES).map(([k, v]) => `
    <button class="cat-tab ${k === currentCat ? 'active' : ''}" onclick="filterCat('${k}')">
      ${v.icon} ${v[currentLang]}
    </button>`).join('');
}

function filterCat(cat) {
  currentCat = cat;
  renderCategoryTabs();
  renderAllTools(cat);
}

function renderAllTools(cat = 'all') {
  const grid = document.getElementById('tools-grid-main');
  if (!grid) return;
  const list = cat === 'all' ? TOOLS : TOOLS.filter(t => t.cat === cat);
  grid.innerHTML = list.map(toolCardHTML).join('');
}

// ===== FAVORITES =====
function toggleFav(e, id) {
  e.preventDefault();
  e.stopPropagation();
  const idx = favorites.indexOf(id);
  if (idx === -1) {
    favorites.push(id);
    showToast(currentLang === 'ar' ? '❤️ أُضيف للمفضلة' : '❤️ Added to favorites', 'success');
  } else {
    favorites.splice(idx, 1);
    showToast(currentLang === 'ar' ? '💔 أُزيل من المفضلة' : '💔 Removed from favorites', 'info');
  }
  localStorage.setItem('tb_favorites', JSON.stringify(favorites));
  renderAllTools(currentCat);
  renderFavorites();
}

function renderFavorites() {
  const wrap = document.getElementById('favorites-section');
  if (!wrap) return;
  if (favorites.length === 0) {
    wrap.style.display = 'none';
    return;
  }
  wrap.style.display = 'block';
  const grid = wrap.querySelector('.tools-grid');
  if (!grid) return;
  const favTools = favorites.map(id => TOOLS.find(t => t.id === id)).filter(Boolean);
  grid.innerHTML = favTools.map(toolCardHTML).join('');
}

// ===== HISTORY =====
function trackToolUse(id) {
  // Update usage count
  usageCounts[id] = (usageCounts[id] || 0) + 1;
  localStorage.setItem('tb_usage', JSON.stringify(usageCounts));

  // Update history
  history = history.filter(h => h !== id);
  history.unshift(id);
  history = history.slice(0, 10);
  localStorage.setItem('tb_history', JSON.stringify(history));
}

function renderHistory() {
  const wrap = document.getElementById('history-section');
  if (!wrap) return;
  if (history.length === 0) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  const grid = wrap.querySelector('.tools-grid');
  if (!grid) return;
  const recentTools = history.slice(0, 6).map(id => TOOLS.find(t => t.id === id)).filter(Boolean);
  grid.innerHTML = recentTools.map(toolCardHTML).join('');
}

// ===== POPULAR =====
function renderPopular() {
  const grid = document.getElementById('popular-grid');
  if (!grid) return;
  const sorted = TOOLS
    .map(t => ({ ...t, count: usageCounts[t.id] || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣'];
  grid.innerHTML = sorted.map((t, i) => `
    <a href="${BASE_PATH}${t.url}" class="popular-card" onclick="trackToolUse('${t.id}')">
      <span class="popular-rank">${medals[i]}</span>
      <div class="popular-info">
        <div class="name">${t.icon} ${t.name[currentLang]}</div>
        <div class="count">${t.count} ${currentLang === 'ar' ? 'استخدام' : 'uses'}</div>
      </div>
    </a>`).join('');
}

// ===== HERO STATS =====
function updateHeroStats() {
  const totalUses = Object.values(usageCounts).reduce((a, b) => a + b, 0) + 150432;
  const el = document.getElementById('total-uses');
  if (el) el.textContent = totalUses.toLocaleString();

  const toolsEl = document.getElementById('tools-count');
  if (toolsEl) toolsEl.textContent = TOOLS.length;
}

function simulateLiveUsers() {
  const el = document.getElementById('live-users');
  if (!el) return;
  const update = () => {
    el.textContent = Math.floor(20 + Math.random() * 60);
  };
  update();
  setInterval(update, 5000);
}

// ===== TOOL PAGE UTILITIES =====
function initToolPage(toolId) {
  trackToolUse(toolId);

  const tool = TOOLS.find(t => t.id === toolId);
  if (!tool) return;

  // Set usage count display
  const usageEl = document.getElementById('tool-usage-count');
  if (usageEl) usageEl.textContent = (usageCounts[toolId] || 0).toLocaleString();

  const liveEl = document.getElementById('tool-live-users');
  if (liveEl) {
    liveEl.textContent = Math.floor(3 + Math.random() * 25);
    setInterval(() => { liveEl.textContent = Math.floor(3 + Math.random() * 25); }, 8000);
  }

  // Fav button on tool page
  const favBtn = document.getElementById('tool-fav-btn');
  if (favBtn) {
    const isFav = favorites.includes(toolId);
    favBtn.textContent = isFav ? '❤️' : '🤍';
    favBtn.onclick = () => {
      const idx = favorites.indexOf(toolId);
      if (idx === -1) { favorites.push(toolId); favBtn.textContent = '❤️'; showToast(currentLang === 'ar' ? '❤️ أُضيف للمفضلة' : 'Added to favorites', 'success'); }
      else { favorites.splice(idx, 1); favBtn.textContent = '🤍'; showToast(currentLang === 'ar' ? 'أُزيل من المفضلة' : 'Removed from favorites', 'info'); }
      localStorage.setItem('tb_favorites', JSON.stringify(favorites));
    };
  }

  // Share buttons
  initShareButtons(tool);
  initRating(toolId);
  applyLang(currentLang);
  applyTheme(currentTheme);
}

// ===== SHARE =====
function initShareButtons(tool) {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent((currentLang === 'ar' ? 'جرّب هذه الأداة المجانية: ' : 'Try this free tool: ') + tool.name[currentLang]);

  const btns = {
    'share-facebook': `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    'share-telegram': `https://t.me/share/url?url=${url}&text=${text}`,
    'share-whatsapp': `https://wa.me/?text=${text}%20${url}`,
    'share-twitter': `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
  };

  Object.entries(btns).forEach(([id, link]) => {
    const btn = document.getElementById(id);
    if (btn) btn.onclick = () => window.open(link, '_blank', 'width=600,height=400');
  });
}

// ===== RATING =====
function initRating(toolId) {
  const ratings = JSON.parse(localStorage.getItem('tb_ratings') || '{}');
  const toolRating = ratings[toolId] || { likes: 0, dislikes: 0 };

  const updateRatingUI = () => {
    const total = toolRating.likes + toolRating.dislikes;
    const pct = total > 0 ? Math.round((toolRating.likes / total) * 100) : 0;
    const bar = document.getElementById('rating-bar');
    const text = document.getElementById('rating-text');
    if (bar) bar.style.width = pct + '%';
    if (text) text.textContent = total > 0
      ? `${pct}% ${currentLang === 'ar' ? 'وجدوها مفيدة' : 'found this helpful'} (${total} ${currentLang === 'ar' ? 'تقييم' : 'ratings'})`
      : (currentLang === 'ar' ? 'كن أول من يقيّم هذه الأداة' : 'Be the first to rate this tool');
  };

  updateRatingUI();

  const likeBtn = document.getElementById('rate-like');
  const dislikeBtn = document.getElementById('rate-dislike');

  if (likeBtn) likeBtn.onclick = () => {
    toolRating.likes++;
    ratings[toolId] = toolRating;
    localStorage.setItem('tb_ratings', JSON.stringify(ratings));
    likeBtn.classList.add('voted');
    dislikeBtn?.classList.remove('voted');
    updateRatingUI();
    showToast(currentLang === 'ar' ? '👍 شكراً على تقييمك!' : '👍 Thanks for your feedback!', 'success');
  };

  if (dislikeBtn) dislikeBtn.onclick = () => {
    toolRating.dislikes++;
    ratings[toolId] = toolRating;
    localStorage.setItem('tb_ratings', JSON.stringify(ratings));
    dislikeBtn.classList.add('voted');
    likeBtn?.classList.remove('voted');
    updateRatingUI();
    showToast(currentLang === 'ar' ? '👎 شكراً، سنعمل على التحسين' : '👎 Thanks, we\'ll improve!', 'info');
  };
}

// ===== TOAST =====
function showToast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== PWA =====
let deferredPrompt = null;

function initPWA() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('pwa-banner');
    if (banner && !localStorage.getItem('pwa_dismissed')) {
      banner.classList.add('show');
    }
  });

  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn) {
    installBtn.onclick = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
      }
      const banner = document.getElementById('pwa-banner');
      if (banner) banner.classList.remove('show');
    };
  }

  const dismissBtn = document.getElementById('pwa-dismiss');
  if (dismissBtn) {
    dismissBtn.onclick = () => {
      const banner = document.getElementById('pwa-banner');
      if (banner) banner.classList.remove('show');
      localStorage.setItem('pwa_dismissed', '1');
    };
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(BASE_PATH + 'sw.js').catch(() => {});
    });
  }
}

// ===== NEWSLETTER =====
function handleNewsletter(e) {
  e.preventDefault();
  const input = document.getElementById('newsletter-email');
  if (!input || !input.value.includes('@')) {
    showToast(currentLang === 'ar' ? 'الرجاء إدخال بريد إلكتروني صحيح' : 'Please enter a valid email', 'error');
    return;
  }
  const emails = JSON.parse(localStorage.getItem('tb_newsletter') || '[]');
  if (!emails.includes(input.value)) {
    emails.push(input.value);
    localStorage.setItem('tb_newsletter', JSON.stringify(emails));
  }
  showToast(currentLang === 'ar' ? '✅ تم الاشتراك بنجاح!' : '✅ Subscribed successfully!', 'success');
  input.value = '';
}

// ===== LOADING =====
function showLoading(msg = '') {
  let overlay = document.getElementById('loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `<div class="spinner"></div><div class="loading-text">${msg}</div>`;
    document.body.appendChild(overlay);
  } else {
    overlay.querySelector('.loading-text').textContent = msg;
  }
  overlay.classList.add('active');
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.remove('active');
}

// ===== FILE UTILS =====
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

// ===== COPY TO CLIPBOARD =====
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(currentLang === 'ar' ? '✅ تم النسخ!' : '✅ Copied!', 'success');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = currentLang === 'ar' ? '✓ تم' : '✓ Done';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }
  });
}

// ===== DRAG AND DROP =====
function initDragDrop(areaId, inputId, onFiles) {
  const area = document.getElementById(areaId);
  const input = document.getElementById(inputId);
  if (!area || !input) return;

  area.addEventListener('click', () => input.click());
  input.addEventListener('change', () => onFiles(Array.from(input.files)));

  area.addEventListener('dragover', (e) => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', (e) => {
    e.preventDefault();
    area.classList.remove('drag-over');
    onFiles(Array.from(e.dataTransfer.files));
  });
}

// ===== EXPOSE GLOBALS =====
window.toggleLang = toggleLang;
window.toggleTheme = toggleTheme;
window.toggleFav = toggleFav;
window.filterCat = filterCat;
window.trackToolUse = trackToolUse;
window.initToolPage = initToolPage;
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.formatFileSize = formatFileSize;
window.downloadBlob = downloadBlob;
window.copyText = copyText;
window.initDragDrop = initDragDrop;
window.handleNewsletter = handleNewsletter;
window.TOOLS = TOOLS;
window.currentLang = currentLang;
