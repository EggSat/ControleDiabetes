const fields = [...document.querySelectorAll('input')];
const mealCards = [...document.querySelectorAll('.meal-card')];
const mealCarbs = [...document.querySelectorAll('.meal-carbs')];
const savedTarget = localStorage.getItem('diabetes-dashboard-target');
const savedCorrectionFactor = localStorage.getItem('diabetes-dashboard-correction-factor')
  || localStorage.getItem('diabetes-dashboard-correction-insulin');
const themeToggle = document.querySelector('#theme-toggle');

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isDark = theme === 'dark';
  const label = isDark ? 'Usar tema claro' : 'Usar tema escuro';
  themeToggle.setAttribute('aria-label', label);
  themeToggle.setAttribute('title', label);
  themeToggle.setAttribute('aria-pressed', String(isDark));
}

setTheme(localStorage.getItem('diabetes-dashboard-theme') || 'light');
themeToggle.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('diabetes-dashboard-theme', theme);
  setTheme(theme);
});

if (savedTarget !== null) document.querySelector('#target-glucose').value = savedTarget;
if (savedCorrectionFactor !== null) document.querySelector('#correction-factor').value = savedCorrectionFactor;

function getSavedCarbs() {
  try {
    return JSON.parse(localStorage.getItem('diabetes-dashboard-meal-carbs') || '{}');
  } catch {
    return {};
  }
}

const savedCarbs = getSavedCarbs();
mealCards.forEach((card) => {
  card.querySelector('.meal-carbs').value = savedCarbs[card.dataset.meal] || '';
});

const number = (value) => Number.parseFloat(value) || 0;
const format = (value, suffix) => `${Number(value.toFixed(1)).toLocaleString('pt-BR')} ${suffix}`;
const monthlyInsulinStorageKey = 'diabetes-dashboard-monthly-insulin';

function getMonthKey(offset = 0) {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthlyInsulin() {
  try {
    return JSON.parse(localStorage.getItem(monthlyInsulinStorageKey) || '{}');
  } catch {
    return {};
  }
}

function updateMonthlyTotals() {
  const monthlyInsulin = getMonthlyInsulin();
  document.querySelector('#previous-month-insulin').textContent = format(number(monthlyInsulin[getMonthKey(-1)]), 'un.');
  document.querySelector('#current-month-insulin').textContent = format(number(monthlyInsulin[getMonthKey()]), 'un.');
}

function getCorrectionDose() {
  const correctionFactor = number(document.querySelector('#correction-factor').value);
  const currentInput = document.querySelector('#current-glucose');
  const targetInput = document.querySelector('#target-glucose');
  const difference = number(currentInput.value) - number(targetInput.value);
  const canCalculate = currentInput.value && targetInput.value && correctionFactor > 0;
  return { difference, canCalculate, dose: canCalculate && difference > 0 ? difference / correctionFactor : 0 };
}

function updateTotals() {
  const currentInput = document.querySelector('#current-glucose');
  const targetInput = document.querySelector('#target-glucose');
  const correction = getCorrectionDose();
  document.querySelector('#glucose-difference').textContent = currentInput.value && targetInput.value ? `${correction.difference > 0 ? '+' : ''}${format(correction.difference, 'mg/dL')}` : '—';
  document.querySelector('#correction-dose').textContent = correction.canCalculate ? format(correction.dose, 'un.') : '—';
}

function saveParameters() {
  const parameters = [
    { input: document.querySelector('#target-glucose'), storageKey: 'diabetes-dashboard-target' },
    { input: document.querySelector('#correction-factor'), storageKey: 'diabetes-dashboard-correction-factor' },
  ];
  const status = document.querySelector('#target-save-status');
  const invalid = parameters.find(({ input }) => input.value && !input.validity.valid);
  if (invalid) {
    status.textContent = 'Informe valores válidos para gravar.';
    invalid.input.focus();
    return;
  }
  const entered = parameters.filter(({ input }) => input.value);
  if (!entered.length) {
    status.textContent = 'Informe o alvo ou o valor de correção para gravar.';
    parameters[0].input.focus();
    return;
  }
  entered.forEach(({ input, storageKey }) => localStorage.setItem(storageKey, input.value));
  const appliedDose = getCorrectionDose().dose;
  if (appliedDose > 0) {
    const monthlyInsulin = getMonthlyInsulin();
    const currentMonth = getMonthKey();
    monthlyInsulin[currentMonth] = number(monthlyInsulin[currentMonth]) + appliedDose;
    localStorage.setItem(monthlyInsulinStorageKey, JSON.stringify(monthlyInsulin));
    updateMonthlyTotals();
    status.textContent = 'Aplicação gravada no total deste mês.';
    return;
  }
  status.textContent = 'Parâmetros salvos; nenhuma aplicação foi adicionada ao mês.';
}

function saveCarbs() {
  const invalid = mealCarbs.find((input) => input.value && !input.validity.valid);
  const status = document.querySelector('#meal-save-status');
  if (invalid) {
    status.textContent = 'Informe valores válidos para gravar.';
    invalid.focus();
    return;
  }
  const carbs = {};
  mealCards.forEach((card) => { carbs[card.dataset.meal] = card.querySelector('.meal-carbs').value; });
  localStorage.setItem('diabetes-dashboard-meal-carbs', JSON.stringify(carbs));
  status.textContent = 'Carboidratos salvos neste navegador.';
}

fields.forEach((field) => field.addEventListener('input', updateTotals));
document.querySelector('#save-parameters').addEventListener('click', saveParameters);
document.querySelector('#save-carbs').addEventListener('click', saveCarbs);
updateTotals();
updateMonthlyTotals();
