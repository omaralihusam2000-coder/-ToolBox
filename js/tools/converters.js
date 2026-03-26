/**
 * Converters: Arabic↔English Numbers, Timezone, Screen PPI
 */

// ============================================================
// ARABIC NUMBER CONVERTER
// ============================================================

const ARABIC_INDIC = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const PERSIAN      = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const WESTERN      = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

function initNumberConverter() {
  initToolPage('number-converter');
  renderNumRefTable();
}

function toWesternDigits(str) {
  return str.split('').map(ch => {
    const ai = ARABIC_INDIC.indexOf(ch);
    if (ai !== -1) return WESTERN[ai];
    const pi = PERSIAN.indexOf(ch);
    if (pi !== -1) return WESTERN[pi];
    return ch;
  }).join('');
}

function toArabicIndicDigits(str) {
  return str.split('').map(ch => {
    const wi = WESTERN.indexOf(ch);
    if (wi !== -1) return ARABIC_INDIC[wi];
    return ch;
  }).join('');
}

function convertToWestern() {
  const input = document.getElementById('num-input');
  if (!input) return;
  const result = toWesternDigits(input.value);
  showNumOutput(result);
}

function convertToArabicIndic() {
  const input = document.getElementById('num-input');
  if (!input) return;
  const result = toArabicIndicDigits(input.value);
  showNumOutput(result);
}

function autoConvert() {
  const input = document.getElementById('num-input');
  if (!input || !input.value) {
    document.getElementById('output-box').style.display = 'none';
    return;
  }
  // Auto-detect: if contains Arabic-Indic → convert to Western, else convert to Arabic-Indic
  const hasArabicIndic = ARABIC_INDIC.some(ch => input.value.includes(ch)) ||
                         PERSIAN.some(ch => input.value.includes(ch));
  const result = hasArabicIndic ? toWesternDigits(input.value) : toArabicIndicDigits(input.value);
  showNumOutput(result);
}

function showNumOutput(text) {
  const out = document.getElementById('num-output');
  const box = document.getElementById('output-box');
  if (out) out.textContent = text;
  if (box) box.style.display = 'block';
}

function copyOutput() {
  const out = document.getElementById('num-output');
  if (!out) return;
  navigator.clipboard.writeText(out.textContent).then(() => {
    showToast(window.currentLang === 'ar' ? '✅ تم النسخ!' : '✅ Copied!', 'success');
  });
}

function swapText() {
  const input = document.getElementById('num-input');
  const out = document.getElementById('num-output');
  if (!input || !out) return;
  const tmp = input.value;
  input.value = out.textContent;
  showNumOutput(tmp);
}

function clearAll() {
  const input = document.getElementById('num-input');
  if (input) input.value = '';
  document.getElementById('output-box').style.display = 'none';
}

function renderNumRefTable() {
  const tbody = document.getElementById('num-ref-table');
  if (!tbody) return;
  tbody.innerHTML = WESTERN.map((w, i) => `
    <tr>
      <td style="padding:8px 12px;border:1px solid var(--border-color);text-align:center;font-size:1.2rem;font-weight:700">${w}</td>
      <td style="padding:8px 12px;border:1px solid var(--border-color);text-align:center;font-size:1.2rem;font-weight:700;color:var(--accent-yellow)">${ARABIC_INDIC[i]}</td>
      <td style="padding:8px 12px;border:1px solid var(--border-color);text-align:center;font-size:1.2rem;font-weight:700;color:var(--accent-blue)">${PERSIAN[i]}</td>
    </tr>`).join('');
}

window.initNumberConverter = initNumberConverter;
window.convertToWestern = convertToWestern;
window.convertToArabicIndic = convertToArabicIndic;
window.autoConvert = autoConvert;
window.copyOutput = copyOutput;
window.swapText = swapText;
window.clearAll = clearAll;

// ============================================================
// TIMEZONE CONVERTER
// ============================================================

const TIMEZONES = [
  { id: 'Asia/Baghdad',       label: { ar: '🇮🇶 بغداد (AST +3)',     en: '🇮🇶 Baghdad (AST +3)'     }, flag: '🇮🇶' },
  { id: 'UTC',                label: { ar: '🌐 UTC / GMT',             en: '🌐 UTC / GMT'              }, flag: '🌐' },
  { id: 'Europe/London',      label: { ar: '🇬🇧 لندن',                en: '🇬🇧 London'               }, flag: '🇬🇧' },
  { id: 'Europe/Paris',       label: { ar: '🇫🇷 باريس / برلين',       en: '🇫🇷 Paris / Berlin'       }, flag: '🇫🇷' },
  { id: 'Europe/Moscow',      label: { ar: '🇷🇺 موسكو',               en: '🇷🇺 Moscow'               }, flag: '🇷🇺' },
  { id: 'Asia/Dubai',         label: { ar: '🇦🇪 دبي',                 en: '🇦🇪 Dubai'                }, flag: '🇦🇪' },
  { id: 'Asia/Riyadh',        label: { ar: '🇸🇦 الرياض',              en: '🇸🇦 Riyadh'               }, flag: '🇸🇦' },
  { id: 'Asia/Tehran',        label: { ar: '🇮🇷 طهران',               en: '🇮🇷 Tehran'               }, flag: '🇮🇷' },
  { id: 'Asia/Kolkata',       label: { ar: '🇮🇳 مومباي / دلهي',       en: '🇮🇳 Mumbai / Delhi'       }, flag: '🇮🇳' },
  { id: 'Asia/Singapore',     label: { ar: '🇸🇬 سنغافورة',            en: '🇸🇬 Singapore'            }, flag: '🇸🇬' },
  { id: 'Asia/Tokyo',         label: { ar: '🇯🇵 طوكيو',               en: '🇯🇵 Tokyo'                }, flag: '🇯🇵' },
  { id: 'Australia/Sydney',   label: { ar: '🇦🇺 سيدني',               en: '🇦🇺 Sydney'               }, flag: '🇦🇺' },
  { id: 'America/New_York',   label: { ar: '🇺🇸 نيويورك',             en: '🇺🇸 New York'             }, flag: '🇺🇸' },
  { id: 'America/Chicago',    label: { ar: '🇺🇸 شيكاغو',              en: '🇺🇸 Chicago'              }, flag: '🇺🇸' },
  { id: 'America/Los_Angeles',label: { ar: '🇺🇸 لوس أنجلوس',          en: '🇺🇸 Los Angeles'          }, flag: '🇺🇸' },
  { id: 'America/Toronto',    label: { ar: '🇨🇦 تورونتو',             en: '🇨🇦 Toronto'              }, flag: '🇨🇦' },
  { id: 'America/Sao_Paulo',  label: { ar: '🇧🇷 ساو باولو',           en: '🇧🇷 São Paulo'            }, flag: '🇧🇷' },
];

const WORLD_CLOCK_CITIES = [
  { id: 'Asia/Baghdad',        flag: '🇮🇶', ar: 'بغداد',         en: 'Baghdad'      },
  { id: 'UTC',                 flag: '🌐', ar: 'UTC',            en: 'UTC'          },
  { id: 'Europe/London',       flag: '🇬🇧', ar: 'لندن',          en: 'London'       },
  { id: 'Europe/Paris',        flag: '🇫🇷', ar: 'باريس',         en: 'Paris'        },
  { id: 'Asia/Dubai',          flag: '🇦🇪', ar: 'دبي',           en: 'Dubai'        },
  { id: 'Asia/Riyadh',         flag: '🇸🇦', ar: 'الرياض',        en: 'Riyadh'       },
  { id: 'Asia/Tokyo',          flag: '🇯🇵', ar: 'طوكيو',         en: 'Tokyo'        },
  { id: 'America/New_York',    flag: '🇺🇸', ar: 'نيويورك',       en: 'New York'     },
  { id: 'America/Los_Angeles', flag: '🇺🇸', ar: 'لوس أنجلوس',   en: 'Los Angeles'  },
];

function initTimezoneConverter() {
  initToolPage('timezone-converter');
  populateTZSelects();
  setDefaultDateTime();
  renderWorldClock();
  setInterval(renderWorldClock, 60000);
}

function populateTZSelects() {
  const lang = window.currentLang || 'ar';
  const fromEl = document.getElementById('tz-from');
  const toEl = document.getElementById('tz-to');
  if (!fromEl || !toEl) return;

  const opts = TIMEZONES.map(tz =>
    `<option value="${tz.id}">${tz.label[lang]}</option>`
  ).join('');

  fromEl.innerHTML = opts;
  toEl.innerHTML = opts;

  // Default: Baghdad → London
  fromEl.value = 'Asia/Baghdad';
  toEl.value = 'Europe/London';
}

function setDefaultDateTime() {
  const el = document.getElementById('tz-input');
  if (!el) return;
  const now = new Date();
  // format for datetime-local: YYYY-MM-DDTHH:MM
  const pad = n => String(n).padStart(2, '0');
  el.value = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function convertTZ() {
  const fromTZ = document.getElementById('tz-from')?.value;
  const toTZ   = document.getElementById('tz-to')?.value;
  const input  = document.getElementById('tz-input')?.value;

  if (!fromTZ || !toTZ || !input) return;

  try {
    // datetime-local gives us "YYYY-MM-DDTHH:MM" with no timezone info.
    // We want to treat that value as being in the SOURCE timezone.
    // Strategy: interpret the input as UTC, then adjust by the offset difference.
    const [datePart, timePart] = input.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    // Build a date in UTC so we have a fixed reference point
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
    if (isNaN(utcDate)) { showToast(window.currentLang === 'ar' ? 'تاريخ غير صحيح' : 'Invalid date', 'error'); return; }

    // Compute the UTC offset for the source timezone at this point in time
    // by comparing the UTC parts of a formatted string
    const srcParts = new Intl.DateTimeFormat('en-US', {
      timeZone: fromTZ, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(utcDate);

    const getPart = (parts, type) => parseInt(parts.find(p => p.type === type)?.value || '0');
    const srcYear   = getPart(srcParts, 'year');
    const srcMonth  = getPart(srcParts, 'month');
    const srcDay    = getPart(srcParts, 'day');
    const srcHour   = getPart(srcParts, 'hour');
    const srcMinute = getPart(srcParts, 'minute');

    // Offset between what UTC shows and what the source timezone shows (in ms)
    const srcLocalMs = Date.UTC(srcYear, srcMonth - 1, srcDay, srcHour, srcMinute);
    const offsetMs = utcDate.getTime() - srcLocalMs;

    // True UTC moment when the source time is as entered
    const trueUtc = new Date(utcDate.getTime() + offsetMs);

    const lang = window.currentLang || 'ar';
    const locale = lang === 'ar' ? 'ar-IQ' : 'en-US';

    const srcFormatted = trueUtc.toLocaleString(locale, {
      timeZone: fromTZ, dateStyle: 'full', timeStyle: 'short'
    });
    const tgtFormatted = trueUtc.toLocaleString(locale, {
      timeZone: toTZ, dateStyle: 'full', timeStyle: 'short'
    });

    const fromLabel = TIMEZONES.find(t => t.id === fromTZ)?.label[lang] || fromTZ;
    const toLabel   = TIMEZONES.find(t => t.id === toTZ)?.label[lang] || toTZ;

    const resultEl = document.getElementById('tz-result');
    const detailsEl = document.getElementById('tz-details');
    const box = document.getElementById('tz-result-box');

    if (resultEl) resultEl.textContent = tgtFormatted;
    if (detailsEl) detailsEl.innerHTML = `
      <div style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:16px;display:grid;gap:12px">
        <div style="display:flex;gap:8px;align-items:flex-start">
          <span style="min-width:28px;font-size:1.1rem">📤</span>
          <div>
            <div style="font-size:0.8rem;color:var(--text-muted)">${fromLabel}</div>
            <div style="font-weight:600">${srcFormatted}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:flex-start">
          <span style="min-width:28px;font-size:1.1rem">📥</span>
          <div>
            <div style="font-size:0.8rem;color:var(--text-muted)">${toLabel}</div>
            <div style="font-weight:700;color:var(--accent-yellow)">${tgtFormatted}</div>
          </div>
        </div>
      </div>`;
    if (box) box.style.display = 'block';
  } catch (e) {
    showToast(window.currentLang === 'ar' ? 'خطأ في التحويل' : 'Conversion error', 'error');
  }
}

function renderWorldClock() {
  const grid = document.getElementById('world-clock');
  if (!grid) return;
  const lang = window.currentLang || 'ar';
  const now = new Date();
  const baghdadTZ = 'Asia/Baghdad';

  grid.innerHTML = WORLD_CLOCK_CITIES.map(city => {
    const timeStr = now.toLocaleTimeString(lang === 'ar' ? 'ar-IQ' : 'en-US', {
      timeZone: city.id, hour: '2-digit', minute: '2-digit', hour12: true
    });
    const dateStr = now.toLocaleDateString(lang === 'ar' ? 'ar-IQ' : 'en-US', {
      timeZone: city.id, weekday: 'short', month: 'short', day: 'numeric'
    });
    const isHighlighted = city.id === baghdadTZ;
    return `
      <div class="tz-clock-card ${isHighlighted ? 'highlight' : ''}">
        <div class="tz-flag">${city.flag}</div>
        <div class="tz-city">${city[lang]}</div>
        <div class="tz-time">${timeStr}</div>
        <div class="tz-date">${dateStr}</div>
      </div>`;
  }).join('');
}

window.initTimezoneConverter = initTimezoneConverter;
window.convertTZ = convertTZ;

// ============================================================
// SCREEN PPI CALCULATOR
// ============================================================

const DEVICE_PRESETS = [
  { name: 'iPhone 15 Pro', w: 2556, h: 1179, d: 6.1 },
  { name: 'iPhone 14',     w: 2532, h: 1170, d: 6.1 },
  { name: 'Samsung S24',   w: 3088, h: 1440, d: 6.2 },
  { name: 'MacBook Pro 14',w: 3024, h: 1964, d: 14.2 },
  { name: 'MacBook Air 13',w: 2560, h: 1664, d: 13.6 },
  { name: 'iPad Pro 12.9', w: 2732, h: 2048, d: 12.9 },
  { name: 'Full HD 24"',   w: 1920, h: 1080, d: 24   },
  { name: '4K 27"',        w: 3840, h: 2160, d: 27   },
  { name: 'HD 720p 32"',   w: 1280, h:  720, d: 32   },
];

const PPI_QUALITY = [
  { min: 400, label: { ar: '🔬 متناهي الدقة (Retina+)', en: '🔬 Super Retina+' }, cls: 'quality-excellent' },
  { min: 300, label: { ar: '✨ ريتينا (Retina)',         en: '✨ Retina Display' }, cls: 'quality-good'      },
  { min: 200, label: { ar: '✅ عالي الدقة (HiDPI)',       en: '✅ High DPI'       }, cls: 'quality-fair'      },
  { min: 100, label: { ar: '📺 دقة عادية',               en: '📺 Standard'       }, cls: 'quality-poor'      },
  { min:   0, label: { ar: '⚠️ دقة منخفضة',             en: '⚠️ Low DPI'        }, cls: 'quality-poor'      },
];

function initScreenPPI() {
  initToolPage('screen-ppi');
  renderDevicePresets();
  renderPPIRefTable();
}

function renderDevicePresets() {
  const wrap = document.getElementById('device-presets');
  if (!wrap) return;
  wrap.innerHTML = DEVICE_PRESETS.map(d => `
    <button class="device-preset-btn" onclick="loadPreset(${d.w},${d.h},${d.d})">${d.name}</button>`).join('');
}

function loadPreset(w, h, d) {
  document.getElementById('ppi-width').value = w;
  document.getElementById('ppi-height').value = h;
  document.getElementById('ppi-diagonal').value = d;
  calculatePPI();
}

function calculatePPI() {
  const w = parseFloat(document.getElementById('ppi-width')?.value);
  const h = parseFloat(document.getElementById('ppi-height')?.value);
  const d = parseFloat(document.getElementById('ppi-diagonal')?.value);

  if (!w || !h || !d || d <= 0) {
    document.getElementById('ppi-result-box').style.display = 'none';
    return;
  }

  const ppi = Math.sqrt(w * w + h * h) / d;
  const dotPitch = 25.4 / ppi; // mm

  const lang = window.currentLang || 'ar';
  const ppiEl = document.getElementById('ppi-value');
  const qualEl = document.getElementById('ppi-quality');
  const detEl = document.getElementById('ppi-details');
  const box = document.getElementById('ppi-result-box');

  if (ppiEl) ppiEl.textContent = Math.round(ppi);

  // Quality
  const qual = PPI_QUALITY.find(q => ppi >= q.min) || PPI_QUALITY[PPI_QUALITY.length - 1];
  if (qualEl) {
    qualEl.className = 'ppi-quality-badge ' + qual.cls;
    qualEl.textContent = qual.label[lang];
  }

  if (detEl) {
    detEl.innerHTML = `
      <div class="stat-card"><div class="num">${Math.round(ppi)}</div><div class="lbl">PPI</div></div>
      <div class="stat-card"><div class="num">${dotPitch.toFixed(3)}</div><div class="lbl">${lang === 'ar' ? 'حجم البكسل (مم)' : 'Dot Pitch (mm)'}</div></div>
      <div class="stat-card"><div class="num">${w}×${h}</div><div class="lbl">${lang === 'ar' ? 'الدقة' : 'Resolution'}</div></div>
      <div class="stat-card"><div class="num">${d}"</div><div class="lbl">${lang === 'ar' ? 'الحجم' : 'Size'}</div></div>`;
  }

  if (box) box.style.display = 'block';
}

function renderPPIRefTable() {
  const wrap = document.getElementById('ppi-ref-table');
  if (!wrap) return;
  const lang = window.currentLang || 'ar';
  // Show the 4 named quality tiers (excludes the catch-all "low DPI" fallback entry)
  const DISPLAYED_QUALITY_LEVELS = 4;
  wrap.innerHTML = `
    <div style="display:grid;gap:8px">
      ${PPI_QUALITY.slice(0, DISPLAYED_QUALITY_LEVELS).map((q, i) => {
        const ranges = ['400+', '300-399', '200-299', '100-199'];
        return `<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-sm)">
          <span class="ppi-quality-badge ${q.cls}" style="min-width:120px;text-align:center">${q.label[lang]}</span>
          <span style="font-weight:700;color:var(--text-primary)">${ranges[i]} PPI</span>
          <span style="font-size:0.8rem;color:var(--text-muted)">${lang === 'ar' ? descAr(i) : descEn(i)}</span>
        </div>`;
      }).join('')}
    </div>`;
}

function descAr(i) {
  return ['هواتف Retina الحديثة مثل iPhone Pro', 'شاشات الهواتف الذكية عالية الجودة', 'شاشات اللابتوب والتابلت', 'شاشات الكمبيوتر العادية'][i] || '';
}
function descEn(i) {
  return ['Modern Retina phones like iPhone Pro', 'High-quality smartphone displays', 'Laptop and tablet screens', 'Standard desktop monitors'][i] || '';
}

window.initScreenPPI = initScreenPPI;
window.loadPreset = loadPreset;
window.calculatePPI = calculatePPI;
