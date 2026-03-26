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

async function convertPdfToWord(file) {
  showLoading(currentLang === 'ar' ? 'جاري تحويل PDF...' : 'Converting PDF...');
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF with pdf.js
    const pdfjsLib = window.pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    const pageTexts = [];

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      // Group text items by their Y position to reconstruct lines
      const lines = [];
      let currentLine = '';
      let lastY = null;

      for (const item of content.items) {
        const y = Math.round(item.transform[5]); // Y coordinate
        if (lastY !== null && Math.abs(y - lastY) > 5) {
          // New line
          if (currentLine.trim()) lines.push(currentLine.trim());
          currentLine = item.str;
        } else {
          currentLine += (currentLine && item.str ? ' ' : '') + item.str;
        }
        lastY = y;
      }
      if (currentLine.trim()) lines.push(currentLine.trim());

      pageTexts.push(lines.join('\n'));
    }

    const fullText = pageTexts.join('\n\n--- ' + (currentLang === 'ar' ? 'صفحة' : 'Page') + ' ---\n\n');

    // Create a proper .docx if the docx library is loaded
    if (window.docx && window.docx.Document) {
      await createDocxFromText(fullText, file.name);
    } else {
      // Fallback: create a well-encoded HTML file that Word can open
      const htmlContent = `<!DOCTYPE html>
<html dir="auto">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>${file.name}</title>
<style>
  body {
    font-family: 'Arial', 'Tahoma', 'Noto Sans Arabic', sans-serif;
    max-width: 800px;
    margin: 40px auto;
    line-height: 2;
    direction: auto;
    font-size: 14pt;
    color: #222;
  }
  p { margin-bottom: 12px; }
  .page-break { page-break-after: always; border-top: 1px solid #ccc; margin: 24px 0; padding-top: 12px; color: #999; font-size: 10pt; }
</style>
</head>
<body>
${pageTexts.map((text, i) =>
  text.split('\n').map(line => `<p>${line}</p>`).join('\n') +
  (i < pageTexts.length - 1 ? `\n<div class="page-break">${currentLang === 'ar' ? 'صفحة' : 'Page'} ${i + 1}</div>` : '')
).join('\n')}
</body>
</html>`;
      const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=UTF-8' });
      downloadBlob(blob, file.name.replace('.pdf', '.doc'));
    }

    hideLoading();
    showToast(currentLang === 'ar' ? '✅ تم التحويل بنجاح!' : '✅ Conversion successful!', 'success');
    document.getElementById('result-section').style.display = 'block';
    document.getElementById('result-info').textContent = currentLang === 'ar'
      ? `تم استخراج نص من ${totalPages} صفحة`
      : `Extracted text from ${totalPages} pages`;

  } catch (err) {
    hideLoading();
    showToast(currentLang === 'ar' ? 'خطأ في تحويل الملف: ' + err.message : 'Error: ' + err.message, 'error');
  }
}

async function createDocxFromText(text, originalName) {
  const { Document, Packer, Paragraph, TextRun } = window.docx;

  const lines = text.split('\n');
  const children = [];

  for (const line of lines) {
    const trimmed = line.trim();
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

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: children
    }]
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, originalName.replace('.pdf', '.docx'));
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
