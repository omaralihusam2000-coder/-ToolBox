/**
 * PPTX to PDF Tool
 * Uses: pptxgenjs (reading via zip), html2pdf
 */

const PPTX_PREVIEW_MAX_SLIDES = 20;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function initPptxToPdf() {
  initToolPage('pptx-to-pdf');
  let pptxFile = null;

  initDragDrop('upload-area', 'file-input', (files) => {
    const pptx = files.find(f => f.name.match(/\.(pptx|ppt)$/i));
    if (!pptx) { showToast(currentLang === 'ar' ? 'اختر ملف PowerPoint' : 'Select a PowerPoint file', 'error'); return; }
    pptxFile = pptx;
    showPptxFileInfo(pptx);
  });

  document.getElementById('convert-btn').onclick = async () => {
    if (!pptxFile) { showToast(currentLang === 'ar' ? 'اختر ملف PPTX أولاً' : 'Select a PPTX file first', 'error'); return; }
    const btn = document.getElementById('convert-btn');
    if (btn) btn.disabled = true;
    const progressWrap = document.getElementById('pptx-progress-wrap');
    if (progressWrap) progressWrap.style.display = 'block';
    try {
      await convertPptxToPdf(pptxFile);
    } finally {
      if (btn) btn.disabled = false;
      if (progressWrap) progressWrap.style.display = 'none';
    }
  };
}

function showPptxFileInfo(file) {
  const area = document.getElementById('upload-area');
  if (!area) return;
  area.innerHTML = `
    <span class="upload-icon">✅</span>
    <div class="upload-title">${escapeHtml(file.name)}</div>
    <div class="upload-desc">${formatFileSize(file.size)}</div>
    <button class="btn-outline" onclick="location.reload()" style="margin-top:12px">
      ${window.currentLang === 'ar' ? 'تغيير الملف' : 'Change File'}
    </button>
  `;
  const btn = document.getElementById('convert-btn');
  if (btn) btn.disabled = false;
  showPptxPreview(file);
}

async function showPptxPreview(file) {
  const decodeEntities = (() => {
    const el = document.createElement('textarea');
    return (text) => { el.innerHTML = text; return el.value; };
  })();
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const slideFiles = Object.keys(zip.files)
      .filter(name => name.match(/ppt\/slides\/slide\d+\.xml$/))
      .sort((a, b) => parseInt(a.match(/slide(\d+)/)[1]) - parseInt(b.match(/slide(\d+)/)[1]));

    const previewSection = document.getElementById('slides-preview-section');
    const grid = document.getElementById('slides-preview-grid');
    if (!grid || !previewSection || slideFiles.length === 0) return;

    previewSection.style.display = 'block';
    grid.innerHTML = '';
    const lang = window.currentLang || 'ar';

    for (let i = 0; i < Math.min(slideFiles.length, PPTX_PREVIEW_MAX_SLIDES); i++) {
      const xmlContent = await zip.files[slideFiles[i]].async('text');
      const texts = [...xmlContent.matchAll(/<a:t>(.*?)<\/a:t>/gs)]
        .map(m => decodeEntities(m[1]))
        .filter(t => t.trim());
      const title = texts[0] || (lang === 'ar' ? `شريحة ${i + 1}` : `Slide ${i + 1}`);
      const card = document.createElement('div');
      card.style.cssText = 'background:var(--bg-primary);border:1px solid var(--border-color);border-radius:6px;padding:8px;font-size:0.7rem;text-align:center;overflow:hidden;cursor:default';
      card.innerHTML = `
        <div style="background:var(--bg-secondary);border-radius:4px;padding:6px;min-height:50px;display:flex;align-items:center;justify-content:center;margin-bottom:6px;overflow:hidden">
          <span style="font-size:0.65rem;color:var(--text-secondary);word-break:break-word;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${escapeHtml(title.slice(0, 60))}</span>
        </div>
        <span style="color:var(--text-muted)">${lang === 'ar' ? `شريحة ${i + 1}` : `Slide ${i + 1}`}</span>
      `;
      grid.appendChild(card);
    }

    if (slideFiles.length > PPTX_PREVIEW_MAX_SLIDES) {
      const more = document.createElement('div');
      more.style.cssText = 'text-align:center;font-size:0.75rem;color:var(--text-muted);padding:8px;grid-column:1/-1';
      more.textContent = lang === 'ar' ? `+ ${slideFiles.length - PPTX_PREVIEW_MAX_SLIDES} شريحة أخرى` : `+ ${slideFiles.length - PPTX_PREVIEW_MAX_SLIDES} more slides`;
      grid.appendChild(more);
    }
  } catch (e) {
    console.warn('Preview failed:', e);
  }
}

async function convertPptxToPdf(file) {
  showLoading(currentLang === 'ar' ? 'جاري معالجة الملف...' : 'Processing file...');
  let container = null;
  try {
    // Read quality setting
    const qualityEl = document.querySelector('input[name="pptx-quality"]:checked');
    const qualityVal = qualityEl ? qualityEl.value : 'high';
    const imgQuality = qualityVal === 'high' ? 0.95 : qualityVal === 'medium' ? 0.75 : 0.5;
    const canvasScale = qualityVal === 'high' ? 1.5 : qualityVal === 'medium' ? 1.2 : 1.0;

    // Use JSZip to read pptx (which is a zip file)
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Extract slide XML files
    const slideFiles = Object.keys(zip.files).filter(name => name.match(/ppt\/slides\/slide\d+\.xml$/));

    if (!slideFiles.length) {
      hideLoading();
      showToast(
        currentLang === 'ar'
          ? 'لم يتم العثور على شرائح في الملف'
          : 'No slides found in this file',
        'error'
      );
      return;
    }

    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)[1]);
      const numB = parseInt(b.match(/slide(\d+)/)[1]);
      return numA - numB;
    });

    hideLoading();

    let slidesHtml = '';
    for (let i = 0; i < slideFiles.length; i++) {
      // Update progress bar
      const pct = Math.round(((i + 1) / slideFiles.length) * 100);
      const bar = document.getElementById('pptx-progress-bar');
      const pctEl = document.getElementById('pptx-progress-pct');
      const labelEl = document.getElementById('pptx-progress-label');
      if (bar) bar.style.width = pct + '%';
      if (pctEl) pctEl.textContent = pct + '%';
      if (labelEl) labelEl.textContent = (window.currentLang === 'ar')
        ? `معالجة شريحة ${i + 1} من ${slideFiles.length}...`
        : `Processing slide ${i + 1} of ${slideFiles.length}...`;

      const xmlContent = await zip.files[slideFiles[i]].async('text');
      const slideHtml = pptxSlideToHtml(xmlContent, i + 1);
      slidesHtml += slideHtml;
    }

    const fullHtml = `<!DOCTYPE html>
<html dir="auto">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, 'Noto Sans Arabic', sans-serif; background: white; }
  .slide {
    width: 960px;
    height: 540px;
    position: relative;
    background: white;
    border: 1px solid #eee;
    overflow: hidden;
    page-break-after: always;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .slide-number {
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-size: 10px;
    color: #999;
  }
  .slide-title {
    font-size: 28px;
    font-weight: bold;
    color: #1a1a1a;
    margin-bottom: 20px;
    line-height: 1.3;
  }
  .slide-content {
    font-size: 16px;
    color: #333;
    line-height: 1.7;
  }
</style>
</head>
<body>
${slidesHtml}
</body>
</html>`;

    container = document.createElement('div');
    container.innerHTML = fullHtml;
    document.body.appendChild(container);
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '960px';

    const opt = {
      margin: 0,
      filename: file.name.replace(/\.(pptx|ppt)$/i, '.pdf'),
      image: { type: 'jpeg', quality: imgQuality },
      html2canvas: { scale: canvasScale, useCORS: true, width: 960, height: 540 },
      jsPDF: { unit: 'px', format: [960, 540], orientation: 'landscape' }
    };

    await html2pdf().set(opt).from(container).save();

    showToast(currentLang === 'ar' ? `✅ تم تحويل ${slideFiles.length} شرائح` : `✅ Converted ${slideFiles.length} slides`, 'success');
    document.getElementById('result-section').style.display = 'block';
    document.getElementById('result-info').textContent = currentLang === 'ar'
      ? `تم تحويل ${slideFiles.length} شرائح بنجاح`
      : `Successfully converted ${slideFiles.length} slides`;

    // Show stats
    const statsEl = document.getElementById('pptx-result-stats');
    if (statsEl) {
      const textContent = slidesHtml.replace(/<[^>]*>/g, ' ');
      const totalWords = textContent.split(/\s+/).filter(w => w.length > 0).length;
      document.getElementById('pptx-stat-slides').textContent = slideFiles.length;
      document.getElementById('pptx-stat-text').textContent = totalWords.toLocaleString();
      statsEl.style.display = 'block';
    }

  } catch (err) {
    hideLoading();
    showToast(currentLang === 'ar' ? 'خطأ في التحويل: ' + err.message : 'Conversion error: ' + err.message, 'error');
    console.error(err);
  } finally {
    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

function pptxSlideToHtml(xmlContent, slideNum) {
  // Extract all text nodes from the XML, decode HTML entities.
  // Use DOMParser for safe entity decoding, avoiding double-escaping issues.
  const decodeEntities = (function() {
    const el = document.createElement('textarea');
    return function(text) {
      el.innerHTML = text;
      return el.value;
    };
  })();

  const texts = [...xmlContent.matchAll(/<a:t>(.*?)<\/a:t>/gs)]
    .map(m => decodeEntities(m[1]))
    .filter(t => t.trim());

  if (texts.length === 0) {
    return `<div class="slide">
      <div class="slide-title" style="color:#999">${currentLang === 'ar' ? 'شريحة' : 'Slide'} ${slideNum}</div>
      <div class="slide-number">${slideNum}</div>
    </div>`;
  }

  const safeTitle = escapeHtml(texts[0] || `Slide ${slideNum}`);
  const safeContent = texts.slice(1).map(t => escapeHtml(t)).join('<br>');

  return `<div class="slide">
    <div class="slide-title">${safeTitle}</div>
    ${safeContent ? `<div class="slide-content">${safeContent}</div>` : ''}
    <div class="slide-number">${slideNum}</div>
  </div>`;
}

window.initPptxToPdf = initPptxToPdf;
