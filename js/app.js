/**
 * ToolBox - Main App Logic v3.0
 * Features: Language, Theme, Search, Favorites, History, Popular, PWA, Particles, Toast
 */

// ===== TOOL DATA =====
const TOOLS = [
  // File/Document Tools
  { id: 'pdf-to-word',    name: { ar: 'PDF إلى Word',         en: 'PDF to Word'          }, desc: { ar: 'تحويل PDF إلى Word',        en: 'Convert PDF to Word'       }, icon: '📄', cat: 'files', url: 'tools/pdf-to-word.html'    },
  { id: 'word-to-pdf',    name: { ar: 'Word إلى PDF',         en: 'Word to PDF'          }, desc: { ar: 'تحويل Word إلى PDF',        en: 'Convert Word to PDF'       }, icon: '📝', cat: 'files', url: 'tools/word-to-pdf.html'    },
  { id: 'pdf-merger',     name: { ar: 'دمج PDF',              en: 'PDF Merger'           }, desc: { ar: 'دمج ملفات PDF',             en: 'Merge PDF files'           }, icon: '🔗', cat: 'files', url: 'tools/pdf-merger.html'     },
  { id: 'pdf-splitter',   name: { ar: 'تقسيم PDF',            en: 'PDF Splitter'         }, desc: { ar: 'تقسيم PDF إلى صفحات',      en: 'Split PDF pages'           }, icon: '✂️', cat: 'files', url: 'tools/pdf-splitter.html'   },
  { id: 'pptx-to-pdf',    name: { ar: 'PowerPoint إلى PDF',  en: 'PowerPoint to PDF'    }, desc: { ar: 'تحويل PPTX إلى PDF',       en: 'Convert PPTX to PDF'       }, icon: '📊', cat: 'files', url: 'tools/pptx-to-pdf.html'    },
  { id: 'image-compressor',name:{ ar: 'ضغط الصور',           en: 'Image Compressor'     }, desc: { ar: 'تصغير حجم الصور',          en: 'Reduce image size'         }, icon: '🖼️', cat: 'files', url: 'tools/image-compressor.html'},
  { id: 'image-converter', name:{ ar: 'تحويل صيغة الصور',   en: 'Image Converter'      }, desc: { ar: 'PNG ↔ JPG ↔ WEBP',         en: 'PNG ↔ JPG ↔ WEBP'         }, icon: '🔄', cat: 'files', url: 'tools/image-converter.html' },
  { id: 'image-resizer',   name:{ ar: 'تغيير حجم الصور',    en: 'Image Resizer'        }, desc: { ar: 'تغيير أبعاد الصورة',       en: 'Resize images'             }, icon: '📐', cat: 'files', url: 'tools/image-resizer.html'   },
  // Text Tools
  { id: 'word-counter',   name: { ar: 'عداد الكلمات',        en: 'Word Counter'         }, desc: { ar: 'عد الكلمات والأحرف',        en: 'Count words & chars'       }, icon: '🔤', cat: 'text', url: 'tools/word-counter.html'    },
  { id: 'case-converter',  name: { ar: 'تحويل الأحرف',       en: 'Case Converter'       }, desc: { ar: 'كبير ↔ صغير',              en: 'UPPER ↔ lower'             }, icon: 'Aa', cat: 'text', url: 'tools/case-converter.html'  },
  { id: 'remove-diacritics',name:{ ar: 'إزالة التشكيل',     en: 'Remove Diacritics'    }, desc: { ar: 'إزالة تشكيل النص العربي',  en: 'Remove Arabic vowels'      }, icon: '🇸🇦', cat: 'text', url: 'tools/remove-diacritics.html'},
  { id: 'lorem-ipsum',     name: { ar: 'نص عشوائي',         en: 'Lorem Ipsum'          }, desc: { ar: 'توليد نص عشوائي',          en: 'Generate placeholder text' }, icon: '📃', cat: 'text', url: 'tools/lorem-ipsum.html'     },
  { id: 'base64',          name: { ar: 'Base64',             en: 'Base64'               }, desc: { ar: 'تشفير وفك تشفير Base64',   en: 'Encode/decode Base64'      }, icon: '🔐', cat: 'text', url: 'tools/base64.html'          },
  { id: 'url-encoder',     name: { ar: 'تشفير URL',          en: 'URL Encoder'          }, desc: { ar: 'تشفير وفك تشفير URL',      en: 'Encode/decode URLs'        }, icon: '🌐', cat: 'text', url: 'tools/url-encoder.html'     },
  { id: 'number-converter',name: { ar: 'محوّل الأرقام العربية',en:'Arabic Number Converter'},desc:{ ar: '١٢٣ ↔ 123',              en: 'Arabic ↔ Western numerals' }, icon: '🔢', cat: 'text', url: 'tools/number-converter.html'},
  { id: 'json-formatter',  name: { ar: 'منسّق JSON',         en: 'JSON Formatter'       }, desc: { ar: 'تنسيق وتحقق JSON',         en: 'Format & validate JSON'    }, icon: '{ }', cat: 'text', url: 'tools/json-formatter.html'  },
  { id: 'markdown-preview',name: { ar: 'معاينة Markdown',   en: 'Markdown Preview'     }, desc: { ar: 'كتابة ومعاينة Markdown',   en: 'Live Markdown preview'     }, icon: '📋', cat: 'text', url: 'tools/markdown-preview.html' },
  { id: 'minifier',        name: { ar: 'ضاغط الكود',         en: 'Code Minifier'        }, desc: { ar: 'ضغط CSS/JS',               en: 'Minify CSS & JS'           }, icon: '⚙️', cat: 'text', url: 'tools/minifier.html'        },
  { id: 'regex-tester',    name: { ar: 'محقق Regex',         en: 'Regex Tester'         }, desc: { ar: 'اختبار التعبيرات النمطية', en: 'Test regular expressions'  }, icon: '🧪', cat: 'text', url: 'tools/regex-tester.html'    },
  { id: 'text-to-speech',  name: { ar: 'نص إلى صوت',        en: 'Text to Speech'       }, desc: { ar: 'تحويل النص إلى كلام',      en: 'Convert text to audio'     }, icon: '🔊', cat: 'text', url: 'tools/text-to-speech.html'  },
  // Calculators
  { id: 'age-calculator',  name: { ar: 'حاسبة العمر',        en: 'Age Calculator'       }, desc: { ar: 'احسب عمرك بدقة',           en: 'Calculate exact age'       }, icon: '🎂', cat: 'calc', url: 'tools/age-calculator.html'  },
  { id: 'bmi-calculator',  name: { ar: 'حاسبة BMI',          en: 'BMI Calculator'       }, desc: { ar: 'مؤشر كتلة الجسم',          en: 'Body Mass Index'           }, icon: '⚖️', cat: 'calc', url: 'tools/bmi-calculator.html'  },
  { id: 'currency-converter',name:{ar:'تحويل العملات',       en: 'Currency Converter'   }, desc: { ar: 'دولار ↔ دينار عراقي',      en: 'USD ↔ IQD & more'         }, icon: '💱', cat: 'calc', url: 'tools/currency-converter.html'},
  { id: 'percentage-calculator',name:{ar:'حاسبة النسبة',    en: 'Percentage Calculator'}, desc: { ar: 'حسابات النسب المئوية',      en: 'Percentage calculations'   }, icon: '%', cat: 'calc', url: 'tools/percentage-calculator.html'},
  { id: 'loan-calculator',  name: { ar: 'حاسبة القروض',      en: 'Loan Calculator'      }, desc: { ar: 'احسب أقساطك الشهرية',       en: 'Monthly payment calc'      }, icon: '🏦', cat: 'calc', url: 'tools/loan-calculator.html' },
  { id: 'gpa-calculator',   name: { ar: 'حاسبة المعدل',      en: 'GPA Calculator'       }, desc: { ar: 'حساب المعدل الدراسي',       en: 'Calculate GPA & CGPA'      }, icon: '🎓', cat: 'calc', url: 'tools/gpa-calculator.html'  },
  { id: 'timezone-converter',name:{ ar: 'محوّل المناطق الزمنية',en:'Timezone Converter' }, desc: { ar: 'تحويل الوقت بين المناطق',  en: 'Convert time zones'        }, icon: '🕐', cat: 'calc', url: 'tools/timezone-converter.html'},
  { id: 'screen-ppi',       name: { ar: 'حاسبة PPI للشاشة', en: 'Screen PPI Calculator'}, desc: { ar: 'احسب كثافة البكسل',         en: 'Pixels per inch calc'      }, icon: '📱', cat: 'calc', url: 'tools/screen-ppi.html'      },
  // Design Tools
  { id: 'color-picker',     name: { ar: 'منتقي الألوان',     en: 'Color Picker'         }, desc: { ar: 'HEX, RGB, HSL',             en: 'HEX, RGB, HSL values'     }, icon: '🎨', cat: 'design', url: 'tools/color-picker.html'    },
  { id: 'qr-generator',     name: { ar: 'مولد QR Code',      en: 'QR Generator'         }, desc: { ar: 'إنشاء باركود QR',           en: 'Generate QR codes'         }, icon: '📷', cat: 'design', url: 'tools/qr-generator.html'    },
  { id: 'gradient-generator',name:{ ar: 'مولد التدرجات',     en: 'Gradient Generator'   }, desc: { ar: 'إنشاء تدرجات CSS',          en: 'CSS gradient creator'      }, icon: '🌈', cat: 'design', url: 'tools/gradient-generator.html'},
  { id: 'favicon-generator', name:{ ar: 'مولد الأيقونات',    en: 'Favicon Generator'    }, desc: { ar: 'إنشاء أيقونات الموقع',      en: 'Create website favicons'   }, icon: '⭐', cat: 'design', url: 'tools/favicon-generator.html'},
  // Developer Tools
  { id: 'my-ip',             name: { ar: 'عنوان IP',          en: 'My IP Address'       }, desc: { ar: 'اعرف IP الخاص بك',          en: 'Show your IP info'         }, icon: '🖥️', cat: 'dev', url: 'tools/my-ip.html'            },
  { id: 'password-generator',name: { ar: 'مولد كلمات المرور',en: 'Password Generator'  }, desc: { ar: 'إنشاء باسوورد قوي',         en: 'Generate strong passwords' }, icon: '🔑', cat: 'dev', url: 'tools/password-generator.html'},
  { id: 'speed-test',        name: { ar: 'اختبار سرعة الإنترنت',en:'Internet Speed Test' }, desc: { ar: 'فحص سرعة تحميل ورفع',     en: 'Test download & upload'    }, icon: '⚡', cat: 'dev', url: 'tools/speed-test.html'       },
];

// Tools added recently (show "New" badge)
const NEW_TOOLS = ['json-formatter', 'regex-tester', 'text-to-speech', 'favicon-generator', 'minifier'];

const CATEGORIES = {
  all:    { ar: 'الكل',        en: 'All',         icon: '🔧' },
  files:  { ar: 'ملفات',      en: 'Files',       icon: '📁' },
  text:   { ar: 'نصوص',       en: 'Text',        icon: '🔤' },
  calc:   { ar: 'حاسبات',     en: 'Calculators', icon: '🔢' },
  design: { ar: 'تصميم',      en: 'Design',      icon: '🎨' },
  dev:    { ar: 'مطورين',     en: 'Developer',   icon: '💻' },
};

// ===== BASE PATH =====
const BASE_PATH = window.location.pathname.includes('/tools/') ? '../' : '';

// ===== STATE =====
let currentLang  = localStorage.getItem('tb_lang')      || 'ar';
let currentTheme = localStorage.getItem('tb_theme')     || 'dark';
let favorites    = JSON.parse(localStorage.getItem('tb_favorites') || '[]');
let history      = JSON.parse(localStorage.getItem('tb_history')   || '[]');
let usageCounts  = JSON.parse(localStorage.getItem('tb_usage')     || '{}');
let currentCat   = 'all';

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  applyLang(currentLang);
  applyTheme(currentTheme);
  initPWA();
  initParticles();

  if (document.getElementById('tools-grid-main')) {
    renderCategoryTabs();
    renderAllTools();
    renderFavorites();
    renderHistory();
    renderPopular();
    initSearch();
    updateHeroStats();
    simulateLiveUsers();
  } else {
    initSearch();
  }

  setTimeout(() => {
    initRipples();
    applyCardStagger();
    initScrollAnimations();
  }, 100);
});

// ===== LANGUAGE =====
function applyLang(lang) {
  currentLang = lang;
  window.currentLang = lang;
  localStorage.setItem('tb_lang', lang);
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  const langBtn = document.getElementById('lang-btn');
  if (langBtn) langBtn.textContent = lang === 'ar' ? 'EN' : 'عربي';

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
  const mobileIcon = document.getElementById('mobile-theme-icon');
  if (mobileIcon) mobileIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// ===== SEARCH =====
function initSearch() {
  const searchInput   = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  if (!searchInput) return;

  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const q = e.target.value.trim().toLowerCase();
      if (searchResults) {
        if (!q) { searchResults.classList.remove('active'); }
        else {
          const results = TOOLS.filter(t =>
            t.name[currentLang].toLowerCase().includes(q) ||
            t.name.ar.toLowerCase().includes(q) ||
            t.name.en.toLowerCase().includes(q) ||
            t.desc[currentLang].toLowerCase().includes(q)
          ).slice(0, 8);

          searchResults.innerHTML = results.length
            ? results.map(t => `
              <a href="${BASE_PATH}${t.url}" class="search-result-item" onclick="trackToolUse('${t.id}')">
                <span class="item-icon">${t.icon}</span>
                <div>
                  <div class="item-name">${t.name[currentLang]}</div>
                  <div class="item-cat">${CATEGORIES[t.cat][currentLang]}</div>
                </div>
              </a>`)
              .join('')
            : `<div class="search-result-item"><div class="item-name" style="color:var(--text-muted)">${currentLang === 'ar' ? 'لا نتائج' : 'No results'}</div></div>`;

          searchResults.classList.add('active');
        }
      }
      filterHomepageTools(q);
    }, 120);
  });

  if (searchResults) {
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove('active');
      }
    });
  }
}

function filterHomepageTools(q) {
  const grid = document.getElementById('tools-grid-main');
  if (!grid) return;
  if (!q) { renderAllTools(currentCat); return; }
  const filtered = TOOLS.filter(t =>
    t.name[currentLang].toLowerCase().includes(q) ||
    t.name.ar.toLowerCase().includes(q) ||
    t.name.en.toLowerCase().includes(q) ||
    t.desc[currentLang].toLowerCase().includes(q)
  );
  grid.innerHTML = filtered.length
    ? filtered.map(toolCardHTML).join('')
    : `<div class="empty-state" style="grid-column:1/-1">
        <span class="icon">🔍</span>
        <p>${currentLang === 'ar' ? 'لا توجد أدوات مطابقة' : 'No matching tools'}</p>
       </div>`;
  applyCardStagger();
}

// ===== RENDER TOOLS =====
function toolCardHTML(t) {
  const isFav   = favorites.includes(t.id);
  const isNew   = NEW_TOOLS.includes(t.id);
  const count   = usageCounts[t.id] || 0;
  const catName = CATEGORIES[t.cat][currentLang];
  return `
    <a href="${BASE_PATH}${t.url}" class="tool-card ripple-container animate-on-scroll" onclick="trackToolUse('${t.id}')">
      <span class="tool-icon">${t.icon}</span>
      <div class="tool-name">${t.name[currentLang]}</div>
      <div class="tool-desc">${t.desc[currentLang]}</div>
      <div class="tool-meta">
        <span class="tool-cat-badge">${catName}</span>
        ${isNew ? `<span class="tool-new-badge">${currentLang === 'ar' ? 'جديد' : 'New'}</span>` : ''}
      </div>
      ${count > 0 ? `<div class="tool-uses">▶ ${count.toLocaleString()} ${currentLang === 'ar' ? 'استخدام' : 'uses'}</div>` : ''}
      <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFav(event,'${t.id}')" title="${currentLang === 'ar' ? 'مفضلة' : 'Favorite'}">
        ${isFav ? '❤️' : '🤍'}
      </button>
    </a>`;
}

function renderCategoryTabs() {
  const wrap = document.getElementById('cat-tabs');
  if (!wrap) return;
  wrap.innerHTML = Object.entries(CATEGORIES).map(([k, v]) => {
    const count = k === 'all' ? TOOLS.length : TOOLS.filter(t => t.cat === k).length;
    return `<button class="cat-tab ${k === currentCat ? 'active' : ''}" onclick="filterCat('${k}')">
      ${v.icon} ${v[currentLang]} <span class="cat-count">${count}</span>
    </button>`;
  }).join('');
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
  applyCardStagger();
  setTimeout(initRipples, 50);
  setTimeout(initScrollAnimations, 60);
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
  if (favorites.length === 0) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  const grid = wrap.querySelector('.tools-grid');
  if (!grid) return;
  const favTools = favorites.map(id => TOOLS.find(t => t.id === id)).filter(Boolean);
  grid.innerHTML = favTools.map(toolCardHTML).join('');
}

// ===== HISTORY =====
function trackToolUse(id) {
  usageCounts[id] = (usageCounts[id] || 0) + 1;
  localStorage.setItem('tb_usage', JSON.stringify(usageCounts));
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
    <a href="${BASE_PATH}${t.url}" class="popular-card animate-on-scroll delay-${i+1}" onclick="trackToolUse('${t.id}')">
      <span class="popular-rank">${medals[i]}</span>
      <div class="popular-info">
        <div class="name">${t.icon} ${t.name[currentLang]}</div>
        <div class="count">${t.count.toLocaleString()} ${currentLang === 'ar' ? 'استخدام' : 'uses'}</div>
      </div>
    </a>`).join('');
}

// ===== HERO STATS =====
function updateHeroStats() {
  const totalUses = Object.values(usageCounts).reduce((a, b) => a + b, 0) + 150432;
  const el = document.getElementById('total-uses');
  if (el) animateCounter(el, totalUses);

  const toolsEl = document.getElementById('tools-count');
  if (toolsEl) animateCounter(toolsEl, TOOLS.length);
}

function animateCounter(el, target) {
  const start = 0;
  const duration = 1000;
  const startTime = performance.now();
  const update = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(start + (target - start) * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function simulateLiveUsers() {
  const el = document.getElementById('live-users');
  if (!el) return;
  const update = () => { el.textContent = Math.floor(20 + Math.random() * 60); };
  update();
  setInterval(update, 5000);
}

// ===== TOOL PAGE UTILITIES =====
function initToolPage(toolId) {
  trackToolUse(toolId);
  const tool = TOOLS.find(t => t.id === toolId);
  if (!tool) return;

  const usageEl = document.getElementById('tool-usage-count');
  if (usageEl) usageEl.textContent = (usageCounts[toolId] || 0).toLocaleString();

  const liveEl = document.getElementById('tool-live-users');
  if (liveEl) {
    liveEl.textContent = Math.floor(3 + Math.random() * 25);
    setInterval(() => { liveEl.textContent = Math.floor(3 + Math.random() * 25); }, 8000);
  }

  const favBtn = document.getElementById('tool-fav-btn');
  if (favBtn) {
    const isFav = favorites.includes(toolId);
    favBtn.textContent = isFav ? '❤️' : '🤍';
    favBtn.onclick = () => {
      const idx = favorites.indexOf(toolId);
      if (idx === -1) {
        favorites.push(toolId);
        favBtn.textContent = '❤️';
        showToast(currentLang === 'ar' ? '❤️ أُضيف للمفضلة' : 'Added to favorites', 'success');
      } else {
        favorites.splice(idx, 1);
        favBtn.textContent = '🤍';
        showToast(currentLang === 'ar' ? 'أُزيل من المفضلة' : 'Removed from favorites', 'info');
      }
      localStorage.setItem('tb_favorites', JSON.stringify(favorites));
    };
  }

  initShareButtons(tool);
  initRating(toolId);
  applyLang(currentLang);
  applyTheme(currentTheme);
  initParticles();
  setTimeout(initRipples, 150);
}

// ===== SHARE =====
function initShareButtons(tool) {
  const url  = encodeURIComponent(window.location.href);
  const text = encodeURIComponent((currentLang === 'ar' ? 'جرّب هذه الأداة المجانية: ' : 'Try this free tool: ') + tool.name[currentLang]);
  const btns = {
    'share-facebook':  `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    'share-telegram':  `https://t.me/share/url?url=${url}&text=${text}`,
    'share-whatsapp':  `https://wa.me/?text=${text}%20${url}`,
    'share-twitter':   `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
  };
  Object.entries(btns).forEach(([id, link]) => {
    const btn = document.getElementById(id);
    if (btn) btn.onclick = () => window.open(link, '_blank', 'width=600,height=400');
  });
}

// ===== RATING =====
function initRating(toolId) {
  const ratings    = JSON.parse(localStorage.getItem('tb_ratings') || '{}');
  const toolRating = ratings[toolId] || { likes: 0, dislikes: 0 };
  const likeBtn    = document.getElementById('tool-like');
  const dislikeBtn = document.getElementById('tool-dislike');

  if (likeBtn) {
    likeBtn.querySelector('.count') && (likeBtn.querySelector('.count').textContent = toolRating.likes);
    likeBtn.onclick = () => {
      toolRating.likes++;
      ratings[toolId] = toolRating;
      localStorage.setItem('tb_ratings', JSON.stringify(ratings));
      if (likeBtn.querySelector('.count')) likeBtn.querySelector('.count').textContent = toolRating.likes;
      likeBtn.classList.add('liked');
      showToast(currentLang === 'ar' ? '👍 شكراً لتقييمك!' : '👍 Thanks for rating!', 'success');
    };
  }
  if (dislikeBtn) {
    dislikeBtn.querySelector('.count') && (dislikeBtn.querySelector('.count').textContent = toolRating.dislikes);
    dislikeBtn.onclick = () => {
      toolRating.dislikes++;
      ratings[toolId] = toolRating;
      localStorage.setItem('tb_ratings', JSON.stringify(ratings));
      if (dislikeBtn.querySelector('.count')) dislikeBtn.querySelector('.count').textContent = toolRating.dislikes;
      dislikeBtn.classList.add('disliked');
    };
  }
}

// ===== COPY =====
function copyToClipboard(text, msg) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast(msg || (currentLang === 'ar' ? '✅ تم النسخ!' : '✅ Copied!'), 'success');
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(msg || (currentLang === 'ar' ? '✅ تم النسخ!' : '✅ Copied!'), 'success');
  });
}

// ===== TOAST =====
function showToast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ===== PWA =====
let deferredPrompt = null;
function initPWA() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('pwa-banner');
    if (banner && !sessionStorage.getItem('pwa-dismissed')) banner.classList.add('show');
  });

  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn) {
    installBtn.onclick = async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') showToast(currentLang === 'ar' ? '📱 تم التثبيت!' : '📱 Installed!', 'success');
      deferredPrompt = null;
      document.getElementById('pwa-banner')?.classList.remove('show');
    };
  }

  const dismissBtn = document.getElementById('pwa-dismiss');
  if (dismissBtn) {
    dismissBtn.onclick = () => {
      document.getElementById('pwa-banner')?.classList.remove('show');
      sessionStorage.setItem('pwa-dismissed', '1');
    };
  }
}

// ===== PARTICLES =====
function initParticles() {
  const container = document.getElementById('particles-bg');
  if (!container) return;
  container.innerHTML = '';
  const count = window.innerWidth < 768 ? 8 : 15;
  const colors = ['rgba(110,86,255,', 'rgba(230,57,70,', 'rgba(251,191,36,', 'rgba(6,182,212,'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 2 + Math.random() * 4;
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      background:${color}${0.3 + Math.random()*0.3});
      animation-duration:${12 + Math.random()*18}s;
      animation-delay:${Math.random()*10}s;
    `;
    container.appendChild(p);
  }
}

// ===== RIPPLES =====
function initRipples() {
  document.querySelectorAll('.ripple-container').forEach(el => {
    if (el.dataset.rippleInit) return;
    el.dataset.rippleInit = '1';
    el.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 1.5;
      const wave = document.createElement('span');
      wave.className = 'ripple-wave';
      wave.style.cssText = `width:${size}px;height:${size}px;left:${x - size/2}px;top:${y - size/2}px`;
      this.appendChild(wave);
      setTimeout(() => wave.remove(), 700);
    });
  });
}

// ===== CARD STAGGER =====
function applyCardStagger() {
  document.querySelectorAll('.tools-grid .tool-card, .popular-grid .popular-card').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 0.04, 0.5)}s`;
  });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}
