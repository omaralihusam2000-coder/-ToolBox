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
  EUR: 0.92,
  GBP: 0.79,
  SAR: 3.75,
  AED: 3.67,
  TRY: 32.5,
  EGP: 48.5,
  JOD: 0.71,
  KWD: 0.31,
  BHD: 0.38,
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

  const names = currentLang === 'ar' ? CURRENCY_NAMES_AR : CURRENCY_NAMES_EN;
  const options = Object.keys(CURRENCY_RATES).map(code =>
    `<option value="${code}">${code} - ${names[code]}</option>`
  ).join('');

  from.innerHTML = options;
  to.innerHTML = options;
  from.value = 'USD';
  to.value = 'IQD';
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
          ${currentLang === 'ar' ? '* أسعار تقريبية، للاستخدام التوجيهي فقط' : '* Approximate rates for reference only'}
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
