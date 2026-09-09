const fields = [...document.querySelectorAll('input')];
const mealInsulin = [...document.querySelectorAll('.meal-insulin')];
const mealCarbs = [...document.querySelectorAll('.meal-carbs')];
const savedTarget = localStorage.getItem('diabetes-dashboard-target');
const savedCorrectionFactor = localStorage.getItem('diabetes-dashboard-correction-factor')
  || localStorage.getItem('diabetes-dashboard-correction-insulin');

if (savedTarget !== null) document.querySelector('#target-glucose').value = savedTarget;
if (savedCorrectionFactor !== null) document.querySelector('#correction-factor').value = savedCorrectionFactor;

const number = (value) => Number.parseFloat(value) || 0;
const format = (value, suffix) => `${Number(value.toFixed(1)).toLocaleString('pt-BR')} ${suffix}`;
function updateTotals() {
  const carbs = mealCarbs.reduce((sum, input) => sum + number(input.value), 0);
  const mealDose = mealInsulin.reduce((sum, input) => sum + number(input.value), 0);
  const correctionFactor = number(document.querySelector('#correction-factor').value);
  const currentInput = document.querySelector('#current-glucose');
  const targetInput = document.querySelector('#target-glucose');
  const current = number(currentInput.value);
  const target = number(targetInput.value);
  const difference = current - target;
  const canCalculateCorrection = currentInput.value && targetInput.value && correctionFactor > 0;
  const correctionDose = canCalculateCorrection && difference > 0 ? difference / correctionFactor : 0;
  document.querySelector('#total-carbs').textContent = format(carbs, 'g');
  document.querySelector('#total-meal-insulin').textContent = format(mealDose, 'un.');
  document.querySelector('#total-insulin').textContent = format(mealDose + correctionDose, 'un.');
  document.querySelector('#glucose-difference').textContent = currentInput.value && targetInput.value ? `${difference > 0 ? '+' : ''}${format(difference, 'mg/dL')}` : '—';
  document.querySelector('#correction-dose').textContent = canCalculateCorrection ? format(correctionDose, 'un.') : '—';
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
  status.textContent = 'Parâmetros salvos neste navegador.';
}
fields.forEach((field) => field.addEventListener('input', updateTotals));
document.querySelector('#save-parameters').addEventListener('click', saveParameters);
updateTotals();
