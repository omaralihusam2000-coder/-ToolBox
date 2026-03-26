/**
 * Calculators: Age, BMI, Currency, Percentage, Loan
 */

// ===== AGE CALCULATOR =====
function initAgeCalculator() {
  initToolPage('age-calculator');
}

function calculateAge() {
  const dob = document.getElementById('dob-input').value;
  if (!dob) { showToast(currentLang === 'ar' ? 'اختر تاريخ الميلاد' : 'Select birth date', 'error'); return; }

  const birth = new Date(dob);
  const today = new Date();

  if (birth > today) { showToast(currentLang === 'ar' ? 'تاريخ الميلاد في المستقبل!' : 'Birth date is in the future!', 'error'); return; }

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) { years--; months += 12; }

  const totalDays = Math.floor((today - birth) / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;
  const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
  const daysToNext = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));

  const ageText = document.getElementById('age-result');
  const detailsEl = document.getElementById('age-details');

  if (ageText) {
    ageText.textContent = currentLang === 'ar'
      ? `${years} سنة و ${months} شهر و ${days} يوم`
      : `${years} years, ${months} months, ${days} days`;
  }

  if (detailsEl) {
    detailsEl.innerHTML = `
      <div class="stats-row">
        <div class="stat-card"><div class="num">${years}</div><div class="lbl">${currentLang === 'ar' ? 'سنة' : 'Years'}</div></div>
        <div class="stat-card"><div class="num">${totalDays.toLocaleString()}</div><div class="lbl">${currentLang === 'ar' ? 'يوم' : 'Days'}</div></div>
        <div class="stat-card"><div class="num">${totalWeeks.toLocaleString()}</div><div class="lbl">${currentLang === 'ar' ? 'أسبوع' : 'Weeks'}</div></div>
        <div class="stat-card"><div class="num">${daysToNext}</div><div class="lbl">${currentLang === 'ar' ? 'يوم لعيد ميلادك' : 'Days to Birthday'}</div></div>
      </div>`;
  }

  document.getElementById('result-section').style.display = 'block';
}

window.calculateAge = calculateAge;

// ===== BMI CALCULATOR =====
function initBmiCalculator() {
  initToolPage('bmi-calculator');
}

function calculateBMI() {
  const weightEl = document.getElementById('weight-input');
  const heightEl = document.getElementById('height-input');
  if (!weightEl || !heightEl) return;

  const weight = parseFloat(weightEl.value);
  const height = parseFloat(heightEl.value) / 100; // cm to m

  if (!weight || !height || weight <= 0 || height <= 0) {
    showToast(currentLang === 'ar' ? 'أدخل الوزن والطول' : 'Enter weight and height', 'error');
    return;
  }

  if (weight > 500 || weight < 1) {
    showToast(currentLang === 'ar' ? 'أدخل وزناً منطقياً (1-500 كغ)' : 'Enter a valid weight (1-500 kg)', 'error');
    return;
  }
  if (height > 3 || height < 0.3) {
    showToast(currentLang === 'ar' ? 'أدخل طولاً منطقياً (30-300 سم)' : 'Enter a valid height (30-300 cm)', 'error');
    return;
  }

  const bmi = weight / (height * height);
  const rounded = bmi.toFixed(1);

  let category, color, advice;
  if (bmi < 18.5) {
    category = currentLang === 'ar' ? 'نحيل جداً' : 'Underweight';
    color = '#4895ef';
    advice = currentLang === 'ar' ? 'يُنصح بزيادة تناول السعرات الحرارية وتناول وجبات غنية بالبروتين' : 'Consider increasing caloric intake with protein-rich foods.';
  } else if (bmi < 25) {
    category = currentLang === 'ar' ? 'وزن طبيعي ✅' : 'Normal Weight ✅';
    color = '#22c55e';
    advice = currentLang === 'ar' ? 'وزنك مثالي! حافظ على نمط حياة صحي' : 'Your weight is ideal! Maintain a healthy lifestyle.';
  } else if (bmi < 30) {
    category = currentLang === 'ar' ? 'زيادة وزن' : 'Overweight';
    color = '#ffd166';
    advice = currentLang === 'ar' ? 'يُنصح بممارسة الرياضة وتقليل السكريات' : 'Consider regular exercise and reducing sugars.';
  } else {
    category = currentLang === 'ar' ? 'سمنة' : 'Obese';
    color = '#e63946';
    advice = currentLang === 'ar' ? 'يُنصح بمراجعة الطبيب وتغيير نمط الحياة' : 'Consult a doctor and consider lifestyle changes.';
  }

  const resultEl = document.getElementById('bmi-result');
  if (resultEl) {
    resultEl.innerHTML = `
      <div style="text-align:center;padding:24px">
        <div style="font-size:4rem;font-weight:900;color:${color};margin-bottom:8px">${rounded}</div>
        <div style="font-size:1.2rem;font-weight:700;color:${color};margin-bottom:16px">${category}</div>
        <div style="background:var(--bg-primary);border-radius:var(--radius-sm);padding:12px;font-size:0.9rem;color:var(--text-secondary);text-align:start">
          ${advice}
        </div>
        <div style="margin-top:20px">
          <div style="background:linear-gradient(90deg,#4895ef 0%,#22c55e 33%,#ffd166 66%,#e63946 100%);height:12px;border-radius:6px;position:relative">
            <div style="position:absolute;top:-6px;left:${Math.min(Math.max((bmi - 10) / 30 * 100, 0), 100)}%;transform:translateX(-50%);width:20px;height:20px;background:white;border:3px solid ${color};border-radius:50%"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:var(--text-muted);margin-top:6px">
            <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40+</span>
          </div>
        </div>
      </div>`;
  }

  document.getElementById('result-section').style.display = 'block';
}

window.calculateBMI = calculateBMI;

// ===== CURRENCY CONVERTER =====
const CURRENCY_RATES = {
  USD: 1,
  IQD: 1310,
  EUR: 0.91,
  GBP: 0.78,
  SAR: 3.75,
  AED: 3.67,
  TRY: 38.2,
  EGP: 50.5,
  JOD: 0.71,
  KWD: 0.31,
  BHD: 0.376,
  QAR: 3.64,
};

const CURRENCY_NAMES_AR = {
  USD: 'دولار أمريكي', IQD: 'دينار عراقي', EUR: 'يورو', GBP: 'جنيه إسترليني',
  SAR: 'ريال سعودي', AED: 'درهم إماراتي', TRY: 'ليرة تركية', EGP: 'جنيه مصري',
  JOD: 'دينار أردني', KWD: 'دينار كويتي', BHD: 'دينار بحريني', QAR: 'ريال قطري'
};

const CURRENCY_NAMES_EN = {
  USD: 'US Dollar', IQD: 'Iraqi Dinar', EUR: 'Euro', GBP: 'British Pound',
  SAR: 'Saudi Riyal', AED: 'UAE Dirham', TRY: 'Turkish Lira', EGP: 'Egyptian Pound',
  JOD: 'Jordanian Dinar', KWD: 'Kuwaiti Dinar', BHD: 'Bahraini Dinar', QAR: 'Qatari Riyal'
};

function initCurrencyConverter() {
  initToolPage('currency-converter');
  populateCurrencySelects();
}

function populateCurrencySelects() {
  const from = document.getElementById('from-currency');
  const to = document.getElementById('to-currency');
  if (!from || !to) return;

  const prevFrom = from.value;
  const prevTo = to.value;
  const names = (window.currentLang || 'ar') === 'ar' ? CURRENCY_NAMES_AR : CURRENCY_NAMES_EN;
  const options = Object.keys(CURRENCY_RATES).map(code =>
    `<option value="${code}">${code} - ${names[code]}</option>`
  ).join('');

  from.innerHTML = options;
  to.innerHTML = options;
  from.value = prevFrom || 'USD';
  to.value = prevTo || 'IQD';
}

function convertCurrency() {
  const amount = parseFloat(document.getElementById('amount-input').value);
  const from = document.getElementById('from-currency').value;
  const to = document.getElementById('to-currency').value;

  if (isNaN(amount) || amount <= 0) {
    showToast(currentLang === 'ar' ? 'أدخل مبلغاً صحيحاً' : 'Enter a valid amount', 'error');
    return;
  }

  const amountInUSD = amount / CURRENCY_RATES[from];
  const result = amountInUSD * CURRENCY_RATES[to];

  const resultEl = document.getElementById('currency-result');
  if (resultEl) {
    resultEl.innerHTML = `
      <div style="text-align:center;padding:20px">
        <div style="font-size:1.1rem;color:var(--text-muted);margin-bottom:8px">${amount.toLocaleString()} ${from}</div>
        <div style="font-size:3rem;font-weight:900;color:var(--accent-yellow);margin-bottom:8px">=</div>
        <div style="font-size:2.5rem;font-weight:900;color:var(--accent-red)">${result.toLocaleString(undefined, {maximumFractionDigits: 2})} ${to}</div>
        <div style="margin-top:16px;font-size:0.8rem;color:var(--text-muted)">
          1 ${from} = ${(CURRENCY_RATES[to] / CURRENCY_RATES[from]).toFixed(4)} ${to}
        </div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">
          ${currentLang === 'ar' ? '* أسعار تقريبية — آخر تحديث: مارس 2026' : '* Approximate rates — Last updated: March 2026'}
        </div>
      </div>`;
  }

  document.getElementById('result-section').style.display = 'block';
}

function swapCurrencies() {
  const from = document.getElementById('from-currency');
  const to = document.getElementById('to-currency');
  const temp = from.value;
  from.value = to.value;
  to.value = temp;
  if (document.getElementById('amount-input').value) convertCurrency();
}

window.initCurrencyConverter = initCurrencyConverter;
window.convertCurrency = convertCurrency;
window.swapCurrencies = swapCurrencies;

// ===== PERCENTAGE CALCULATOR =====
function initPercentageCalculator() {
  initToolPage('percentage-calculator');
}

function calcPercentage(type) {
  let result, explanation;
  switch (type) {
    case '1': {
      const pct = parseFloat(document.getElementById('pct1').value);
      const num = parseFloat(document.getElementById('num1').value);
      if (isNaN(pct) || isNaN(num)) break;
      result = (pct / 100) * num;
      explanation = `${pct}% ${currentLang === 'ar' ? 'من' : 'of'} ${num} = ${result.toFixed(2)}`;
      break;
    }
    case '2': {
      const part = parseFloat(document.getElementById('part2').value);
      const total = parseFloat(document.getElementById('total2').value);
      if (isNaN(part) || isNaN(total) || total === 0) break;
      result = (part / total) * 100;
      explanation = `${part} ${currentLang === 'ar' ? 'من' : 'out of'} ${total} = ${result.toFixed(2)}%`;
      break;
    }
    case '3': {
      const old = parseFloat(document.getElementById('old3').value);
      const newVal = parseFloat(document.getElementById('new3').value);
      if (isNaN(old) || isNaN(newVal) || old === 0) break;
      result = ((newVal - old) / old) * 100;
      const dir = result >= 0 ? (currentLang === 'ar' ? 'زيادة' : 'increase') : (currentLang === 'ar' ? 'نقصان' : 'decrease');
      explanation = `${currentLang === 'ar' ? 'نسبة التغيير:' : 'Change:'} ${Math.abs(result).toFixed(2)}% ${dir}`;
      break;
    }
    case '4': {
      const base = parseFloat(document.getElementById('base4').value);
      const pct4 = parseFloat(document.getElementById('pct4').value);
      if (isNaN(base) || isNaN(pct4)) break;
      const discount = (pct4 / 100) * base;
      result = base - discount;
      explanation = `${currentLang === 'ar' ? 'السعر بعد الخصم:' : 'Price after discount:'} ${result.toFixed(2)} (${currentLang === 'ar' ? 'وفرت' : 'saved'} ${discount.toFixed(2)})`;
      break;
    }
  }

  const el = document.getElementById(`result-${type}`);
  if (el && explanation) el.textContent = explanation;
}

window.calcPercentage = calcPercentage;

// ===== LOAN CALCULATOR =====
function initLoanCalculator() {
  initToolPage('loan-calculator');
}

function calculateLoan() {
  const principal = parseFloat(document.getElementById('loan-amount').value);
  const annualRate = parseFloat(document.getElementById('interest-rate').value);
  const months = parseInt(document.getElementById('loan-term').value);

  if (!principal || !months || principal <= 0 || months <= 0) {
    showToast(currentLang === 'ar' ? 'أدخل بيانات صحيحة' : 'Enter valid data', 'error');
    return;
  }

  const r = annualRate > 0 ? (annualRate / 100) / 12 : 0;
  let monthlyPayment, totalPayment, totalInterest;

  if (r === 0) {
    monthlyPayment = principal / months;
    totalPayment = principal;
    totalInterest = 0;
  } else {
    monthlyPayment = principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    totalPayment = monthlyPayment * months;
    totalInterest = totalPayment - principal;
  }

  const resultEl = document.getElementById('loan-result');
  if (resultEl) {
    resultEl.innerHTML = `
      <div class="stats-row">
        <div class="stat-card">
          <div class="num">${monthlyPayment.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
          <div class="lbl">${currentLang === 'ar' ? 'القسط الشهري' : 'Monthly Payment'}</div>
        </div>
        <div class="stat-card">
          <div class="num">${totalPayment.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
          <div class="lbl">${currentLang === 'ar' ? 'إجمالي المبلغ' : 'Total Payment'}</div>
        </div>
        <div class="stat-card">
          <div class="num">${totalInterest.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
          <div class="lbl">${currentLang === 'ar' ? 'إجمالي الفائدة' : 'Total Interest'}</div>
        </div>
      </div>`;
  }

  // Amortization table (first 12 rows)
  const tableEl = document.getElementById('amortization-table');
  if (tableEl) {
    let balance = principal;
    let rows = '';
    const displayMonths = Math.min(months, 12);

    for (let i = 1; i <= displayMonths; i++) {
      const interest = r > 0 ? balance * r : 0;
      const principalPaid = monthlyPayment - interest;
      balance = Math.max(0, balance - principalPaid);
      rows += `<tr>
        <td>${i}</td>
        <td>${monthlyPayment.toFixed(2)}</td>
        <td>${principalPaid.toFixed(2)}</td>
        <td>${interest.toFixed(2)}</td>
        <td>${balance.toFixed(2)}</td>
      </tr>`;
    }

    const headers = currentLang === 'ar'
      ? ['الشهر', 'القسط', 'الأصل', 'الفائدة', 'الرصيد المتبقي']
      : ['Month', 'Payment', 'Principal', 'Interest', 'Balance'];

    tableEl.innerHTML = `
      <div style="overflow-x:auto;margin-top:16px">
        <table class="data-table">
          <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
        ${months > 12 ? `<p style="text-align:center;color:var(--text-muted);font-size:0.8rem;margin-top:8px">${currentLang === 'ar' ? `تعرض أول 12 شهر من ${months}` : `Showing first 12 of ${months} months`}</p>` : ''}
      </div>`;
  }

  document.getElementById('result-section').style.display = 'block';
}

window.initLoanCalculator = initLoanCalculator;
window.calculateLoan = calculateLoan;
window.initPercentageCalculator = initPercentageCalculator;
window.initAgeCalculator = initAgeCalculator;
window.initBmiCalculator = initBmiCalculator;

// ===== GPA CALCULATOR =====

// Grading systems: maps score/grade → GPA points
const GRADING_SYSTEMS = {
  iraq100: {
    // Iraqi 100-point scale → 4.0 GPA equivalent
    toGPA: (grade) => {
      const g = parseFloat(grade);
      if (isNaN(g)) return null;
      if (g >= 90) return 4.0;
      if (g >= 80) return 3.0;
      if (g >= 70) return 2.0;
      if (g >= 60) return 1.0;
      return 0;
    },
    label: (grade, lang) => {
      const g = parseFloat(grade);
      if (isNaN(g)) return '';
      if (g >= 90) return lang === 'ar' ? 'امتياز' : 'Excellent';
      if (g >= 80) return lang === 'ar' ? 'جيد جداً' : 'Very Good';
      if (g >= 70) return lang === 'ar' ? 'جيد' : 'Good';
      if (g >= 60) return lang === 'ar' ? 'مقبول' : 'Acceptable';
      return lang === 'ar' ? 'راسب' : 'Fail';
    },
    max: 100,
    placeholder: '85',
  },
  gpa4: {
    toGPA: (grade) => {
      const g = parseFloat(grade);
      if (isNaN(g) || g < 0 || g > 4) return null;
      return g;
    },
    label: (grade, lang) => {
      const g = parseFloat(grade);
      if (isNaN(g)) return '';
      if (g >= 3.7) return 'A';
      if (g >= 3.3) return 'A-';
      if (g >= 3.0) return 'B+';
      if (g >= 2.7) return 'B';
      if (g >= 2.3) return 'B-';
      if (g >= 2.0) return 'C+';
      if (g >= 1.7) return 'C';
      if (g >= 1.0) return 'D';
      return 'F';
    },
    max: 4,
    placeholder: '3.5',
  },
  gpa5: {
    toGPA: (grade) => {
      const g = parseFloat(grade);
      if (isNaN(g) || g < 0 || g > 5) return null;
      return (g / 5) * 4; // normalize to 4.0
    },
    label: (grade, lang) => {
      const g = parseFloat(grade);
      if (isNaN(g)) return '';
      if (g >= 4.5) return 'A';
      if (g >= 3.5) return 'B';
      if (g >= 2.5) return 'C';
      if (g >= 1.5) return 'D';
      return 'F';
    },
    max: 5,
    placeholder: '4.0',
  },
};

let subjectCount = 0;

function initGPACalculator() {
  initToolPage('gpa-calculator');
  renderGradeReference();
  // Add 4 subjects by default
  for (let i = 0; i < 4; i++) addSubject();
}

function getGradingSystem() {
  const sel = document.getElementById('grading-system');
  return GRADING_SYSTEMS[sel ? sel.value : 'iraq100'];
}

function addSubject() {
  const list = document.getElementById('subjects-list');
  if (!list) return;
  subjectCount++;
  const id = subjectCount;
  const lang = window.currentLang || 'ar';
  const sys = getGradingSystem();

  const row = document.createElement('div');
  row.className = 'subject-row';
  row.id = 'subject-row-' + id;
  row.innerHTML = `
    <input type="text" class="form-control subject-name" placeholder="${lang === 'ar' ? 'اسم المادة' : 'Subject name'}" value="">
    <input type="number" class="form-control subject-credits" placeholder="3" min="0.5" step="0.5" value="3">
    <input type="number" class="form-control subject-grade" placeholder="${sys.placeholder}" min="0" max="${sys.max}" step="0.5">
    <button class="remove-row-btn" onclick="removeSubject(${id})">✕</button>`;
  list.appendChild(row);
}

function removeSubject(id) {
  const row = document.getElementById('subject-row-' + id);
  if (row) row.remove();
}

function calculateGPA() {
  const lang = window.currentLang || 'ar';
  const sys = getGradingSystem();
  const rows = document.querySelectorAll('.subject-row');

  let totalCredits = 0;
  let weightedSum = 0;
  let totalScore = 0;
  let subjectData = [];
  let hasError = false;

  rows.forEach(row => {
    const nameEl = row.querySelector('.subject-name');
    const credEl = row.querySelector('.subject-credits');
    const gradeEl = row.querySelector('.subject-grade');
    if (!credEl || !gradeEl) return;

    const credits = parseFloat(credEl.value);
    const grade = gradeEl.value;
    if (!grade || isNaN(credits) || credits <= 0) return;

    const gpaPoints = sys.toGPA(grade);
    if (gpaPoints === null) { hasError = true; return; }

    const gradeLabel = sys.label(grade, lang);
    const name = nameEl ? nameEl.value || (lang === 'ar' ? 'مادة' : 'Subject') : '';

    weightedSum += gpaPoints * credits;
    totalScore += parseFloat(grade) * credits;
    totalCredits += credits;
    subjectData.push({ name, credits, grade, gpaPoints, gradeLabel });
  });

  if (hasError) { showToast(lang === 'ar' ? 'بعض الدرجات غير صحيحة' : 'Some grades are invalid', 'error'); return; }
  if (totalCredits === 0) { showToast(lang === 'ar' ? 'أضف مواد وأدخل الدرجات' : 'Add subjects and enter grades', 'error'); return; }

  const semGPA = weightedSum / totalCredits;
  const avgScore = totalScore / totalCredits;
  const maxScore = getGradingSystem().max;
  const pct = (avgScore / maxScore) * 100;

  // Display
  document.getElementById('gpa-semester').textContent = semGPA.toFixed(2);
  document.getElementById('gpa-percent').textContent = pct.toFixed(1) + '%';
  document.getElementById('gpa-total-credits').textContent = totalCredits;

  // Grade badge
  const badge = document.getElementById('gpa-semester-grade');
  if (badge) {
    let cls, label;
    if (semGPA >= 3.5) { cls = 'gpa-a'; label = lang === 'ar' ? 'امتياز 🌟' : 'Excellent 🌟'; }
    else if (semGPA >= 2.5) { cls = 'gpa-b'; label = lang === 'ar' ? 'جيد جداً' : 'Very Good'; }
    else if (semGPA >= 1.5) { cls = 'gpa-c'; label = lang === 'ar' ? 'جيد' : 'Good'; }
    else { cls = 'gpa-d'; label = lang === 'ar' ? 'مقبول / راسب' : 'Acceptable / Fail'; }
    badge.className = 'grade-badge ' + cls;
    badge.textContent = label;
  }

  // Breakdown
  const brkEl = document.getElementById('gpa-subjects-breakdown');
  if (brkEl) {
    brkEl.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
        <thead>
          <tr style="background:var(--bg-primary)">
            <th style="padding:8px;border:1px solid var(--border-color);text-align:start">${lang === 'ar' ? 'المادة' : 'Subject'}</th>
            <th style="padding:8px;border:1px solid var(--border-color);text-align:center">${lang === 'ar' ? 'الوحدات' : 'Credits'}</th>
            <th style="padding:8px;border:1px solid var(--border-color);text-align:center">${lang === 'ar' ? 'الدرجة' : 'Grade'}</th>
            <th style="padding:8px;border:1px solid var(--border-color);text-align:center">${lang === 'ar' ? 'التقدير' : 'Letter'}</th>
            <th style="padding:8px;border:1px solid var(--border-color);text-align:center">GPA</th>
          </tr>
        </thead>
        <tbody>
          ${subjectData.map(s => `
            <tr>
              <td style="padding:8px;border:1px solid var(--border-color)">${s.name}</td>
              <td style="padding:8px;border:1px solid var(--border-color);text-align:center">${s.credits}</td>
              <td style="padding:8px;border:1px solid var(--border-color);text-align:center;font-weight:700;color:var(--accent-yellow)">${s.grade}</td>
              <td style="padding:8px;border:1px solid var(--border-color);text-align:center">${s.gradeLabel}</td>
              <td style="padding:8px;border:1px solid var(--border-color);text-align:center;font-weight:700">${s.gpaPoints.toFixed(2)}</td>
            </tr>`).join('')}
          <tr style="background:var(--bg-primary);font-weight:700">
            <td style="padding:8px;border:1px solid var(--border-color)">${lang === 'ar' ? 'المجموع / المعدل' : 'Total / GPA'}</td>
            <td style="padding:8px;border:1px solid var(--border-color);text-align:center">${totalCredits}</td>
            <td style="padding:8px;border:1px solid var(--border-color);text-align:center;color:var(--accent-yellow)">${avgScore.toFixed(1)}</td>
            <td colspan="2" style="padding:8px;border:1px solid var(--border-color);text-align:center;color:var(--accent-red)">${semGPA.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>`;
  }

  document.getElementById('gpa-result-box').style.display = 'block';
}

function calculateCGPA() {
  const lang = window.currentLang || 'ar';
  const currentCGPA = parseFloat(document.getElementById('current-cgpa')?.value);
  const totalCreditsEarned = parseFloat(document.getElementById('total-credits-earned')?.value);

  if (isNaN(currentCGPA) || isNaN(totalCreditsEarned) || totalCreditsEarned < 0) {
    showToast(lang === 'ar' ? 'أدخل المعدل الحالي والوحدات' : 'Enter current GPA and credits', 'error');
    return;
  }

  // Get current semester GPA
  const semGPAEl = document.getElementById('gpa-semester');
  const semCreditsEl = document.getElementById('gpa-total-credits');
  if (!semGPAEl || !semCreditsEl || semGPAEl.textContent === '0.00') {
    showToast(lang === 'ar' ? 'احسب المعدل الفصلي أولاً' : 'Calculate semester GPA first', 'error');
    return;
  }

  const semGPA = parseFloat(semGPAEl.textContent);
  const semCredits = parseFloat(semCreditsEl.textContent);
  const newCGPA = ((currentCGPA * totalCreditsEarned) + (semGPA * semCredits)) / (totalCreditsEarned + semCredits);

  const resultEl = document.getElementById('new-cgpa');
  if (resultEl) resultEl.textContent = newCGPA.toFixed(2);
  document.getElementById('cgpa-result').style.display = 'block';
}

function renderGradeReference() {
  const lang = window.currentLang || 'ar';
  const sel = document.getElementById('grading-system');
  const refEl = document.getElementById('grade-reference');
  if (!refEl) return;

  const system = sel ? sel.value : 'iraq100';
  const refs = {
    iraq100: lang === 'ar'
      ? '90-100: امتياز (4.0) | 80-89: جيد جداً (3.0) | 70-79: جيد (2.0) | 60-69: مقبول (1.0) | <60: راسب'
      : '90-100: Excellent (4.0) | 80-89: Very Good (3.0) | 70-79: Good (2.0) | 60-69: Pass (1.0) | <60: Fail',
    gpa4:  'A=4.0 | A-=3.7 | B+=3.3 | B=3.0 | B-=2.7 | C+=2.3 | C=2.0 | D=1.0 | F=0',
    gpa5:  'A=5.0 | B=4.0 | C=3.0 | D=2.0 | F=0-1',
  };
  refEl.textContent = refs[system] || '';

  // Update grade input placeholders and max values to match the selected system
  const sys = GRADING_SYSTEMS[system];
  document.querySelectorAll('.subject-grade').forEach(el => {
    el.placeholder = sys.placeholder;
    el.max = sys.max;
  });

  // Update the current-cgpa max: Iraqi 100 normalises to 4.0, so max is 4 for that too
  const cgpaMax = system === 'gpa5' ? 5 : 4;
  const cgpaEl = document.getElementById('current-cgpa');
  if (cgpaEl) { cgpaEl.max = cgpaMax; cgpaEl.placeholder = system === 'gpa5' ? '4.0' : '3.5'; }
}

window.initGPACalculator = initGPACalculator;
window.addSubject = addSubject;
window.removeSubject = removeSubject;
window.calculateGPA = calculateGPA;
window.calculateCGPA = calculateCGPA;
window.renderGradeReference = renderGradeReference;
