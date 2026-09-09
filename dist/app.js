const fields = [...document.querySelectorAll('input')];
const mealInsulin = [...document.querySelectorAll('.meal-insulin')];
const mealCarbs = [...document.querySelectorAll('.meal-carbs')];
const savedTarget = localStorage.getItem('diabetes-dashboard-target');
const savedCorrection = localStorage.getItem('diabetes-dashboard-correction-insulin');

if (savedTarget !== null) document.querySelector('#target-glucose').value = savedTarget;
if (savedCorrection !== null) document.querySelector('#correction-insulin').value = savedCorrection;

const number = (value) => Number.parseFloat(value) || 0;
const format = (value, suffix) => `${Number(value.toFixed(1)).toLocaleString('pt-BR')} ${suffix}`;
function updateTotals() {
  const carbs = mealCarbs.reduce((sum, input) => sum + number(input.value), 0);
  const mealDose = mealInsulin.reduce((sum, input) => sum + number(input.value), 0);
  const correction = number(document.querySelector('#correction-insulin').value);
  const current = number(document.querySelector('#current-glucose').value);
  const target = number(document.querySelector('#target-glucose').value);
  document.querySelector('#total-carbs').textContent = format(carbs, 'g');
  document.querySelector('#total-meal-insulin').textContent = format(mealDose, 'un.');
  document.querySelector('#total-insulin').textContent = format(mealDose + correction, 'un.');
  document.querySelector('#glucose-difference').textContent = current && target ? `${current - target > 0 ? '+' : ''}${format(current - target, 'mg/dL')}` : '—';
}
function saveParameters() {
  const parameters = [
    { input: document.querySelector('#target-glucose'), storageKey: 'diabetes-dashboard-target' },
    { input: document.querySelector('#correction-insulin'), storageKey: 'diabetes-dashboard-correction-insulin' },
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
    status.textContent = 'Informe o alvo ou a insulina de correção para gravar.';
    parameters[0].input.focus();
    return;
  }
  entered.forEach(({ input, storageKey }) => localStorage.setItem(storageKey, input.value));
  status.textContent = 'Parâmetros salvos neste navegador.';
}
fields.forEach((field) => field.addEventListener('input', updateTotals));
document.querySelector('#save-parameters').addEventListener('click', saveParameters);
updateTotals();
