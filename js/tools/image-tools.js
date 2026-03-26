/**
 * Image Tools: Compressor, Converter, Resizer
 */

// ===== IMAGE COMPRESSOR =====
function initImageCompressor() {
  initToolPage('image-compressor');
  let imageFiles = [];

  initDragDrop('upload-area', 'file-input', (files) => {
    const imgs = files.filter(f => f.type.startsWith('image/'));
    if (!imgs.length) { showToast(currentLang === 'ar' ? 'اختر ملفات صور' : 'Select image files', 'error'); return; }
    imageFiles = [...imageFiles, ...imgs];
    renderImageList(imageFiles, 'file-list');
    document.getElementById('compress-btn').disabled = false;
  });

  document.getElementById('file-input').multiple = true;

  document.getElementById('compress-btn').onclick = async () => {
    if (!imageFiles.length) return;
    const quality = parseFloat(document.getElementById('quality-slider').value) / 100;
    await compressImages(imageFiles, quality);
  };

  // Quality slider live preview
  const slider = document.getElementById('quality-slider');
  if (slider) {
    slider.addEventListener('input', () => {
      document.getElementById('quality-val').textContent = slider.value + '%';
    });
  }
}

function renderImageList(files, listId) {
  const list = document.getElementById(listId);
  if (!list) return;
  list.innerHTML = files.map((f, i) => `
    <div class="file-item">
      <span class="file-icon">🖼️</span>
      <span class="file-name">${f.name}</span>
      <span class="file-size">${formatFileSize(f.size)}</span>
    </div>
  `).join('');
}

async function compressImages(files, quality) {
  showLoading(currentLang === 'ar' ? 'جاري ضغط الصور...' : 'Compressing images...');
  const results = [];

  for (const file of files) {
    try {
      const compressed = await compressSingleImage(file, quality);
      results.push({ original: file, compressed });
    } catch (e) {
      console.error('Compress error:', e);
    }
  }

  hideLoading();

  // Show results
  const resultSection = document.getElementById('result-section');
  const resultList = document.getElementById('result-list');
  if (resultSection) resultSection.style.display = 'block';

  if (resultList) {
    window._compressedBlobs = {};
    window._compressedNames = {};
    results.forEach((r, i) => {
      window._compressedBlobs[i] = r.compressed;
      const ext = r.original.type === 'image/png' ? 'png' : 'jpg';
      window._compressedNames[i] = r.original.name.replace(/\.[^.]+$/, '') + '_compressed.' + ext;
    });

    resultList.innerHTML = results.map((r, i) => {
      const savings = Math.round((1 - r.compressed.size / r.original.size) * 100);
      return `
        <div class="file-item">
          <span class="file-icon">✅</span>
          <span class="file-name">${r.original.name}</span>
          <span class="file-size" style="color:var(--accent-yellow)">${formatFileSize(r.compressed.size)}</span>
          <span class="chip green" style="font-size:0.7rem">${savings > 0 ? '-' + savings + '%' : 'No change'}</span>
          <button class="btn-red" style="padding:4px 12px;font-size:0.75rem" onclick="downloadBlob(window._compressedBlobs[${i}], window._compressedNames[${i}])">⬇</button>
        </div>`;
    }).join('');
  }

  const totalSavings = results.reduce((acc, r) => acc + (r.original.size - r.compressed.size), 0);
  showToast(currentLang === 'ar' ? `✅ تم ضغط ${results.length} صورة، وفّرت ${formatFileSize(totalSavings)}` : `✅ Compressed ${results.length} images, saved ${formatFileSize(totalSavings)}`, 'success');
}

function compressSingleImage(file, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        const isPng = file.type === 'image/png';
        if (!isPng) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const mimeType = isPng ? 'image/png' : 'image/jpeg';
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Compression failed'));
        }, mimeType, isPng ? undefined : quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ===== IMAGE CONVERTER =====
function initImageConverter() {
  initToolPage('image-converter');
  let imageFile = null;

  initDragDrop('upload-area', 'file-input', (files) => {
    const img = files.find(f => f.type.startsWith('image/'));
    if (!img) { showToast(currentLang === 'ar' ? 'اختر ملف صورة' : 'Select an image file', 'error'); return; }
    imageFile = img;
    showConverterPreview(img);
    document.getElementById('convert-btn').disabled = false;
  });

  document.getElementById('convert-btn').onclick = async () => {
    if (!imageFile) return;
    const format = document.getElementById('output-format').value;
    const quality = parseFloat(document.getElementById('quality-slider').value) / 100;
    await convertImage(imageFile, format, quality);
  };
}

function showConverterPreview(file) {
  const preview = document.getElementById('image-preview');
  if (!preview) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:200px;border-radius:8px;border:1px solid var(--border-color)">
    <p style="margin-top:8px;font-size:0.85rem;color:var(--text-muted)">${file.name} — ${formatFileSize(file.size)}</p>`;
    document.getElementById('upload-area').style.display = 'none';
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

async function convertImage(file, format, quality) {
  showLoading(currentLang === 'ar' ? 'جاري التحويل...' : 'Converting...');
  try {
    const result = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (format === 'jpeg' || format === 'jpg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);
          const mimeType = format === 'jpg' ? 'image/jpeg' : (format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/gif');
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Conversion failed'));
          }, mimeType, quality);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const ext = format === 'jpeg' ? 'jpg' : format;
    downloadBlob(result, file.name.replace(/\.[^.]+$/, '') + '.' + ext);
    hideLoading();
    showToast(currentLang === 'ar' ? '✅ تم التحويل!' : '✅ Converted!', 'success');
    document.getElementById('result-section').style.display = 'block';
    document.getElementById('result-info').textContent = currentLang === 'ar'
      ? `الحجم الجديد: ${formatFileSize(result.size)}`
      : `New size: ${formatFileSize(result.size)}`;

  } catch (err) {
    hideLoading();
    showToast(currentLang === 'ar' ? 'خطأ: ' + err.message : 'Error: ' + err.message, 'error');
  }
}

// ===== IMAGE RESIZER =====
function initImageResizer() {
  initToolPage('image-resizer');
  let imageFile = null;
  let originalWidth = 0, originalHeight = 0;

  initDragDrop('upload-area', 'file-input', (files) => {
    const img = files.find(f => f.type.startsWith('image/'));
    if (!img) { showToast(currentLang === 'ar' ? 'اختر ملف صورة' : 'Select an image file', 'error'); return; }
    imageFile = img;

    const reader = new FileReader();
    reader.onload = (e) => {
      const image = new Image();
      image.onload = () => {
        originalWidth = image.width;
        originalHeight = image.height;
        document.getElementById('width-input').value = image.width;
        document.getElementById('height-input').value = image.height;
        document.getElementById('original-size').textContent = `${image.width} × ${image.height}px`;
        document.getElementById('resize-options').style.display = 'block';
        document.getElementById('resize-btn').disabled = false;

        const preview = document.getElementById('image-preview');
        if (preview) {
          preview.innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:180px;border-radius:8px">`;
          preview.style.display = 'block';
          document.getElementById('upload-area').style.display = 'none';
        }
      };
      image.src = e.target.result;
    };
    reader.readAsDataURL(img);
  });

  // Lock aspect ratio
  const lockRatio = document.getElementById('lock-ratio');
  document.getElementById('width-input').addEventListener('input', function() {
    if (lockRatio && lockRatio.checked && originalWidth) {
      document.getElementById('height-input').value = Math.round(this.value * originalHeight / originalWidth);
    }
  });

  document.getElementById('height-input').addEventListener('input', function() {
    if (lockRatio && lockRatio.checked && originalHeight) {
      document.getElementById('width-input').value = Math.round(this.value * originalWidth / originalHeight);
    }
  });

  document.getElementById('resize-btn').onclick = async () => {
    if (!imageFile) return;
    const w = parseInt(document.getElementById('width-input').value);
    const h = parseInt(document.getElementById('height-input').value);
    const format = document.getElementById('output-format').value;
    if (!w || !h || w < 1 || h < 1) {
      showToast(currentLang === 'ar' ? 'أبعاد غير صحيحة' : 'Invalid dimensions', 'error');
      return;
    }
    await resizeImage(imageFile, w, h, format);
  };
}

async function resizeImage(file, width, height, format) {
  showLoading(currentLang === 'ar' ? 'جاري تغيير الحجم...' : 'Resizing...');
  try {
    const result = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (format === 'jpeg' || format === 'jpg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
          }
          ctx.drawImage(img, 0, 0, width, height);
          const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Resize failed'));
          }, mimeType, 0.92);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const ext = format === 'jpeg' ? 'jpg' : format;
    downloadBlob(result, file.name.replace(/\.[^.]+$/, '') + `_${width}x${height}.${ext}`);
    hideLoading();
    showToast(currentLang === 'ar' ? `✅ تم تغيير الحجم إلى ${width}×${height}` : `✅ Resized to ${width}×${height}`, 'success');
    document.getElementById('result-section').style.display = 'block';
    document.getElementById('result-info').textContent = currentLang === 'ar'
      ? `الحجم الجديد: ${formatFileSize(result.size)}`
      : `New file size: ${formatFileSize(result.size)}`;

  } catch (err) {
    hideLoading();
    showToast(currentLang === 'ar' ? 'خطأ: ' + err.message : 'Error: ' + err.message, 'error');
  }
}

window.initImageCompressor = initImageCompressor;
window.initImageConverter = initImageConverter;
window.initImageResizer = initImageResizer;
