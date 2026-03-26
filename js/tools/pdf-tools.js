/**
 * PDF Tools - pdf-to-word, word-to-pdf, pdf-merger, pdf-splitter
 * Uses: pdf-lib, pdf.js, mammoth.js, html2pdf.js
 */

// Module-level variable so renderMergeFileList can access it
let pdfFiles = [];

// ===== PDF TO WORD =====
async function initPdfToWord() {
  initToolPage('pdf-to-word');
  let pdfFile = null;

  initDragDrop('upload-area', 'file-input', (files) => {
    const pdf = files.find(f => f.name.toLowerCase().endsWith('.pdf'));
    if (!pdf) { showToast(currentLang === 'ar' ? 'الرجاء اختيار ملف PDF' : 'Please select a PDF file', 'error'); return; }
    pdfFile = pdf;
    showFileInfo(pdf);
  });

  document.getElementById('convert-btn').onclick = async () => {
    if (!pdfFile) { showToast(currentLang === 'ar' ? 'اختر ملف PDF أولاً' : 'Select a PDF file first', 'error'); return; }
    await convertPdfToWord(pdfFile);
  };
}

function showFileInfo(file) {
  const area = document.getElementById('upload-area');
  area.innerHTML = `
    <span class="upload-icon">✅</span>
    <div class="upload-title">${file.name}</div>
    <div class="upload-desc">${formatFileSize(file.size)}</div>
    <button class="btn-outline" onclick="location.reload()" style="margin-top:12px">${window.currentLang === 'ar' ? 'تغيير الملف' : 'Change File'}</button>
  `;
  document.getElementById('convert-btn').disabled = false;
}

// Extract text content from a pdf.js TextContent object, grouping by Y position
function extractPageText(content) {
  // pdf.js transform: [scaleX, skewX, skewY, scaleY, translateX, translateY]
  const LINE_Y_THRESHOLD = 5;
  const lines = [];
  let currentLine = '';
  let lastY = null;

  for (const item of content.items) {
    if (!item.str) continue;
    const y = Math.round(item.transform[5]);
    if (lastY !== null && Math.abs(y - lastY) > LINE_Y_THRESHOLD) {
      if (currentLine.trim()) lines.push(currentLine.trim());
      currentLine = item.str;
    } else {
      currentLine += (currentLine && item.str ? ' ' : '') + item.str;
    }
    lastY = y;
  }
  if (currentLine.trim()) lines.push(currentLine.trim());

  return lines.join('\n');
}

// Render a pdf.js page to a PNG image, returns { dataUrl, width, height }
async function renderPageAsImage(page) {
  const scale = 1.5;
  const viewport = page.getViewport({ scale: scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');

  await page.render({ canvasContext: ctx, viewport: viewport }).promise;

  const result = {
    dataUrl: canvas.toDataURL('image/png'),
    width: viewport.width,
    height: viewport.height
  };

  // Free canvas memory
  canvas.width = 0;
  canvas.height = 0;

  return result;
}

// Escape special characters for safe HTML embedding
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function convertPdfToWord(file) {
  showLoading(currentLang === 'ar' ? 'جاري تحويل PDF...' : 'Converting PDF...');
  try {
    const arrayBuffer = await file.arrayBuffer();

    const pdfjsLib = window.pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const totalPages = pdf.numPages;
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      showLoading(currentLang === 'ar'
        ? 'جاري معالجة الصفحة ' + i + ' من ' + totalPages + '...'
        : 'Processing page ' + i + ' of ' + totalPages + '...');

      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = extractPageText(content);

      const pageData = { pageNum: i, text: text, image: null };

      // If no text extracted, render the page as an image
      if (!text.trim()) {
        try {
          pageData.image = await renderPageAsImage(page);
        } catch (imgErr) {
          console.warn('Failed to render page ' + i + ' as image:', imgErr);
        }
      }

      pages.push(pageData);
    }

    const pagesWithText = pages.filter(function(p) { return p.text.trim(); }).length;
    const pagesWithImages = pages.filter(function(p) { return p.image; }).length;

    // Generate the Word document
    try {
      if (window.docx && window.docx.Document && window.docx.Packer) {
        await createDocxFromPages(pages, file.name);
      } else {
        createHtmlDocFromPages(pages, file.name);
      }
    } catch (docxErr) {
      console.warn('DOCX creation failed, using HTML fallback:', docxErr);
      createHtmlDocFromPages(pages, file.name);
    }

    hideLoading();
    showToast(currentLang === 'ar' ? '✅ تم التحويل بنجاح!' : '✅ Conversion successful!', 'success');
    document.getElementById('result-section').style.display = 'block';

    let info;
    if (pagesWithText === totalPages) {
      info = currentLang === 'ar'
        ? 'تم استخراج النص من ' + totalPages + ' صفحة'
        : 'Extracted text from ' + totalPages + ' pages';
    } else if (pagesWithText > 0) {
      info = currentLang === 'ar'
        ? 'تم استخراج النص من ' + pagesWithText + ' صفحة، و ' + pagesWithImages + ' صفحة كصور'
        : 'Extracted text from ' + pagesWithText + ' pages, ' + pagesWithImages + ' pages as images';
    } else {
      info = currentLang === 'ar'
        ? 'تم تحويل ' + totalPages + ' صفحة كصور (الملف لا يحتوي نصوص قابلة للاستخراج)'
        : 'Converted ' + totalPages + ' pages as images (no extractable text found)';
    }
    document.getElementById('result-info').textContent = info;

  } catch (err) {
    hideLoading();
    showToast(currentLang === 'ar' ? 'خطأ في تحويل الملف: ' + err.message : 'Error: ' + err.message, 'error');
  }
}

async function createDocxFromPages(pages, originalName) {
  const { Document, Packer, Paragraph, TextRun, ImageRun } = window.docx;

  const sections = [];

  for (let p = 0; p < pages.length; p++) {
    const page = pages[p];
    const children = [];

    if (page.text.trim()) {
      // Text-based page: create paragraphs from extracted lines
      const lines = page.text.split('\n');
      for (let li = 0; li < lines.length; li++) {
        const trimmed = lines[li].trim();
        if (!trimmed) {
          children.push(new Paragraph({ spacing: { after: 100 } }));
          continue;
        }
        children.push(new Paragraph({
          children: [new TextRun({
            text: trimmed,
            size: 24,
            font: 'Arial'
          })],
          spacing: { after: 200, line: 360 },
          bidirectional: true
        }));
      }
    } else if (page.image && ImageRun) {
      // Image-based page: embed the rendered page image
      try {
        const base64 = page.image.dataUrl.split(',')[1];
        const raw = atob(base64);
        const imageBytes = new Uint8Array(raw.length);
        for (let bi = 0; bi < raw.length; bi++) {
          imageBytes[bi] = raw.charCodeAt(bi);
        }

        // Scale image to fit Word page content area (~550px wide)
        const maxWidth = 550;
        const imgScale = Math.min(1, maxWidth / (page.image.width || 550));
        const imgWidth = Math.round((page.image.width || 550) * imgScale);
        const imgHeight = Math.round((page.image.height || 750) * imgScale);

        children.push(new Paragraph({
          children: [new ImageRun({
            data: imageBytes,
            transformation: { width: imgWidth, height: imgHeight }
          })]
        }));
      } catch (imgErr) {
        // If image embedding fails, add a placeholder message
        children.push(new Paragraph({
          children: [new TextRun({
            text: currentLang === 'ar'
              ? '[صفحة ' + page.pageNum + ' - لا يمكن استخراج المحتوى]'
              : '[Page ' + page.pageNum + ' - Content could not be extracted]',
            italics: true,
            color: '999999',
            size: 20
          })]
        }));
      }
    } else {
      // No text and no image available
      children.push(new Paragraph({
        children: [new TextRun({
          text: currentLang === 'ar'
            ? '[صفحة ' + page.pageNum + ' - فارغة]'
            : '[Page ' + page.pageNum + ' - Empty]',
          italics: true,
          color: '999999',
          size: 20
        })]
      }));
    }

    sections.push({
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: children
    });
  }

  const doc = new Document({ sections: sections });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, originalName.replace(/\.pdf$/i, '.docx'));
}

function createHtmlDocFromPages(pages, originalName) {
  let htmlContent = '<!DOCTYPE html>\n<html dir="auto">\n<head>\n'
    + '<meta charset="UTF-8">\n'
    + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n'
    + '<title>' + escapeHtml(originalName) + '</title>\n'
    + '<style>\n'
    + '  body { font-family: Arial, Tahoma, sans-serif; max-width: 800px; margin: 40px auto; line-height: 2; direction: auto; font-size: 14pt; color: #222; padding: 20px; }\n'
    + '  p { margin-bottom: 12px; }\n'
    + '  .page-section { margin-bottom: 40px; }\n'
    + '  .page-header { font-size: 10pt; color: #999; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 16px; }\n'
    + '  .page-image { max-width: 100%; height: auto; border: 1px solid #eee; }\n'
    + '  .empty-note { color: #999; font-style: italic; }\n'
    + '</style>\n'
    + '</head>\n<body>\n';

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const pageLabel = (currentLang === 'ar' ? 'صفحة' : 'Page') + ' ' + page.pageNum;
    htmlContent += '<div class="page-section">\n';
    htmlContent += '<div class="page-header">' + pageLabel + '</div>\n';

    if (page.text.trim()) {
      const textLines = page.text.split('\n');
      for (let j = 0; j < textLines.length; j++) {
        htmlContent += '<p>' + escapeHtml(textLines[j]) + '</p>\n';
      }
    } else if (page.image) {
      htmlContent += '<img class="page-image" src="' + page.image.dataUrl + '" alt="' + pageLabel + '">\n';
    } else {
      const emptyMsg = currentLang === 'ar'
        ? '[صفحة ' + page.pageNum + ' - فارغة]'
        : '[Page ' + page.pageNum + ' - Empty]';
      htmlContent += '<p class="empty-note">' + escapeHtml(emptyMsg) + '</p>\n';
    }

    htmlContent += '</div>\n';
  }

  htmlContent += '</body>\n</html>';

  const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=UTF-8' });
  downloadBlob(blob, originalName.replace(/\.pdf$/i, '.doc'));
}

// ===== WORD TO PDF =====
async function initWordToPdf() {
  initToolPage('word-to-pdf');
  let wordFile = null;

  initDragDrop('upload-area', 'file-input', (files) => {
    const word = files.find(f => f.name.match(/\.(docx|doc)$/i));
    if (!word) { showToast(currentLang === 'ar' ? 'اختر ملف Word (docx)' : 'Select a Word file (docx)', 'error'); return; }
    wordFile = word;
    showFileInfo(word);
  });

  document.getElementById('convert-btn').onclick = async () => {
    if (!wordFile) { showToast(currentLang === 'ar' ? 'اختر ملف Word أولاً' : 'Select a Word file first', 'error'); return; }
    await convertWordToPdf(wordFile);
  };
}

async function convertWordToPdf(file) {
  showLoading(currentLang === 'ar' ? 'جاري تحويل Word إلى PDF...' : 'Converting Word to PDF...');
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Use mammoth to convert docx to HTML
    const result = await mammoth.convertToHtml({ arrayBuffer });

    // Wrap content in a styled div; inline all CSS so it survives html2pdf's
    // internal element creation and html2canvas rendering.
    const styledHtml = `<div style="font-family:Arial,'Noto Sans Arabic',sans-serif;line-height:1.8;font-size:12pt;color:#1a1a1a;direction:rtl;">
<style>h1,h2,h3,h4{color:#1a1a1a}p{margin-bottom:10px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px}img{max-width:100%}</style>
${result.value}
</div>`;

    const opt = {
      margin: 15,
      filename: file.name.replace(/\.(docx|doc)$/i, '.pdf'),
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Pass the HTML string directly so html2pdf creates and sizes its own
    // temporary element correctly — avoids the blank-page bug caused by
    // appending a 0-width off-screen div.
    await html2pdf().set(opt).from(styledHtml, 'string').save();

    hideLoading();
    showToast(currentLang === 'ar' ? '✅ تم التحويل بنجاح!' : '✅ Conversion successful!', 'success');
    document.getElementById('result-section').style.display = 'block';

  } catch (err) {
    hideLoading();
    showToast(currentLang === 'ar' ? 'خطأ: ' + err.message : 'Error: ' + err.message, 'error');
  }
}

// ===== PDF MERGER =====
async function initPdfMerger() {
  initToolPage('pdf-merger');
  pdfFiles = []; // reset module-level array

  initDragDrop('upload-area', 'file-input', (files) => {
    const pdfs = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    pdfFiles = [...pdfFiles, ...pdfs];
    renderMergeFileList();
  });

  document.getElementById('file-input').multiple = true;

  document.getElementById('merge-btn').onclick = async () => {
    if (pdfFiles.length < 2) {
      showToast(currentLang === 'ar' ? 'اختر ملفين PDF على الأقل' : 'Select at least 2 PDF files', 'error');
      return;
    }
    await mergePdfs(pdfFiles);
  };
}

function renderMergeFileList() {
  const list = document.getElementById('file-list');
  if (!list) return;

  if (window.pdfFiles) pdfFiles = window.pdfFiles;

  list.innerHTML = pdfFiles.map((f, i) => `
    <div class="file-item">
      <span class="file-icon">📄</span>
      <span class="file-name">${f.name}</span>
      <span class="file-size">${formatFileSize(f.size)}</span>
      <button class="file-remove" onclick="removeMergeFile(${i})">✕</button>
    </div>
  `).join('');

  const btn = document.getElementById('merge-btn');
  if (btn) btn.disabled = pdfFiles.length < 2;
}

window.removeMergeFile = function(idx) {
  pdfFiles.splice(idx, 1);
  renderMergeFileList();
};

async function mergePdfs(files) {
  showLoading(currentLang === 'ar' ? 'جاري دمج الملفات...' : 'Merging PDFs...');
  try {
    const { PDFDocument } = PDFLib;
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(page => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    downloadBlob(blob, 'merged.pdf');

    hideLoading();
    const totalPages = (await PDFLib.PDFDocument.load(pdfBytes)).getPageCount();
    showToast(currentLang === 'ar' ? `✅ تم الدمج! ${totalPages} صفحة` : `✅ Merged! ${totalPages} pages`, 'success');
    document.getElementById('result-section').style.display = 'block';
    document.getElementById('result-info').textContent = currentLang === 'ar'
      ? `تم دمج ${files.length} ملفات في ملف واحد`
      : `Merged ${files.length} files into one`;

  } catch (err) {
    hideLoading();
    showToast(currentLang === 'ar' ? 'خطأ في الدمج: ' + err.message : 'Merge error: ' + err.message, 'error');
  }
}

// ===== PDF SPLITTER =====
async function initPdfSplitter() {
  initToolPage('pdf-splitter');
  let pdfFile = null;
  let totalPages = 0;

  initDragDrop('upload-area', 'file-input', async (files) => {
    const pdf = files.find(f => f.name.toLowerCase().endsWith('.pdf'));
    if (!pdf) { showToast(currentLang === 'ar' ? 'اختر ملف PDF' : 'Select a PDF file', 'error'); return; }
    pdfFile = pdf;

    // Get page count
    try {
      const bytes = await pdf.arrayBuffer();
      const doc = await PDFLib.PDFDocument.load(bytes);
      totalPages = doc.getPageCount();
      showFileInfo(pdf);
      document.getElementById('page-info').textContent = currentLang === 'ar'
        ? `عدد الصفحات: ${totalPages}`
        : `Total pages: ${totalPages}`;
      document.getElementById('split-options').style.display = 'block';
      document.getElementById('split-btn').disabled = false;
    } catch (e) {
      showToast(currentLang === 'ar' ? 'خطأ في قراءة الملف' : 'Error reading file', 'error');
    }
  });

  document.getElementById('split-btn').onclick = async () => {
    if (!pdfFile) return;
    const mode = document.querySelector('input[name="split-mode"]:checked').value;
    await splitPdf(pdfFile, mode, totalPages);
  };
}

async function splitPdf(file, mode, totalPages) {
  showLoading(currentLang === 'ar' ? 'جاري تقسيم PDF...' : 'Splitting PDF...');
  try {
    const { PDFDocument } = PDFLib;
    const bytes = await file.arrayBuffer();
    const srcPdf = await PDFDocument.load(bytes);

    if (mode === 'all') {
      // Split each page into separate file
      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(srcPdf, [i]);
        newPdf.addPage(page);
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        downloadBlob(blob, `page-${i + 1}.pdf`);
        await new Promise(r => setTimeout(r, 100)); // Small delay between downloads
      }
      showToast(currentLang === 'ar' ? `✅ تم تقسيم ${totalPages} صفحة` : `✅ Split into ${totalPages} pages`, 'success');
    } else {
      // Custom range
      const rangeInput = document.getElementById('page-range').value;
      const pages = parsePageRange(rangeInput, totalPages);
      if (!pages.length) { showToast(currentLang === 'ar' ? 'نطاق صفحات غير صحيح' : 'Invalid page range', 'error'); hideLoading(); return; }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(srcPdf, pages.map(p => p - 1));
      copiedPages.forEach(page => newPdf.addPage(page));
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `split-pages.pdf`);
      showToast(currentLang === 'ar' ? `✅ تم استخراج ${pages.length} صفحة` : `✅ Extracted ${pages.length} pages`, 'success');
    }

    hideLoading();
    document.getElementById('result-section').style.display = 'block';

  } catch (err) {
    hideLoading();
    showToast(currentLang === 'ar' ? 'خطأ: ' + err.message : 'Error: ' + err.message, 'error');
  }
}

function parsePageRange(str, max) {
  const pages = [];
  const parts = str.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(max, end); i++) {
          if (!pages.includes(i)) pages.push(i);
        }
      }
    } else {
      const n = parseInt(trimmed);
      if (!isNaN(n) && n >= 1 && n <= max && !pages.includes(n)) pages.push(n);
    }
  }
  return pages.sort((a, b) => a - b);
}

// Expose functions
window.initPdfToWord = initPdfToWord;
window.initWordToPdf = initWordToPdf;
window.initPdfMerger = initPdfMerger;
window.initPdfSplitter = initPdfSplitter;
