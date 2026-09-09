const fields = [...document.querySelectorAll('input')];
const mealInsulin = [...document.querySelectorAll('.meal-insulin')];
const mealCarbs = [...document.querySelectorAll('.meal-carbs')];
const savedTarget = localStorage.getItem('diabetes-dashboard-target');

if (savedTarget !== null) document.querySelector('#target-glucose').value = savedTarget;

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
function saveTarget() {
  const target = document.querySelector('#target-glucose');
  const status = document.querySelector('#target-save-status');
  if (!target.value || !target.validity.valid) {
    status.textContent = 'Informe um alvo válido para gravar.';
    target.focus();
    return;
  }
  localStorage.setItem('diabetes-dashboard-target', target.value);
  status.textContent = 'Alvo salvo neste navegador.';
}
fields.forEach((field) => field.addEventListener('input', updateTotals));
document.querySelector('#save-target').addEventListener('click', saveTarget);
updateTotals();
