/**
 * Text Tools
 */

// ===== WORD COUNTER =====
function initWordCounter() {
  initToolPage('word-counter');
  const textarea = document.getElementById('text-input');
  if (!textarea) return;
  textarea.addEventListener('input', updateWordCount);
}

function updateWordCount() {
  const text = document.getElementById('text-input').value;
  const words = text.trim() ? text.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const sentences = text.trim() ? text.split(/[.!?؟]+/).filter(s => s.trim().length > 0).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\n+/).filter(p => p.trim().length > 0).length : 0;
  const readTime = Math.max(1, Math.ceil(words / 200));

  document.getElementById('word-count').textContent = words.toLocaleString();
  document.getElementById('char-count').textContent = chars.toLocaleString();
  document.getElementById('char-no-space').textContent = charsNoSpace.toLocaleString();
  document.getElementById('sentence-count').textContent = sentences.toLocaleString();
  document.getElementById('paragraph-count').textContent = paragraphs.toLocaleString();
  document.getElementById('read-time').textContent = readTime + (currentLang === 'ar' ? ' دقيقة' : ' min');
}

// ===== CASE CONVERTER =====
function initCaseConverter() {
  initToolPage('case-converter');
}

function convertCase(type) {
  const input = document.getElementById('text-input').value;
  let result = '';
  switch (type) {
    case 'upper': result = input.toUpperCase(); break;
    case 'lower': result = input.toLowerCase(); break;
    case 'title': result = input.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase()); break;
    case 'camel': result = input.toLowerCase().replace(/[^a-z0-9]+(.)/g, (m, c) => c.toUpperCase()); break;
    case 'snake': result = input.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''); break;
    case 'kebab': result = input.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); break;
    case 'sentence': result = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase(); break;
    case 'reverse': result = input.split('').reverse().join(''); break;
    default: result = input;
  }
  document.getElementById('text-output').textContent = result;
  document.getElementById('result-section').style.display = 'block';
}

window.convertCase = convertCase;

// ===== REMOVE DIACRITICS =====
function initRemoveDiacritics() {
  initToolPage('remove-diacritics');
}

function removeDiacritics() {
  const input = document.getElementById('text-input').value;
  // Arabic diacritics unicode range
  const result = input.replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '');
  document.getElementById('text-output').textContent = result;
  document.getElementById('result-section').style.display = 'block';
  document.getElementById('char-saved').textContent = input.length - result.length;
  showToast(currentLang === 'ar' ? '✅ تم إزالة التشكيل!' : '✅ Diacritics removed!', 'success');
}

window.removeDiacritics = removeDiacritics;

// ===== LOREM IPSUM =====
function initLoremIpsum() {
  initToolPage('lorem-ipsum');
}

const loremAr = [
  'هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة.',
  'لقد اختير هذا النص من مولد النص العربي تحديداً لأن له توزيعاً مماثلاً للأحرف.',
  'إذا كنت تريد نصاً لن يلفت الانتباه أو يزعج القارئ أثناء تصفحه للتصميم.',
  'يتميز هذا النص بأنه يبدو طبيعياً ومفهوماً دون أن يكون ذا معنى محدد.',
  'تعد هذه الفقرة مثالاً لنص يمكن استخدامه في تصاميم المواقع والكتب والمطبوعات.',
  'كثيراً ما تُستخدم نصوص مشابهة في التصميم الجرافيكي والإلكتروني.',
  'يساعد هذا النص في رؤية الشكل النهائي للموقع أو المطبوع قبل إدخال المحتوى الحقيقي.',
  'هذا النص من مجموعة نصوص يستخدمها المصممون لملء المساحات في التصاميم.',
];

const loremEn = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
  'Duis aute irure dolor in reprehenderit in voluptate velit.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur.',
  'Neque porro quisquam est qui dolorem ipsum quia dolor sit.',
  'Temporibus autem quibusdam et aut officiis debitis rerum.',
];

function generateLorem() {
  const lang = document.getElementById('lorem-lang').value;
  const count = parseInt(document.getElementById('lorem-count').value) || 3;
  const type = document.getElementById('lorem-type').value;
  const pool = lang === 'ar' ? loremAr : loremEn;

  let result = '';
  if (type === 'words') {
    const words = pool.join(' ').split(' ');
    result = words.slice(0, count).join(' ');
  } else if (type === 'sentences') {
    for (let i = 0; i < count; i++) result += pool[i % pool.length] + ' ';
    result = result.trim();
  } else {
    for (let i = 0; i < count; i++) {
      const paraLen = 3 + Math.floor(Math.random() * 3);
      let para = '';
      for (let j = 0; j < paraLen; j++) para += pool[(i * paraLen + j) % pool.length] + ' ';
      result += para.trim() + '\n\n';
    }
    result = result.trim();
  }

  document.getElementById('lorem-output').textContent = result;
  document.getElementById('result-section').style.display = 'block';
}

window.generateLorem = generateLorem;

// ===== TEXT TO SPEECH =====
function initTextToSpeech() {
  initToolPage('text-to-speech');
  // Populate voice list
  if (window.speechSynthesis) {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      const select = document.getElementById('voice-select');
      if (select && voices.length) {
        select.innerHTML = voices.map((v, i) => `<option value="${i}">${v.name} (${v.lang})</option>`).join('');
      }
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }
}

let currentUtterance = null;

function speakText() {
  if (!window.speechSynthesis) {
    showToast(currentLang === 'ar' ? 'المتصفح لا يدعم هذه الميزة' : 'Browser does not support TTS', 'error');
    return;
  }
  const text = document.getElementById('text-input').value.trim();
  if (!text) { showToast(currentLang === 'ar' ? 'أدخل نصاً أولاً' : 'Enter text first', 'error'); return; }

  speechSynthesis.cancel();
  currentUtterance = new SpeechSynthesisUtterance(text);

  const voiceSelect = document.getElementById('voice-select');
  if (voiceSelect) {
    const voices = speechSynthesis.getVoices();
    currentUtterance.voice = voices[parseInt(voiceSelect.value)] || voices[0];
  }

  const rate = document.getElementById('speech-rate');
  const pitch = document.getElementById('speech-pitch');
  if (rate) currentUtterance.rate = parseFloat(rate.value);
  if (pitch) currentUtterance.pitch = parseFloat(pitch.value);

  currentUtterance.onstart = () => {
    document.getElementById('speak-btn').textContent = '⏹ ' + (currentLang === 'ar' ? 'إيقاف' : 'Stop');
  };
  currentUtterance.onend = () => {
    document.getElementById('speak-btn').textContent = '🔊 ' + (currentLang === 'ar' ? 'تشغيل' : 'Speak');
  };

  speechSynthesis.speak(currentUtterance);
}

function stopSpeech() {
  if (window.speechSynthesis) speechSynthesis.cancel();
  const btn = document.getElementById('speak-btn');
  if (btn) btn.textContent = '🔊 ' + (currentLang === 'ar' ? 'تشغيل' : 'Speak');
}

window.speakText = speakText;
window.stopSpeech = stopSpeech;

// ===== BASE64 =====
function initBase64() {
  initToolPage('base64');
}

function encodeBase64() {
  const input = document.getElementById('text-input').value;
  try {
    const result = btoa(unescape(encodeURIComponent(input)));
    document.getElementById('text-output').textContent = result;
    document.getElementById('result-section').style.display = 'block';
  } catch (e) {
    showToast(currentLang === 'ar' ? 'خطأ في التشفير' : 'Encoding error', 'error');
  }
}

function decodeBase64() {
  const input = document.getElementById('text-input').value.trim();
  try {
    const result = decodeURIComponent(escape(atob(input)));
    document.getElementById('text-output').textContent = result;
    document.getElementById('result-section').style.display = 'block';
  } catch (e) {
    showToast(currentLang === 'ar' ? 'نص Base64 غير صحيح' : 'Invalid Base64 input', 'error');
  }
}

window.encodeBase64 = encodeBase64;
window.decodeBase64 = decodeBase64;

// ===== URL ENCODER =====
function initUrlEncoder() {
  initToolPage('url-encoder');
}

function encodeUrl() {
  const input = document.getElementById('text-input').value;
  document.getElementById('text-output').textContent = encodeURIComponent(input);
  document.getElementById('result-section').style.display = 'block';
}

function decodeUrl() {
  try {
    const input = document.getElementById('text-input').value;
    document.getElementById('text-output').textContent = decodeURIComponent(input);
    document.getElementById('result-section').style.display = 'block';
  } catch (e) {
    showToast(currentLang === 'ar' ? 'خطأ في فك التشفير' : 'Decoding error', 'error');
  }
}

window.encodeUrl = encodeUrl;
window.decodeUrl = decodeUrl;
window.initWordCounter = initWordCounter;
window.initCaseConverter = initCaseConverter;
window.initRemoveDiacritics = initRemoveDiacritics;
window.initLoremIpsum = initLoremIpsum;
window.initTextToSpeech = initTextToSpeech;
window.initBase64 = initBase64;
window.initUrlEncoder = initUrlEncoder;
