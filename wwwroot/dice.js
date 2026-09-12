const countInput = document.querySelector('#dice-count');
const sidesInput = document.querySelector('#dice-sides');
const modifierInput = document.querySelector('#roll-modifier');
const formulaElement = document.querySelector('#formula');
const totalElement = document.querySelector('#total-result');
const resultLabel = document.querySelector('#result-label');
const breakdownElement = document.querySelector('#roll-breakdown');
const historyElement = document.querySelector('#roll-history');
const rolls = [];
const combatants = [];

function clampInput(input) {
  const minimum = Number(input.min);
  const maximum = Number(input.max);
  input.value = Math.min(maximum, Math.max(minimum, Number(input.value) || 0));
  updateFormula();
}

function updateFormula() {
  const count = Number(countInput.value) || 1;
  const sides = Number(sidesInput.value);
  const modifier = Number(modifierInput.value) || 0;
  formulaElement.textContent = `${count}d${sides}${modifier > 0 ? `+${modifier}` : modifier || ''}`;
}

function renderHistory() {
  if (!rolls.length) {
    historyElement.innerHTML = '<p class="empty-history">Your rolls will appear here.</p>';
    return;
  }
  historyElement.innerHTML = rolls.slice(0, 8).map(roll => `
    <div class="roll-entry">
      <span class="roll-entry-formula">${roll.formula}</span>
      <strong class="roll-entry-total ${roll.highlight}">${roll.total}</strong>
    </div>`).join('');
}

function rollDice(count, sides, modifier, formula) {
  const values = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
  const subtotal = values.reduce((sum, value) => sum + value, 0);
  const total = subtotal + modifier;
  const highlight = count === 1 && sides === 20 && values[0] === 20 ? 'critical' : count === 1 && sides === 20 && values[0] === 1 ? 'fumble' : '';
  const highlightText = highlight === 'critical' ? 'Natural 20!' : highlight === 'fumble' ? 'Natural 1' : '';

  totalElement.textContent = total;
  resultLabel.textContent = highlightText || 'Roll complete';
  breakdownElement.textContent = `${values.join(' + ')}${modifier ? ` ${modifier > 0 ? '+' : '−'} ${Math.abs(modifier)}` : ''} = ${total}`;
  rolls.unshift({ formula, total, highlight });
  renderHistory();
}

function rollCurrent() {
  const count = Math.min(99, Math.max(1, Number(countInput.value) || 1));
  const sides = Number(sidesInput.value);
  const modifier = Math.min(99, Math.max(-99, Number(modifierInput.value) || 0));
  countInput.value = count;
  modifierInput.value = modifier;
  rollDice(count, sides, modifier, formulaElement.textContent);
}

document.querySelector('#roll-button').addEventListener('click', rollCurrent);
document.querySelectorAll('[data-step]').forEach(button => {
  button.addEventListener('click', () => {
    const input = button.dataset.step === 'count' ? countInput : modifierInput;
    input.value = Number(input.value) + Number(button.dataset.change);
    clampInput(input);
  });
});

document.querySelectorAll('input, select').forEach(input => input.addEventListener('input', () => {
  if (input.type === 'number') clampInput(input);
  else updateFormula();
}));

document.querySelectorAll('[data-quick]').forEach(button => {
  button.addEventListener('click', () => {
    const match = button.dataset.quick.match(/(\d+)d(\d+)([+-]\d+)?/);
    countInput.value = match[1];
    sidesInput.value = match[2];
    modifierInput.value = match[3] || 0;
    updateFormula();
    rollCurrent();
  });
});

document.querySelector('#clear-rolls').addEventListener('click', () => {
  rolls.length = 0;
  renderHistory();
});

document.addEventListener('keydown', event => {
  if (event.target.closest('#initiative-form')) return;
  if (event.key === 'Enter') rollCurrent();
});

function modifierFor(score) {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : modifier;
}

function rollAbilityScore() {
  const values = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a);
  return { score: values.slice(0, 3).reduce((sum, value) => sum + value, 0), dice: values };
}

function renderAbilities() {
  const abilityGrid = document.querySelector('#ability-grid');
  abilityGrid.innerHTML = window.abilityScores?.length
    ? window.abilityScores.map((entry, index) => `
      <div class="ability-card">
        <span class="ability-index">${index + 1}</span>
        <strong>${entry.score}</strong>
        <span class="ability-mod">${modifierFor(entry.score)}</span>
        <small>${entry.dice.join(' · ')}</small>
      </div>`).join('')
    : '<div class="ability-empty">Your six scores are waiting.</div>';
}

document.querySelector('#roll-abilities').addEventListener('click', () => {
  window.abilityScores = Array.from({ length: 6 }, rollAbilityScore);
  renderAbilities();
});

function renderInitiative() {
  const list = document.querySelector('#initiative-list');
  if (!combatants.length) {
    list.innerHTML = '<p class="empty-history">Add creatures or heroes to begin.</p>';
    return;
  }
  list.innerHTML = combatants.map((combatant, index) => `
    <div class="initiative-row ${index === 0 ? 'current-turn' : ''}">
      <span class="turn-number">${index + 1}</span>
      <span class="combatant-name">${combatant.name}</span>
      <strong>${combatant.score}</strong>
      <button type="button" data-remove="${combatant.id}" aria-label="Remove ${combatant.name}">×</button>
    </div>`).join('');
}

document.querySelector('#initiative-form').addEventListener('submit', event => {
  event.preventDefault();
  const nameInput = document.querySelector('#combatant-name');
  const scoreInput = document.querySelector('#initiative-score');
  combatants.push({ id: crypto.randomUUID(), name: nameInput.value.trim(), score: Number(scoreInput.value) });
  combatants.sort((a, b) => b.score - a.score);
  nameInput.value = '';
  scoreInput.value = '';
  renderInitiative();
  nameInput.focus();
});

document.querySelector('#initiative-list').addEventListener('click', event => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  const index = combatants.findIndex(combatant => combatant.id === button.dataset.remove);
  if (index >= 0) combatants.splice(index, 1);
  renderInitiative();
});

document.querySelector('#next-turn').addEventListener('click', () => {
  if (combatants.length > 1) combatants.push(combatants.shift());
  renderInitiative();
});

document.querySelector('#clear-initiative').addEventListener('click', () => {
  combatants.length = 0;
  renderInitiative();
});

updateFormula();
renderAbilities();