const fields = [...document.querySelectorAll('input:not([type="search"])')];
const mealCards = [...document.querySelectorAll('.meal-card')];
const mealCarbs = [...document.querySelectorAll('.meal-carbs')];
const savedTarget = localStorage.getItem('diabetes-dashboard-target');
const savedCorrectionFactor = localStorage.getItem('diabetes-dashboard-correction-factor')
  || localStorage.getItem('diabetes-dashboard-correction-insulin');
const themeToggle = document.querySelector('#theme-toggle');
const foodSearchInput = document.querySelector('#food-search-input');
const foodSearchResults = document.querySelector('#food-search-results');
const foodSearchStatus = document.querySelector('#food-search-status');

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

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatFoodNumber(value, suffix) {
  return value === null || value === undefined ? '—' : `${Number(value).toLocaleString('pt-BR')} ${suffix}`;
}

function renderFoodResults(foods, query) {
  foodSearchResults.replaceChildren();
  foodSearchInput.setAttribute('aria-expanded', String(foods.length > 0));
  if (!query) {
    foodSearchStatus.textContent = 'Digite ao menos um caractere para pesquisar.';
    return;
  }
  if (!foods.length) {
    foodSearchStatus.textContent = 'Nenhum alimento encontrado.';
    return;
  }
  foodSearchStatus.textContent = `${foods.length} resultado${foods.length > 1 ? 's' : ''} encontrado${foods.length > 1 ? 's' : ''}.`;
  foods.forEach((food) => {
    const item = document.createElement('li');
    const name = document.createElement('strong');
    const measure = document.createElement('span');
    const nutrition = document.createElement('span');
    item.className = 'food-search-result';
    item.setAttribute('role', 'option');
    name.textContent = food.alimento;
    measure.textContent = `${food.medida_usual || 'Medida não informada'} · ${formatFoodNumber(food.quantidade_valor, food.quantidade_unidade === 'g' ? 'g' : 'g/ml')}`;
    nutrition.textContent = `${formatFoodNumber(food.carboidratos_g, 'CHO')} · ${formatFoodNumber(food.calorias_kcal, 'kcal')}`;
    item.append(name, measure, nutrition);
    foodSearchResults.append(item);
  });
}

async function loadFoodSearch() {
  try {
    const response = await fetch('Tabela_Alimentos_Codex.json');
    if (!response.ok) throw new Error('Falha ao carregar a tabela.');
    const data = await response.json();
    const foodIndex = data.alimentos.map((food) => ({
      ...food,
      alimentoBusca: normalizeSearchText([food.alimento, food.medida_usual, food.categoria].filter(Boolean).join(' ')),
    }));
    foodSearchInput.disabled = false;
    foodSearchStatus.textContent = `${foodIndex.length.toLocaleString('pt-BR')} alimentos disponíveis para pesquisa.`;
    let searchTimer;
    foodSearchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        const query = normalizeSearchText(foodSearchInput.value);
        const terms = query.split(' ').filter(Boolean);
        const results = terms.length ? foodIndex.filter((food) => terms.every((term) => food.alimentoBusca.includes(term))).slice(0, 12) : [];
        renderFoodResults(results, query);
      }, 150);
    });
  } catch {
    foodSearchStatus.textContent = 'Não foi possível carregar a tabela de alimentos.';
  }
}

fields.forEach((field) => field.addEventListener('input', updateTotals));
document.querySelector('#save-parameters').addEventListener('click', saveParameters);
document.querySelector('#save-carbs').addEventListener('click', saveCarbs);
updateTotals();
updateMonthlyTotals();
loadFoodSearch();
