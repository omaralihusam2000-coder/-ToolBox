/**
 * Design Tools: Color Picker, QR Generator, Favicon Generator, Gradient Generator
 */

// ===== COLOR PICKER =====
function initColorPicker() {
  initToolPage('color-picker');
  const colorInput = document.getElementById('color-input');
  if (colorInput) {
    colorInput.addEventListener('input', updateColorValues);
    updateColorValues();
  }
}

function updateColorValues() {
  const hex = document.getElementById('color-input').value;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const [h, s, l] = rgbToHsl(r, g, b);

  document.getElementById('swatch').style.backgroundColor = hex;
  document.getElementById('hex-val').value = hex.toUpperCase();
  document.getElementById('rgb-val').value = `rgb(${r}, ${g}, ${b})`;
  document.getElementById('hsl-val').value = `hsl(${h}, ${s}%, ${l}%)`;
  document.getElementById('rgba-val').value = `rgba(${r}, ${g}, ${b}, 1)`;

  // Generate color palette
  renderColorPalette(r, g, b);
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function renderColorPalette(r, g, b) {
  const palette = document.getElementById('color-palette');
  if (!palette) return;
  const colors = [];
  // Shades and tints
  for (let i = 1; i <= 5; i++) {
    const factor = i / 5;
    colors.push(`rgb(${Math.round(r + (255 - r) * (1 - factor))}, ${Math.round(g + (255 - g) * (1 - factor))}, ${Math.round(b + (255 - b) * (1 - factor))})`);
  }
  palette.innerHTML = colors.map(c => `
    <div style="background:${c};height:40px;border-radius:6px;cursor:pointer;border:1px solid var(--border-color)" 
         title="${c}" onclick="copyText('${c}')"></div>
  `).join('');
}

window.initColorPicker = initColorPicker;
window.updateColorValues = updateColorValues;

// ===== QR GENERATOR =====
function initQrGenerator() {
  initToolPage('qr-generator');
}

function generateQR() {
  const text = document.getElementById('qr-input').value.trim();
  if (!text) { showToast(currentLang === 'ar' ? 'أدخل نصاً أو رابطاً' : 'Enter text or URL', 'error'); return; }

  const container = document.getElementById('qr-container');
  if (!container) return;
  container.innerHTML = '';

  const size = parseInt(document.getElementById('qr-size')?.value || 256);
  const color = document.getElementById('qr-color')?.value || '#000000';
  const bg = document.getElementById('qr-bg')?.value || '#ffffff';
  const errorLevel = document.getElementById('qr-error')?.value || 'M';

  try {
    new QRCode(container, {
      text: text,
      width: size,
      height: size,
      colorDark: color,
      colorLight: bg,
      correctLevel: QRCode.CorrectLevel[errorLevel] || QRCode.CorrectLevel.M
    });

    document.getElementById('result-section').style.display = 'block';
    document.getElementById('download-btn').style.display = 'inline-block';
    showToast(currentLang === 'ar' ? '✅ تم إنشاء QR Code!' : '✅ QR Code generated!', 'success');
  } catch (e) {
    showToast(currentLang === 'ar' ? 'خطأ في الإنشاء' : 'Generation error', 'error');
  }
}

function downloadQR() {
  const canvas = document.querySelector('#qr-container canvas');
  if (!canvas) { showToast(currentLang === 'ar' ? 'أنشئ QR Code أولاً' : 'Generate QR Code first', 'error'); return; }
  const link = document.createElement('a');
  link.download = 'qrcode.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

window.initQrGenerator = initQrGenerator;
window.generateQR = generateQR;
window.downloadQR = downloadQR;

// ===== FAVICON GENERATOR =====
function initFaviconGenerator() {
  initToolPage('favicon-generator');
}

function generateFavicon() {
  const text = document.getElementById('favicon-text').value;
  const bgColor = document.getElementById('fav-bg').value;
  const textColor = document.getElementById('fav-color').value;
  const size = 64;

  const canvas = document.getElementById('favicon-canvas');
  if (!canvas) return;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Background
  const radius = 12;
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Text
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = text.length === 1 ? 38 : text.length === 2 ? 26 : 18;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillText(text.slice(0, 3), size / 2, size / 2);

  document.getElementById('result-section').style.display = 'block';
  canvas.style.display = 'block';

  // Preview sizes
  const previewEl = document.getElementById('favicon-preview');
  if (previewEl) {
    const dataUrl = canvas.toDataURL('image/png');
    previewEl.innerHTML = [16, 32, 48, 64].map(s => `
      <div style="text-align:center">
        <img src="${dataUrl}" width="${s}" height="${s}" style="border:1px solid var(--border-color);border-radius:4px;display:block;margin:0 auto 4px">
        <span style="font-size:0.7rem;color:var(--text-muted)">${s}px</span>
      </div>`).join('');
  }
}

function downloadFavicon() {
  const canvas = document.getElementById('favicon-canvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = 'favicon.ico';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

window.initFaviconGenerator = initFaviconGenerator;
window.generateFavicon = generateFavicon;
window.downloadFavicon = downloadFavicon;

// ===== GRADIENT GENERATOR =====
function initGradientGenerator() {
  initToolPage('gradient-generator');
  updateGradient();
}

function updateGradient() {
  const color1 = document.getElementById('color1').value;
  const color2 = document.getElementById('color2').value;
  const color3 = document.getElementById('color3')?.value || null;
  const angle = document.getElementById('gradient-angle').value;
  const type = document.getElementById('gradient-type')?.value || 'linear';

  document.getElementById('angle-val').textContent = angle + '°';

  let gradient;
  const colors = color3 ? `${color1}, ${color2}, ${color3}` : `${color1}, ${color2}`;
  if (type === 'radial') {
    gradient = `radial-gradient(circle, ${colors})`;
  } else if (type === 'conic') {
    gradient = `conic-gradient(from ${angle}deg, ${colors})`;
  } else {
    gradient = `linear-gradient(${angle}deg, ${colors})`;
  }

  const preview = document.getElementById('gradient-preview');
  if (preview) preview.style.background = gradient;

  const cssCode = `background: ${gradient};`;
  const cssEl = document.getElementById('css-code');
  if (cssEl) cssEl.textContent = cssCode;
}

function copyGradientCSS() {
  const css = document.getElementById('css-code')?.textContent || '';
  copyText(css);
}

window.initGradientGenerator = initGradientGenerator;
window.updateGradient = updateGradient;
window.copyGradientCSS = copyGradientCSS;
