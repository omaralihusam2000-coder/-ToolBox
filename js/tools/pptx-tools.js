/**
 * PPTX to PDF Tool
 * Uses: pptxgenjs (reading via zip), html2pdf
 */

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
    try {
      await convertPptxToPdf(pptxFile);
    } finally {
      if (btn) btn.disabled = false;
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
}

async function convertPptxToPdf(file) {
  showLoading(currentLang === 'ar' ? 'جاري معالجة الملف...' : 'Processing file...');
  let container = null;
  try {
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

    let slidesHtml = '';
    for (let i = 0; i < slideFiles.length; i++) {
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
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 1.5, useCORS: true, width: 960, height: 540 },
      jsPDF: { unit: 'px', format: [960, 540], orientation: 'landscape' }
    };

    await html2pdf().set(opt).from(container).save();

    hideLoading();
    showToast(currentLang === 'ar' ? `✅ تم تحويل ${slideFiles.length} شرائح` : `✅ Converted ${slideFiles.length} slides`, 'success');
    document.getElementById('result-section').style.display = 'block';
    document.getElementById('result-info').textContent = currentLang === 'ar'
      ? `تم تحويل ${slideFiles.length} شرائح بنجاح`
      : `Successfully converted ${slideFiles.length} slides`;

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
