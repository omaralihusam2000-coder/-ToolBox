/**
 * Developer Tools: IP, Password, JSON Formatter, Minifier, Regex, Markdown
 */

// ===== MY IP ADDRESS =====
async function initMyIp() {
  initToolPage('my-ip');
  await fetchIPInfo();
}

async function fetchIPInfo() {
  const container = document.getElementById('ip-result');
  if (!container) return;

  container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted)">⏳ ${currentLang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>`;

  try {
    // Use ipapi.co for IP info
    const resp = await fetch('https://ipapi.co/json/');
    const data = await resp.json();

    container.innerHTML = `
      <div class="stats-row">
        <div class="stat-card" style="grid-column:1/-1">
          <div class="num" style="font-size:2rem;letter-spacing:2px">${data.ip}</div>
          <div class="lbl">${currentLang === 'ar' ? 'عنوان IP الخاص بك' : 'Your IP Address'}</div>
        </div>
      </div>
      <div style="display:grid;gap:12px;margin-top:16px">
        ${createIPRow('🌍', currentLang === 'ar' ? 'الدولة' : 'Country', data.country_name + ' ' + (data.country_code || ''))}
        ${createIPRow('🏙️', currentLang === 'ar' ? 'المدينة' : 'City', data.city || 'N/A')}
        ${createIPRow('🗺️', currentLang === 'ar' ? 'المنطقة' : 'Region', data.region || 'N/A')}
        ${createIPRow('📡', currentLang === 'ar' ? 'مزود الإنترنت' : 'ISP', data.org || 'N/A')}
        ${createIPRow('⏰', currentLang === 'ar' ? 'المنطقة الزمنية' : 'Timezone', data.timezone || 'N/A')}
        ${createIPRow('🌐', currentLang === 'ar' ? 'نوع IP' : 'IP Type', data.version || 'IPv4')}
      </div>`;

    document.getElementById('result-section').style.display = 'block';

  } catch (e) {
    // Fallback to another API
    try {
      const resp2 = await fetch('https://api.ipify.org?format=json');
      const data2 = await resp2.json();
      container.innerHTML = `<div style="text-align:center;padding:24px">
        <div style="font-size:2.5rem;font-weight:900;color:var(--accent-yellow)">${data2.ip}</div>
        <div style="color:var(--text-muted);margin-top:8px">${currentLang === 'ar' ? 'عنوان IP الخاص بك' : 'Your IP Address'}</div>
      </div>`;
      document.getElementById('result-section').style.display = 'block';
    } catch {
      container.innerHTML = `<div style="text-align:center;color:var(--accent-red);padding:20px">${currentLang === 'ar' ? 'تعذّر جلب معلومات IP' : 'Could not fetch IP info'}</div>`;
    }
  }
}

function createIPRow(icon, label, value) {
  return `<div style="display:flex;align-items:center;gap:12px;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:12px 16px">
    <span style="font-size:1.2rem">${icon}</span>
    <span style="color:var(--text-muted);font-size:0.85rem;min-width:100px">${label}</span>
    <span style="font-weight:700;color:var(--text-primary)">${value}</span>
  </div>`;
}

window.initMyIp = initMyIp;

// ===== PASSWORD GENERATOR =====
function initPasswordGenerator() {
  initToolPage('password-generator');
  generatePassword();
}

function generatePassword() {
  const length = parseInt(document.getElementById('pwd-length').value) || 16;
  const useUpper = document.getElementById('use-upper')?.checked !== false;
  const useLower = document.getElementById('use-lower')?.checked !== false;
  const useNumbers = document.getElementById('use-numbers')?.checked !== false;
  const useSymbols = document.getElementById('use-symbols')?.checked;

  document.getElementById('pwd-length-val').textContent = length;

  let charset = '';
  if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (useNumbers) charset += '0123456789';
  if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!charset) { showToast(currentLang === 'ar' ? 'اختر نوعاً واحداً على الأقل' : 'Select at least one type', 'error'); return; }

  let password = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }

  document.getElementById('pwd-output').textContent = password;
  updateStrengthMeter(password, useUpper, useLower, useNumbers, useSymbols);
  document.getElementById('result-section').style.display = 'block';
}

function updateStrengthMeter(pwd, upper, lower, numbers, symbols) {
  let score = 0;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (upper) score++;
  if (lower) score++;
  if (numbers) score++;
  if (symbols) score++;

  const pct = Math.min(100, (score / 6) * 100);
  const bar = document.getElementById('strength-bar');
  const label = document.getElementById('strength-label');

  if (bar) bar.style.width = pct + '%';

  if (pct < 40) {
    if (bar) bar.style.background = 'var(--accent-red)';
    if (label) label.textContent = currentLang === 'ar' ? '🔴 ضعيف' : '🔴 Weak';
  } else if (pct < 70) {
    if (bar) bar.style.background = 'var(--accent-yellow)';
    if (label) label.textContent = currentLang === 'ar' ? '🟡 متوسط' : '🟡 Medium';
  } else {
    if (bar) bar.style.background = '#22c55e';
    if (label) label.textContent = currentLang === 'ar' ? '🟢 قوي جداً' : '🟢 Very Strong';
  }
}

window.initPasswordGenerator = initPasswordGenerator;
window.generatePassword = generatePassword;

// ===== JSON FORMATTER =====
function initJsonFormatter() {
  initToolPage('json-formatter');
}

function formatJSON() {
  const input = document.getElementById('json-input').value.trim();
  if (!input) { showToast(currentLang === 'ar' ? 'أدخل JSON' : 'Enter JSON', 'error'); return; }

  try {
    const parsed = JSON.parse(input);
    const indent = parseInt(document.getElementById('indent-size')?.value || 2);
    const formatted = JSON.stringify(parsed, null, indent);
    document.getElementById('json-output').textContent = formatted;
    document.getElementById('result-section').style.display = 'block';

    const lines = formatted.split('\n').length;
    const size = new Blob([formatted]).size;
    document.getElementById('json-stats').textContent = currentLang === 'ar'
      ? `${lines} سطر | ${formatFileSize(size)}`
      : `${lines} lines | ${formatFileSize(size)}`;

    showToast(currentLang === 'ar' ? '✅ تم التنسيق!' : '✅ Formatted!', 'success');
  } catch (e) {
    const errEl = document.getElementById('json-error');
    if (errEl) errEl.textContent = currentLang === 'ar' ? 'خطأ: ' + e.message : 'Error: ' + e.message;
    showToast(currentLang === 'ar' ? '❌ JSON غير صالح' : '❌ Invalid JSON', 'error');
  }
}

function minifyJSON() {
  const input = document.getElementById('json-input').value.trim();
  try {
    const parsed = JSON.parse(input);
    document.getElementById('json-output').textContent = JSON.stringify(parsed);
    document.getElementById('result-section').style.display = 'block';
    showToast(currentLang === 'ar' ? '✅ تم الضغط!' : '✅ Minified!', 'success');
  } catch (e) {
    showToast(currentLang === 'ar' ? '❌ JSON غير صالح' : '❌ Invalid JSON', 'error');
  }
}

window.initJsonFormatter = initJsonFormatter;
window.formatJSON = formatJSON;
window.minifyJSON = minifyJSON;

// ===== CODE MINIFIER =====
function initMinifier() {
  initToolPage('minifier');
}

function minifyCode() {
  const input = document.getElementById('code-input').value;
  const type = document.getElementById('code-type').value;
  if (!input.trim()) { showToast(currentLang === 'ar' ? 'أدخل كوداً' : 'Enter code', 'error'); return; }

  let result;
  try {
    if (type === 'css') result = minifyCSS(input);
    else if (type === 'html') result = minifyHTML(input);
    else result = minifyJS(input);

    document.getElementById('code-output').textContent = result;
    document.getElementById('result-section').style.display = 'block';

    const original = new Blob([input]).size;
    const minified = new Blob([result]).size;
    const savings = Math.round((1 - minified / original) * 100);

    document.getElementById('minify-stats').textContent = currentLang === 'ar'
      ? `${formatFileSize(original)} → ${formatFileSize(minified)} (توفير ${savings}%)`
      : `${formatFileSize(original)} → ${formatFileSize(minified)} (saved ${savings}%)`;

    showToast(currentLang === 'ar' ? `✅ تم التصغير! وفّرت ${savings}%` : `✅ Minified! Saved ${savings}%`, 'success');
  } catch (e) {
    showToast(currentLang === 'ar' ? 'خطأ: ' + e.message : 'Error: ' + e.message, 'error');
  }
}

function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    .trim();
}

function minifyHTML(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

function minifyJS(js) {
  return js
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([=+\-*/<>!&|,;:{}()[\]])\s*/g, '$1')
    .trim();
}

window.initMinifier = initMinifier;
window.minifyCode = minifyCode;

// ===== REGEX TESTER =====
function initRegexTester() {
  initToolPage('regex-tester');
}

function testRegex() {
  const pattern = document.getElementById('regex-pattern').value;
  const flags = document.getElementById('regex-flags').value;
  const text = document.getElementById('regex-text').value;

  if (!pattern) { showToast(currentLang === 'ar' ? 'أدخل النمط' : 'Enter a pattern', 'error'); return; }

  try {
    const regex = new RegExp(pattern, flags);
    const matches = [...text.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'))];

    const highlighted = text.replace(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'), (m) =>
      `<mark>${m}</mark>`
    );

    const outputEl = document.getElementById('regex-output');
    if (outputEl) outputEl.innerHTML = highlighted;

    const statsEl = document.getElementById('regex-stats');
    if (statsEl) {
      statsEl.textContent = currentLang === 'ar'
        ? `وُجدت ${matches.length} تطابق`
        : `Found ${matches.length} match(es)`;
    }

    // Show match details
    const detailsEl = document.getElementById('match-details');
    if (detailsEl && matches.length > 0) {
      detailsEl.innerHTML = matches.slice(0, 10).map((m, i) => `
        <div style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:8px 12px;font-family:monospace;font-size:0.85rem">
          <span style="color:var(--text-muted)">[${i + 1}]</span>
          <mark style="margin:0 8px">${m[0]}</mark>
          <span style="color:var(--text-muted)">${currentLang === 'ar' ? 'الموضع:' : 'at:'} ${m.index}</span>
        </div>`).join('');
      detailsEl.style.display = 'block';
    }

    document.getElementById('result-section').style.display = 'block';

  } catch (e) {
    showToast(currentLang === 'ar' ? 'نمط غير صالح: ' + e.message : 'Invalid pattern: ' + e.message, 'error');
  }
}

window.initRegexTester = initRegexTester;
window.testRegex = testRegex;

// ===== MARKDOWN PREVIEW =====
function initMarkdownPreview() {
  initToolPage('markdown-preview');
  const textarea = document.getElementById('md-input');
  if (textarea) {
    textarea.addEventListener('input', updateMarkdownPreview);
    // Default content
    if (!textarea.value) {
      textarea.value = `# مرحباً بـ Markdown Preview\n\n## مثال على الاستخدام\n\nيمكنك كتابة **نص غامق** أو *نص مائل* أو \`كود\`.\n\n### قائمة:\n- عنصر أول\n- عنصر ثاني\n- عنصر ثالث\n\n### كود:\n\`\`\`javascript\nconsole.log("Hello World!");\n\`\`\`\n\n> هذا مقتبس من نص مهم\n\n[رابط تجريبي](https://example.com)`;
    }
    updateMarkdownPreview();
  }
}

function updateMarkdownPreview() {
  const input = document.getElementById('md-input').value;
  const preview = document.getElementById('md-preview');
  if (!preview) return;

  if (window.marked) {
    preview.innerHTML = marked.parse(input);
    // Apply syntax highlighting if available
    if (window.hljs) {
      preview.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
    }
  } else {
    // Simple fallback
    preview.innerHTML = input.replace(/\n/g, '<br>');
  }
}

function copyMarkdown() {
  const input = document.getElementById('md-input').value;
  copyText(input);
}

function downloadMarkdown() {
  const input = document.getElementById('md-input').value;
  const blob = new Blob([input], { type: 'text/markdown' });
  downloadBlob(blob, 'document.md');
}

window.initMarkdownPreview = initMarkdownPreview;
window.updateMarkdownPreview = updateMarkdownPreview;
window.copyMarkdown = copyMarkdown;
window.downloadMarkdown = downloadMarkdown;
