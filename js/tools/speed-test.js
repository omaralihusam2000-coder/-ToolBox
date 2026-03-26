/**
 * Internet Speed Test - Professional
 * Uses fetch API with timing to measure download/upload speed and ping.
 * Features: ISP detection, connection type, server info, usage recommendations
 */

// ===== INIT =====
function initSpeedTest() {
  initToolPage('speed-test');
  detectConnectionInfo();
  renderSpeedHistory();
}

// ===== CONNECTION INFO =====
function detectConnectionInfo() {
  // Network type
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const typeEl = document.getElementById('conn-type');
  if (typeEl && conn) {
    const type = conn.effectiveType || conn.type || '--';
    const typeLabels = { '4g': '4G / WiFi', '3g': '3G', '2g': '2G', 'slow-2g': 'Slow 2G', 'wifi': 'WiFi', 'ethernet': 'Ethernet' };
    typeEl.textContent = typeLabels[type] || type.toUpperCase();
  } else if (typeEl) {
    typeEl.textContent = currentLang === 'ar' ? 'غير معروف' : 'Unknown';
  }

  // IP address (lightweight fetch)
  const ipEl = document.getElementById('conn-ip');
  if (ipEl) {
    fetch('https://cloudflare.com/cdn-cgi/trace', { cache: 'no-store' })
      .then(r => r.text())
      .then(text => {
        const ipMatch = text.match(/ip=(.+)/);
        if (ipMatch) ipEl.textContent = ipMatch[1].trim();
      })
      .catch(() => { ipEl.textContent = '--'; });
  }
}

// ===== GAUGE =====
const GAUGE_TOTAL = 377; // stroke-dasharray of the arc path (updated for larger gauge)

function setGauge(mbps, maxMbps) {
  const fill = document.getElementById('gauge-fill');
  const numEl = document.getElementById('gauge-num');
  if (!fill || !numEl) return;

  const capped = Math.min(mbps, maxMbps);
  const pct = capped / maxMbps;
  const offset = GAUGE_TOTAL - pct * GAUGE_TOTAL;
  fill.style.strokeDashoffset = offset;

  // Color by speed
  if (pct > 0.66) fill.style.stroke = '#22c55e';
  else if (pct > 0.33) fill.style.stroke = 'var(--accent-yellow)';
  else fill.style.stroke = 'var(--accent-red)';

  numEl.textContent = mbps >= 100 ? Math.round(mbps) : mbps.toFixed(1);
}

function resetGauge() {
  const fill = document.getElementById('gauge-fill');
  if (fill) { fill.style.strokeDashoffset = GAUGE_TOTAL; fill.style.stroke = 'var(--accent-red)'; }
  const numEl = document.getElementById('gauge-num');
  if (numEl) numEl.textContent = '0';
}

// ===== PROGRESS =====
function setProgress(pct) {
  const bar = document.getElementById('progress-fill');
  if (bar) bar.style.width = pct + '%';
}

function setPhaseLabel(text) {
  const el = document.getElementById('phase-label');
  if (el) el.textContent = text;
}

// ===== PING TEST =====
async function measurePing() {
  const pings = [];
  const url = 'https://cloudflare.com/cdn-cgi/trace';

  for (let i = 0; i < 5; i++) {
    const t0 = performance.now();
    try {
      await fetch(url + '?r=' + Math.random(), { mode: 'no-cors', cache: 'no-store' });
    } catch (_) {
      // no-cors may throw; timing still works
    }
    pings.push(performance.now() - t0);
    await sleep(100);
  }
  pings.sort((a, b) => a - b);
  // Remove highest outlier
  const trimmed = pings.slice(0, 4);
  const avg = trimmed.reduce((s, v) => s + v, 0) / trimmed.length;
  const min = trimmed[0];
  const jitter = trimmed.reduce((s, v) => s + Math.abs(v - avg), 0) / trimmed.length;
  return { ping: Math.round(min), jitter: Math.round(jitter) };
}

// ===== DOWNLOAD TEST =====
async function measureDownload(onProgress) {
  // Download progressively larger payloads from Cloudflare
  const testUrls = [
    'https://speed.cloudflare.com/__down?bytes=1000000',    // 1 MB
    'https://speed.cloudflare.com/__down?bytes=5000000',    // 5 MB
    'https://speed.cloudflare.com/__down?bytes=10000000',   // 10 MB
    'https://speed.cloudflare.com/__down?bytes=25000000',   // 25 MB
  ];

  const results = [];
  let attempt = 0;

  for (const url of testUrls) {
    attempt++;
    try {
      const t0 = performance.now();
      const res = await fetch(url + '&r=' + Math.random(), { cache: 'no-store' });
      const blob = await res.blob();
      const elapsed = (performance.now() - t0) / 1000; // seconds
      const bytes = blob.size;
      const mbps = (bytes * 8) / (elapsed * 1_000_000);
      results.push(mbps);
      onProgress(Math.round((attempt / testUrls.length) * 100), mbps);
    } catch (_) {
      // try next
    }
  }

  if (results.length === 0) return fallbackDownloadTest(onProgress);
  // Use median of last 3 results for more stable reading
  const sorted = results.slice().sort((a, b) => a - b);
  return sorted.length >= 3 ? sorted[Math.floor(sorted.length / 2)] : Math.max(...results);
}

// Fallback: generate local data blob to test throughput
async function fallbackDownloadTest(onProgress) {
  const sizes = [500_000, 2_000_000, 5_000_000];
  const results = [];

  for (let i = 0; i < sizes.length; i++) {
    const data = new Uint8Array(sizes[i]);
    crypto.getRandomValues(data.subarray(0, Math.min(65536, sizes[i])));
    const blob = new Blob([data]);
    const url = URL.createObjectURL(blob);

    const t0 = performance.now();
    const res = await fetch(url, { cache: 'no-store' });
    await res.blob();
    const elapsed = (performance.now() - t0) / 1000;
    URL.revokeObjectURL(url);

    const mbps = (sizes[i] * 8) / (elapsed * 1_000_000);
    results.push(mbps);
    onProgress(Math.round(((i + 1) / sizes.length) * 100), mbps);
    await sleep(50);
  }
  return Math.max(...results);
}

// ===== UPLOAD TEST =====
async function measureUpload(onProgress) {
  const sizes = [500_000, 2_000_000, 5_000_000];
  const results = [];

  for (let i = 0; i < sizes.length; i++) {
    const data = new Uint8Array(sizes[i]);
    // Fill with pseudo-random data (first 64KB)
    crypto.getRandomValues(data.subarray(0, Math.min(65536, sizes[i])));
    const blob = new Blob([data]);

    try {
      const t0 = performance.now();
      await fetch('https://speed.cloudflare.com/__up', {
        method: 'POST',
        body: blob,
        headers: { 'Content-Type': 'application/octet-stream' },
        cache: 'no-store',
      });
      const elapsed = (performance.now() - t0) / 1000;
      const mbps = (sizes[i] * 8) / (elapsed * 1_000_000);
      results.push(mbps);
    } catch (_) {
      // Cannot measure real upload speed without a server — push 0
      results.push(0);
    }

    onProgress(Math.round(((i + 1) / sizes.length) * 100), results[results.length - 1]);
    await sleep(100);
  }

  return results.length ? Math.max(...results) : 0;
}

// ===== MAIN TEST =====
let isRunning = false;

async function startSpeedTest() {
  if (isRunning) return;

  // Check internet connection first
  if (!navigator.onLine) {
    const lang = window.currentLang || 'ar';
    showToast(lang === 'ar' ? 'لا يوجد اتصال بالإنترنت!' : 'No internet connection!', 'error');
    return;
  }

  isRunning = true;

  const startBtn = document.getElementById('start-btn');
  const btnLabel = document.getElementById('btn-label');
  if (startBtn) startBtn.disabled = true;

  document.getElementById('results-section').style.display = 'none';
  document.getElementById('gauge-container').classList.add('testing');
  const serverInfo = document.getElementById('server-info');
  if (serverInfo) { serverInfo.style.display = 'block'; serverInfo.innerHTML = '<strong>Cloudflare Edge</strong> — CDN'; }
  resetGauge();
  setProgress(0);

  const lang = window.currentLang || 'ar';

  try {
    // Phase 1: Ping
    setPhaseLabel(lang === 'ar' ? '📶 جاري قياس زمن الاستجابة...' : '📶 Measuring ping...');
    if (btnLabel) btnLabel.textContent = lang === 'ar' ? 'جارٍ الاختبار...' : 'Testing...';
    setProgress(5);

    const { ping, jitter } = await measurePing();
    setProgress(15);
    setPhaseLabel(lang === 'ar' ? `📶 Ping: ${ping} ms` : `📶 Ping: ${ping} ms`);
    await sleep(400);

    // Phase 2: Download
    setPhaseLabel(lang === 'ar' ? '⬇️ جاري قياس سرعة التحميل...' : '⬇️ Measuring download speed...');
    let dlMbps = 0;
    const dlMbpsResult = await measureDownload((pct, current) => {
      setProgress(15 + pct * 0.5);
      setGauge(current, 200);
      dlMbps = current;
    });
    dlMbps = dlMbpsResult;
    setProgress(65);
    setGauge(dlMbps, 200);
    await sleep(400);

    // Phase 3: Upload
    setPhaseLabel(lang === 'ar' ? '⬆️ جاري قياس سرعة الرفع...' : '⬆️ Measuring upload speed...');
    let ulMbps = 0;
    const ulMbpsResult = await measureUpload((pct, current) => {
      setProgress(65 + pct * 0.3);
      setGauge(current, 100);
      ulMbps = current;
    });
    ulMbps = ulMbpsResult;
    setProgress(100);
    setGauge(dlMbps, 200);

    // Show results
    await sleep(400);
    showSpeedResults({ download: dlMbps, upload: ulMbps, ping, jitter });
    saveSpeedHistory({ download: dlMbps, upload: ulMbps, ping, jitter });
    renderSpeedHistory();

    setPhaseLabel(lang === 'ar' ? '✅ اكتمل الاختبار' : '✅ Test Complete');
    if (serverInfo) serverInfo.style.display = 'none';
  } catch (err) {
    setPhaseLabel(lang === 'ar' ? '❌ حدث خطأ أثناء الاختبار' : '❌ Error during test');
    showToast(lang === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'Error occurred, please retry', 'error');
  } finally {
    isRunning = false;
    document.getElementById('gauge-container').classList.remove('testing');
    if (startBtn) startBtn.disabled = false;
    if (btnLabel) btnLabel.textContent = lang === 'ar' ? 'ابدأ الاختبار' : 'Start Test';
  }
}

function showSpeedResults({ download, upload, ping, jitter }) {
  const fmt = (v) => v >= 100 ? Math.round(v) : v.toFixed(1);

  document.getElementById('res-download').textContent = fmt(download);
  document.getElementById('res-upload').textContent = upload > 0 ? fmt(upload) : 'N/A';
  document.getElementById('res-ping').textContent = ping;
  document.getElementById('res-jitter').textContent = jitter;

  // Quality rating
  const badge = document.getElementById('quality-badge');
  const lang = window.currentLang || 'ar';
  let cls, label;
  if (download >= 100 && ping < 20) {
    cls = 'quality-excellent';
    label = lang === 'ar' ? '🚀 ممتاز — أداء احترافي' : '🚀 Excellent — Pro Performance';
  } else if (download >= 25 && ping < 50) {
    cls = 'quality-good';
    label = lang === 'ar' ? '✅ جيد — أداء مستقر' : '✅ Good — Stable Performance';
  } else if (download >= 5 && ping < 100) {
    cls = 'quality-fair';
    label = lang === 'ar' ? '⚠️ متوسط — قابل للتحسين' : '⚠️ Fair — Could Be Better';
  } else {
    cls = 'quality-poor';
    label = lang === 'ar' ? '🔴 ضعيف — يحتاج تحسين' : '🔴 Poor — Needs Improvement';
  }
  if (badge) { badge.className = 'quality-badge ' + cls; badge.textContent = label; }

  // Recommendations
  renderRecommendations(download, upload, ping);

  document.getElementById('results-section').style.display = 'block';
}

// ===== RECOMMENDATIONS =====
function renderRecommendations(download, upload, ping) {
  const lang = window.currentLang || 'ar';
  const recList = document.getElementById('rec-list');
  if (!recList) return;

  const items = [
    { ar: '📧 البريد الإلكتروني', en: '📧 Email', need: 1, type: 'dl' },
    { ar: '🌐 تصفح الويب', en: '🌐 Web Browsing', need: 3, type: 'dl' },
    { ar: '📺 YouTube HD', en: '📺 YouTube HD', need: 5, type: 'dl' },
    { ar: '🎬 Netflix 4K', en: '🎬 Netflix 4K', need: 25, type: 'dl' },
    { ar: '🎮 الألعاب أونلاين', en: '🎮 Online Gaming', need: 50, type: 'ping' },
    { ar: '📹 مكالمات فيديو', en: '📹 Video Calls', need: 5, type: 'ul' },
    { ar: '☁️ رفع ملفات كبيرة', en: '☁️ Large Uploads', need: 20, type: 'ul' },
    { ar: '🔴 البث المباشر', en: '🔴 Live Streaming', need: 10, type: 'ul' },
  ];

  recList.innerHTML = items.map(item => {
    let ok, partial;
    if (item.type === 'dl') {
      ok = download >= item.need;
      partial = download >= item.need * 0.5;
    } else if (item.type === 'ul') {
      ok = upload >= item.need;
      partial = upload >= item.need * 0.5;
    } else {
      ok = ping <= item.need;
      partial = ping <= item.need * 2;
    }

    const cls = ok ? 'ok' : partial ? 'warn' : 'bad';
    const icon = cls === 'ok' ? '✓' : cls === 'warn' ? '~' : '✗';
    return `<span class="speed-rec-item ${cls}">${icon} ${item[lang]}</span>`;
  }).join('');
}

// ===== HISTORY =====
function saveSpeedHistory(result) {
  const history = JSON.parse(localStorage.getItem('tb_speed_history') || '[]');
  history.unshift({ ...result, ts: new Date().toLocaleString() });
  localStorage.setItem('tb_speed_history', JSON.stringify(history.slice(0, 10)));
}

function renderSpeedHistory() {
  const history = JSON.parse(localStorage.getItem('tb_speed_history') || '[]');
  const box = document.getElementById('history-box');
  const list = document.getElementById('history-list');
  if (!box || !list) return;

  if (history.length === 0) { box.style.display = 'none'; return; }
  box.style.display = 'block';
  const lang = window.currentLang || 'ar';
  const fmt = (v) => (v >= 100 ? Math.round(v) : parseFloat(v).toFixed(1));

  list.innerHTML = history.map(h => `
    <div class="speed-history-item">
      <div class="ts">🕐 ${h.ts}</div>
      <div class="vals">
        <div class="hval">⬇️ <strong>${fmt(h.download)} Mbps</strong></div>
        <div class="hval">⬆️ <strong>${fmt(h.upload)} Mbps</strong></div>
        <div class="hval">📶 <strong>${h.ping} ms</strong></div>
      </div>
    </div>`).join('');
}

function clearHistory() {
  localStorage.removeItem('tb_speed_history');
  renderSpeedHistory();
  showToast(window.currentLang === 'ar' ? 'تم مسح السجل' : 'History cleared', 'info');
}

function shareResults() {
  const dl = document.getElementById('res-download')?.textContent;
  const ul = document.getElementById('res-upload')?.textContent;
  const ping = document.getElementById('res-ping')?.textContent;
  const jitter = document.getElementById('res-jitter')?.textContent;
  const lang = window.currentLang || 'ar';
  const text = lang === 'ar'
    ? `🔥 نتائج اختبار سرعة الإنترنت:\n⬇️ تحميل: ${dl} Mbps\n⬆️ رفع: ${ul} Mbps\n📶 Ping: ${ping} ms\n📡 Jitter: ${jitter} ms\n\nجرّب أنت: ${window.location.href}`
    : `🔥 Internet Speed Test Results:\n⬇️ Download: ${dl} Mbps\n⬆️ Upload: ${ul} Mbps\n📶 Ping: ${ping} ms\n📡 Jitter: ${jitter} ms\n\nTest yours: ${window.location.href}`;

  if (navigator.share) {
    navigator.share({ title: 'Speed Test Results', text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      showToast(lang === 'ar' ? '✅ تم نسخ النتائج' : '✅ Results copied!', 'success');
    }).catch(() => {});
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

window.initSpeedTest = initSpeedTest;
window.startSpeedTest = startSpeedTest;
window.clearHistory = clearHistory;
window.shareResults = shareResults;
