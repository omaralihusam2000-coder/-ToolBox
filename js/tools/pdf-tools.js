/**
 * PDF Tools - pdf-to-word, word-to-pdf, pdf-merger, pdf-splitter
 * Uses: pdf-lib, pdf.js, mammoth.js, html2pdf.js
 */
/* global currentLang, showToast, showLoading, hideLoading, initToolPage,
          initDragDrop, formatFileSize, downloadBlob, PDFLib, mammoth, html2pdf */

// ============================================================
// MODULE STATE
// ============================================================

// Scoped to merger tool only – never leak to other tools
let _mergerFiles = [];

// ============================================================
// SHARED HELPERS
// ============================================================

/** Show selected-file info inside the upload area */
function showFileInfo(file) {
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

/** Escape characters that are unsafe inside HTML text nodes */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Format bytes to human-readable size – re-exported for convenience */
function _fmtSize(bytes) {
  return typeof formatFileSize === 'function' ? formatFileSize(bytes) : bytes + ' B';
}

// ============================================================
// PDF.JS HELPERS
// ============================================================

/**
 * Extract text lines from a pdf.js TextContent object.
 * Groups items by Y-coordinate and respects hasEOL flags.
 */
function extractPageText(content) {
  const LINE_Y_THRESHOLD = 6; // points – larger gap = new line
  const lines = [];
  let currentLine = '';
  let lastY = null;

  for (const item of content.items) {
    // Skip empty strings and marker items (no str property)
    if (!item.str) continue;

    const y = Math.round(item.transform[5]);
    const isNewLine = lastY !== null && Math.abs(y - lastY) > LINE_Y_THRESHOLD;

    if (isNewLine) {
      if (currentLine.trim()) lines.push(currentLine.trim());
      currentLine = item.str;
    } else {
      // Add a space only when neither end already has one
      const needsSpace =
        currentLine.length > 0 &&
        !currentLine.endsWith(' ') &&
        item.str.length > 0 &&
        !item.str.startsWith(' ');
      currentLine += (needsSpace ? ' ' : '') + item.str;
    }

    // Explicit end-of-line marker from pdf.js
    if (item.hasEOL) {
      if (currentLine.trim()) lines.push(currentLine.trim());
      currentLine = '';
      lastY = null;
      continue;
    }

    lastY = y;
  }

  if (currentLine.trim()) lines.push(currentLine.trim());
  return lines.join('\n');
}

/**
 * Render a pdf.js page to a PNG data-URL.
 * Returns { dataUrl, width, height } or null on failure.
 */
async function renderPageAsImage(page) {
  try {
    const scale = 1.5;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;

    const result = {
      dataUrl: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height
    };

    // Release canvas memory immediately
    canvas.width = 0;
    canvas.height = 0;

    return result;
  } catch (err) {
    console.warn('renderPageAsImage failed:', err);
    return null;
  }
}

// ============================================================
// PDF → WORD
// ============================================================

async function initPdfToWord() {
  initToolPage('pdf-to-word');
  let pdfFile = null;

  initDragDrop('upload-area', 'file-input', (files) => {
    const pdf = files.find(f => f.name.toLowerCase().endsWith('.pdf'));
    if (!pdf) {
      showToast(currentLang === 'ar' ? 'الرجاء اختيار ملف PDF' : 'Please select a PDF file', 'error');
      return;
    }
    pdfFile = pdf;
    showFileInfo(pdf);
  });

  const convertBtn = document.getElementById('convert-btn');
  if (convertBtn) {
    convertBtn.onclick = async () => {
      if (!pdfFile) {
        showToast(currentLang === 'ar' ? 'اختر ملف PDF أولاً' : 'Select a PDF file first', 'error');
        return;
      }
      // Prevent double-click
      convertBtn.disabled = true;
      try {
        await convertPdfToWord(pdfFile);
      } finally {
        convertBtn.disabled = false;
      }
    };
  }
}

async function convertPdfToWord(file) {
  showLoading(currentLang === 'ar' ? 'جاري تحميل الملف...' : 'Loading file...');
  try {
    // Validate file size (max 50 MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      hideLoading();
      showToast(
        currentLang === 'ar' ? 'حجم الملف كبير جداً (الحد الأقصى 50 MB)' : 'File too large (max 50 MB)',
        'error'
      );
      return;
    }

    const arrayBuffer = await file.arrayBuffer();

    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) throw new Error('pdf.js library not loaded');
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const totalPages = pdf.numPages;
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      showLoading(
        currentLang === 'ar'
          ? `جاري معالجة الصفحة ${i} من ${totalPages}...`
          : `Processing page ${i} of ${totalPages}...`
      );

      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = extractPageText(content);

      const pageData = { pageNum: i, text, image: null };

      // Scanned / image-only page → render as image
      if (!text.trim()) {
        pageData.image = await renderPageAsImage(page);
      }

      pages.push(pageData);
      page.cleanup();
    }

    const pagesWithText   = pages.filter(p => p.text.trim()).length;
    const pagesWithImages = pages.filter(p => p.image).length;

    // Try DOCX first, fall back to HTML-doc
    let usedDocx = false;
    if (window.docx && window.docx.Document && window.docx.Packer) {
      try {
        await createDocxFromPages(pages, file.name);
        usedDocx = true;
      } catch (docxErr) {
        console.warn('DOCX creation failed, falling back to HTML:', docxErr);
      }
    }
    if (!usedDocx) {
      createHtmlDocFromPages(pages, file.name);
    }

    hideLoading();
    showToast(currentLang === 'ar' ? '✅ تم التحويل بنجاح!' : '✅ Conversion successful!', 'success');

    const resultSection = document.getElementById('result-section');
    const resultInfo    = document.getElementById('result-info');
    if (resultSection) resultSection.style.display = 'block';

    if (resultInfo) {
      if (pagesWithText === totalPages) {
        resultInfo.textContent = currentLang === 'ar'
          ? `تم استخراج النص من ${totalPages} صفحة`
          : `Extracted text from ${totalPages} pages`;
      } else if (pagesWithText > 0) {
        resultInfo.textContent = currentLang === 'ar'
          ? `نص: ${pagesWithText} صفحة — صور: ${pagesWithImages} صفحة`
          : `Text: ${pagesWithText} pages — Images: ${pagesWithImages} pages`;
      } else {
        resultInfo.textContent = currentLang === 'ar'
          ? `تم تحويل ${totalPages} صفحة كصور (الملف لا يحتوي نصوصاً قابلة للاستخراج)`
          : `Converted ${totalPages} pages as images (no extractable text found)`;
      }
    }

  } catch (err) {
    hideLoading();
    console.error('convertPdfToWord error:', err);
    showToast(
      currentLang === 'ar' ? 'خطأ في تحويل الملف: ' + err.message : 'Error: ' + err.message,
      'error'
    );
  }
}

async function createDocxFromPages(pages, originalName) {
  const { Document, Packer, Paragraph, TextRun, ImageRun } = window.docx;
  const sections = [];

  for (const page of pages) {
    const children = [];

    if (page.text.trim()) {
      for (const line of page.text.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) {
          children.push(new Paragraph({ spacing: { after: 100 } }));
          continue;
        }
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed, size: 24, font: 'Arial' })],
          spacing: { after: 200, line: 360 },
          bidirectional: true
        }));
      }
    } else if (page.image) {
      try {
        const base64 = page.image.dataUrl.split(',')[1];
        const raw = atob(base64);
        const imageBytes = new Uint8Array(raw.length);
        for (let bi = 0; bi < raw.length; bi++) imageBytes[bi] = raw.charCodeAt(bi);

        const MAX_W = 550;
        const scale  = Math.min(1, MAX_W / (page.image.width  || MAX_W));
        const imgW   = Math.round((page.image.width  || MAX_W) * scale);
        const imgH   = Math.round((page.image.height || 780)   * scale);

        children.push(new Paragraph({
          children: [new ImageRun({ data: imageBytes, transformation: { width: imgW, height: imgH } })]
        }));
      } catch (imgErr) {
        children.push(new Paragraph({
          children: [new TextRun({
            text: currentLang === 'ar'
              ? `[صفحة ${page.pageNum} - تعذّر استخراج المحتوى]`
              : `[Page ${page.pageNum} - Content could not be extracted]`,
            italics: true, color: '999999', size: 20
          })]
        }));
      }
    } else {
      children.push(new Paragraph({
        children: [new TextRun({
          text: currentLang === 'ar' ? `[صفحة ${page.pageNum} - فارغة]` : `[Page ${page.pageNum} - Empty]`,
          italics: true, color: '999999', size: 20
        })]
      }));
    }

    sections.push({
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children
    });
  }

  const doc  = new Document({ sections });
  const blob = await Packer.toBlob(doc);
  if (!blob || blob.size === 0) throw new Error('Empty DOCX blob');
  downloadBlob(blob, originalName.replace(/\.pdf$/i, '.docx'));
}

function createHtmlDocFromPages(pages, originalName) {
  let html =
    '<!DOCTYPE html>\n<html dir="auto">\n<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<title>' + escapeHtml(originalName) + '</title>\n' +
    '<style>\n' +
    '  body{font-family:Arial,Tahoma,sans-serif;max-width:800px;margin:40px auto;' +
    'line-height:2;direction:auto;font-size:14pt;color:#222;padding:20px}\n' +
    '  p{margin-bottom:12px}\n' +
    '  .page-section{margin-bottom:40px;page-break-after:always}\n' +
    '  .page-header{font-size:10pt;color:#999;border-bottom:1px solid #ddd;' +
    'padding-bottom:8px;margin-bottom:16px}\n' +
    '  .page-image{max-width:100%;height:auto;border:1px solid #eee}\n' +
    '  .empty-note{color:#999;font-style:italic}\n' +
    '</style>\n</head>\n<body>\n';

  for (const page of pages) {
    const label = (currentLang === 'ar' ? 'صفحة' : 'Page') + ' ' + page.pageNum;
    html += '<div class="page-section">\n';
    html += '<div class="page-header">' + label + '</div>\n';

    if (page.text.trim()) {
      for (const line of page.text.split('\n')) {
        html += '<p>' + escapeHtml(line) + '</p>\n';
      }
    } else if (page.image) {
      html += '<img class="page-image" src="' + page.image.dataUrl + '" alt="' + label + '">\n';
    } else {
      html += '<p class="empty-note">' +
        escapeHtml(currentLang === 'ar'
          ? `[صفحة ${page.pageNum} - فارغة]`
          : `[Page ${page.pageNum} - Empty]`) +
        '</p>\n';
    }

    html += '</div>\n';
  }

  html += '</body>\n</html>';

  const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=UTF-8' });
  downloadBlob(blob, originalName.replace(/\.pdf$/i, '.doc'));}

// ============================================================
// WORD → PDF
// ============================================================

async function initWordToPdf() {
  initToolPage('word-to-pdf');
  let wordFile = null;

  initDragDrop('upload-area', 'file-input', (files) => {
    const word = files.find(f => f.name.match(/\.(docx|doc)$/i));
    if (!word) {
      showToast(currentLang === 'ar' ? 'اختر ملف Word (.docx)' : 'Select a Word file (.docx)', 'error');
      return;
    }
    wordFile = word;
    showFileInfo(word);
  });

  const convertBtn = document.getElementById('convert-btn');
  if (convertBtn) {
    convertBtn.onclick = async () => {
      if (!wordFile) {
        showToast(currentLang === 'ar' ? 'اختر ملف Word أولاً' : 'Select a Word file first', 'error');
        return;
      }
      convertBtn.disabled = true;
      try {
        await convertWordToPdf(wordFile);
      } finally {
        convertBtn.disabled = false;
      }
    };
  }
}

async function convertWordToPdf(file) {
  showLoading(currentLang === 'ar' ? 'جاري تحويل Word إلى PDF...' : 'Converting Word to PDF...');
  try {
    if (!window.mammoth) throw new Error('mammoth.js not loaded');
    if (!window.html2pdf) throw new Error('html2pdf.js not loaded');

    const arrayBuffer = await file.arrayBuffer();

    // Convert DOCX → HTML via mammoth
    const mmResult = await mammoth.convertToHtml({ arrayBuffer });

    // Warn user about any conversion messages (e.g. unsupported features)
    if (mmResult.messages && mmResult.messages.length) {
      console.info('Mammoth messages:', mmResult.messages);
    }

    // Detect document direction (RTL if Arabic characters present)
    const hasArabic = /[\u0600-\u06FF]/.test(mmResult.value);
    const dir = hasArabic ? 'rtl' : 'ltr';

    const styledHtml =
      `<div style="font-family:Arial,'Noto Sans Arabic',sans-serif;` +
      `line-height:1.8;font-size:12pt;color:#1a1a1a;direction:${dir};` +
      `padding:0;margin:0;">` +
      `<style>` +
      `h1,h2,h3,h4{color:#1a1a1a;margin-bottom:8px}` +
      `p{margin-bottom:10px}` +
      `ul,ol{padding-inline-start:24px;margin-bottom:10px}` +
      `table{border-collapse:collapse;width:100%;margin-bottom:12px}` +
      `td,th{border:1px solid #ddd;padding:8px}` +
      `img{max-width:100%}` +
      `</style>` +
      mmResult.value +
      `</div>`;

    const filename = file.name.replace(/\.(docx|doc)$/i, '.pdf');
    const opt = {
      margin:      15,
      filename:    filename,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Use outputPdf('blob') so we can detect an empty/failed result
    const pdfBlob = await html2pdf().set(opt).from(styledHtml, 'string').outputPdf('blob');

    if (!pdfBlob || pdfBlob.size < 100) {
      throw new Error(currentLang === 'ar' ? 'فشل إنشاء PDF - الملف فارغ' : 'PDF generation failed - empty output');
    }

    downloadBlob(pdfBlob, filename);

    hideLoading();
    showToast(currentLang === 'ar' ? '✅ تم التحويل بنجاح!' : '✅ Conversion successful!', 'success');

    const resultSection = document.getElementById('result-section');
    if (resultSection) resultSection.style.display = 'block';
    const resultInfo = document.getElementById('result-info');
    if (resultInfo) {
      resultInfo.textContent = currentLang === 'ar'
        ? `تم تحويل "${file.name}" إلى PDF`
        : `Converted "${file.name}" to PDF`;
    }

  } catch (err) {
    hideLoading();
    console.error('convertWordToPdf error:', err);
    showToast(
      currentLang === 'ar' ? 'خطأ: ' + err.message : 'Error: ' + err.message,
      'error'
    );
  }
}

// ============================================================
// PDF MERGER
// ============================================================

async function initPdfMerger() {
  initToolPage('pdf-merger');
  _mergerFiles = []; // always reset on init

  initDragDrop('upload-area', 'file-input', (files) => {
    const pdfs = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    if (!pdfs.length) {
      showToast(currentLang === 'ar' ? 'اختر ملفات PDF فقط' : 'Select PDF files only', 'error');
      return;
    }

    // Deduplicate by name+size
    const existing = new Set(_mergerFiles.map(f => f.name + f.size));
    const newPdfs  = pdfs.filter(f => !existing.has(f.name + f.size));

    if (!newPdfs.length) {
      showToast(currentLang === 'ar' ? 'الملفات مضافة بالفعل' : 'Files already added', 'info');
      return;
    }

    _mergerFiles.push(...newPdfs);
    renderMergeFileList();
  });

  const fileInput = document.getElementById('file-input');
  if (fileInput) fileInput.multiple = true;

  const mergeBtn = document.getElementById('merge-btn');
  if (mergeBtn) {
    mergeBtn.onclick = async () => {
      if (_mergerFiles.length < 2) {
        showToast(
          currentLang === 'ar' ? 'اختر ملفين PDF على الأقل' : 'Select at least 2 PDF files',
          'error'
        );
        return;
      }
      mergeBtn.disabled = true;
      try {
        await mergePdfs(_mergerFiles);
      } finally {
        mergeBtn.disabled = false;
      }
    };
  }
}

function renderMergeFileList() {
  const list = document.getElementById('file-list');
  if (!list) return;

  list.innerHTML = _mergerFiles.map((f, i) => `
    <div class="file-item">
      <span class="file-icon">📄</span>
      <span class="file-name" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</span>
      <span class="file-size">${_fmtSize(f.size)}</span>
      <button class="file-remove" onclick="removeMergeFile(${i})" title="Remove">✕</button>
    </div>
  `).join('');

  const mergeBtn = document.getElementById('merge-btn');
  if (mergeBtn) mergeBtn.disabled = _mergerFiles.length < 2;
}

window.removeMergeFile = function(idx) {
  if (idx < 0 || idx >= _mergerFiles.length) return;
  _mergerFiles.splice(idx, 1);
  renderMergeFileList();
};

async function mergePdfs(files) {
  showLoading(currentLang === 'ar' ? 'جاري دمج الملفات...' : 'Merging PDFs...');
  try {
    const { PDFDocument } = PDFLib;
    const mergedPdf = await PDFDocument.create();
    let totalPageCount = 0;

    for (let fi = 0; fi < files.length; fi++) {
      showLoading(
        currentLang === 'ar'
          ? `جاري معالجة الملف ${fi + 1} من ${files.length}...`
          : `Processing file ${fi + 1} of ${files.length}...`
      );
      const bytes = await files[fi].arrayBuffer();
      let srcPdf;
      try {
        srcPdf = await PDFDocument.load(bytes);
      } catch (loadErr) {
        showToast(
          currentLang === 'ar'
            ? `خطأ في الملف "${files[fi].name}": ${loadErr.message}`
            : `Error in file "${files[fi].name}": ${loadErr.message}`,
          'error'
        );
        hideLoading();
        return;
      }
      const pageIndices = srcPdf.getPageIndices();
      const copiedPages = await mergedPdf.copyPages(srcPdf, pageIndices);
      copiedPages.forEach(p => mergedPdf.addPage(p));
      totalPageCount += pageIndices.length;
    }

    const pdfBytes = await mergedPdf.save();
    if (!pdfBytes || pdfBytes.length === 0) throw new Error('Merged PDF is empty');

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    downloadBlob(blob, 'merged.pdf');

    hideLoading();
    showToast(
      currentLang === 'ar'
        ? `✅ تم الدمج! ${totalPageCount} صفحة`
        : `✅ Merged! ${totalPageCount} pages`,
      'success'
    );

    const resultSection = document.getElementById('result-section');
    if (resultSection) resultSection.style.display = 'block';
    const resultInfo = document.getElementById('result-info');
    if (resultInfo) {
      resultInfo.textContent = currentLang === 'ar'
        ? `تم دمج ${files.length} ملفات (${totalPageCount} صفحة) في ملف واحد`
        : `Merged ${files.length} files (${totalPageCount} pages) into one`;
    }

  } catch (err) {
    hideLoading();
    console.error('mergePdfs error:', err);
    showToast(
      currentLang === 'ar' ? 'خطأ في الدمج: ' + err.message : 'Merge error: ' + err.message,
      'error'
    );
  }
}

// ============================================================
// PDF SPLITTER
// ============================================================

async function initPdfSplitter() {
  initToolPage('pdf-splitter');
  let pdfFile   = null;
  let totalPages = 0;

  initDragDrop('upload-area', 'file-input', async (files) => {
    const pdf = files.find(f => f.name.toLowerCase().endsWith('.pdf'));
    if (!pdf) {
      showToast(currentLang === 'ar' ? 'اختر ملف PDF' : 'Select a PDF file', 'error');
      return;
    }

    showLoading(currentLang === 'ar' ? 'جاري قراءة الملف...' : 'Reading file...');
    try {
      const bytes = await pdf.arrayBuffer();
      const doc   = await PDFLib.PDFDocument.load(bytes);
      totalPages  = doc.getPageCount();
      pdfFile     = pdf;

      showFileInfo(pdf);

      const pageInfo = document.getElementById('page-info');
      if (pageInfo) {
        pageInfo.textContent = currentLang === 'ar'
          ? `عدد الصفحات: ${totalPages}`
          : `Total pages: ${totalPages}`;
      }

      const splitOptions = document.getElementById('split-options');
      if (splitOptions) splitOptions.style.display = 'block';

      const splitBtn = document.getElementById('split-btn');
      if (splitBtn) splitBtn.disabled = false;

      hideLoading();
    } catch (e) {
      hideLoading();
      console.error('initPdfSplitter load error:', e);
      showToast(
        currentLang === 'ar' ? 'خطأ في قراءة الملف: ' + e.message : 'Error reading file: ' + e.message,
        'error'
      );
    }
  });

  const splitBtn = document.getElementById('split-btn');
  if (splitBtn) {
    splitBtn.onclick = async () => {
      if (!pdfFile) return;
      const modeEl = document.querySelector('input[name="split-mode"]:checked');
      if (!modeEl) {
        showToast(currentLang === 'ar' ? 'اختر طريقة التقسيم' : 'Select a split mode', 'error');
        return;
      }
      splitBtn.disabled = true;
      try {
        await splitPdf(pdfFile, modeEl.value, totalPages);
      } finally {
        splitBtn.disabled = false;
      }
    };
  }
}

async function splitPdf(file, mode, totalPages) {
  showLoading(currentLang === 'ar' ? 'جاري تقسيم PDF...' : 'Splitting PDF...');
  try {
    const { PDFDocument } = PDFLib;
    const bytes  = await file.arrayBuffer();
    const srcPdf = await PDFDocument.load(bytes);

    if (mode === 'all') {
      // ── Split every page into a separate file ──
      for (let i = 0; i < totalPages; i++) {
        showLoading(
          currentLang === 'ar'
            ? `جاري تصدير الصفحة ${i + 1} من ${totalPages}...`
            : `Exporting page ${i + 1} of ${totalPages}...`
        );
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(srcPdf, [i]);
        newPdf.addPage(page);
        const pdfBytes = await newPdf.save();
        downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `page-${i + 1}.pdf`);
        // Brief pause to let the browser queue the download
        await new Promise(r => setTimeout(r, 120));
      }
      showToast(
        currentLang === 'ar'
          ? `✅ تم تصدير ${totalPages} صفحة`
          : `✅ Exported ${totalPages} pages`,
        'success'
      );

    } else {
      // ── Custom page range ──
      const rangeEl = document.getElementById('page-range');
      const rangeInput = rangeEl ? rangeEl.value.trim() : '';

      if (!rangeInput) {
        hideLoading();
        showToast(
          currentLang === 'ar' ? 'أدخل نطاق الصفحات أولاً' : 'Enter a page range first',
          'error'
        );
        return;
      }

      const pages = parsePageRange(rangeInput, totalPages);

      if (!pages.length) {
        hideLoading();
        showToast(
          currentLang === 'ar'
            ? `نطاق غير صحيح. الصفحات المتاحة: 1 – ${totalPages}`
            : `Invalid range. Available pages: 1 – ${totalPages}`,
          'error'
        );
        return;
      }

      const newPdf      = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(srcPdf, pages.map(p => p - 1));
      copiedPages.forEach(p => newPdf.addPage(p));

      const pdfBytes = await newPdf.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'split-pages.pdf');

      showToast(
        currentLang === 'ar'
          ? `✅ تم استخراج ${pages.length} صفحة`
          : `✅ Extracted ${pages.length} pages`,
        'success'
      );
    }

    hideLoading();
    const resultSection = document.getElementById('result-section');
    if (resultSection) resultSection.style.display = 'block';
    const resultInfo = document.getElementById('result-info');
    if (resultInfo) {
      resultInfo.textContent = currentLang === 'ar'
        ? `اكتملت عملية التقسيم بنجاح`
        : `Split operation completed successfully`;
    }

  } catch (err) {
    hideLoading();
    console.error('splitPdf error:', err);
    showToast(
      currentLang === 'ar' ? 'خطأ في التقسيم: ' + err.message : 'Split error: ' + err.message,
      'error'
    );
  }
}

/**
 * Parse a page-range string like "1-3, 5, 7-9" into a sorted array of page numbers.
 * Numbers outside [1, max] are silently clamped / ignored.
 */
function parsePageRange(str, max) {
  const pages = new Set();

  for (const part of str.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes('-')) {
      const [rawA, rawB] = trimmed.split('-');
      const a = parseInt(rawA, 10);
      const b = parseInt(rawB, 10);
      if (!isNaN(a) && !isNaN(b) && a <= b) {
        for (let i = Math.max(1, a); i <= Math.min(max, b); i++) pages.add(i);
      }
    } else {
      const n = parseInt(trimmed, 10);
      if (!isNaN(n) && n >= 1 && n <= max) pages.add(n);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

// ============================================================
// PUBLIC API
// ============================================================

window.initPdfToWord   = initPdfToWord;
window.initWordToPdf   = initWordToPdf;
window.initPdfMerger   = initPdfMerger;
window.initPdfSplitter = initPdfSplitter;