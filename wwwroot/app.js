const expressionElement = document.querySelector('#expression');
const resultElement = document.querySelector('#result');
const historyList = document.querySelector('#history-list');
const history = [];
let expression = '';

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(10)));
}

function tokenize(value) {
  const tokens = value.replace(/\s/g, '').match(/\d*\.?\d+|[()+\-*/%^]/g);
  if (!tokens || tokens.join('') !== value.replace(/\s/g, '')) {
    throw new Error('Invalid expression');
  }
  return tokens;
}

function calculate(value) {
  const tokens = tokenize(value);
  let position = 0;

  function primary() {
    if (tokens[position] === '(') {
      position++;
      const value = addition();
      if (tokens[position++] !== ')') throw new Error('Missing parenthesis');
      return value;
    }
    const number = Number(tokens[position++]);
    if (Number.isNaN(number)) throw new Error('Expected a number');
    return number;
  }

  function power() {
    let value = primary();
    if (tokens[position] === '^') {
      position++;
      value = value ** power();
    }
    return value;
  }

  function multiplication() {
    let value = power();
    while (tokens[position] === '*' || tokens[position] === '/' || tokens[position] === '%') {
      const operator = tokens[position++];
      const next = power();
      if (operator === '/' && next === 0) throw new Error('Cannot divide by zero');
      value = operator === '*' ? value * next : operator === '/' ? value / next : value % next;
    }
    return value;
  }

  function addition() {
    let value = multiplication();
    while (tokens[position] === '+' || tokens[position] === '-') {
      const operator = tokens[position++];
      const next = multiplication();
      value = operator === '+' ? value + next : value - next;
    }
    return value;
  }

  const result = addition();
  if (position !== tokens.length || !Number.isFinite(result)) throw new Error('Invalid expression');
  return result;
}

function render() {
  expressionElement.textContent = expression || '0';
  resultElement.textContent = expression ? '...' : '0';
}

function addHistory(input, result) {
  history.unshift({ input, result });
  historyList.innerHTML = history.slice(0, 6).map(item => `
    <button class="history-item" type="button" data-expression="${item.input}">
      <span class="history-expression">${item.input}</span>
      <span class="history-result">= ${item.result}</span>
    </button>`).join('');
}

function evaluate() {
  if (!expression) return;
  try {
    const result = formatNumber(calculate(expression));
    resultElement.textContent = result;
    addHistory(expression, result);
    expression = result;
  } catch (error) {
    resultElement.textContent = error.message;
  }
}

function append(value) {
  if (expression === '0' && /\d/.test(value)) expression = '';
  expression += value;
  render();
}

function applyFunction(name) {
  if (!expression && name === 'constant-pi') { expression = String(Math.PI); render(); return; }
  if (!expression && name === 'constant-e') { expression = String(Math.E); render(); return; }
  if (!expression) return;
  try {
    const input = calculate(expression);
    let result;
    switch (name) {
      case 'sin': result = Math.sin(input * Math.PI / 180); break;
      case 'cos': result = Math.cos(input * Math.PI / 180); break;
      case 'tan': result = Math.tan(input * Math.PI / 180); break;
      case 'sqrt': result = Math.sqrt(input); break;
      case 'log': result = Math.log10(input); break;
      case 'ln': result = Math.log(input); break;
      case 'square': result = input ** 2; break;
      case 'reciprocal':
        if (input === 0) throw new Error('Cannot divide by zero');
        result = 1 / input;
        break;
      case 'percent': result = input / 100; break;
      case 'sign': result = -input; break;
      case 'factorial':
        if (input < 0 || !Number.isInteger(input) || input > 170) throw new Error('Use a whole number from 0 to 170');
        result = Array.from({ length: input }, (_, index) => index + 1).reduce((total, number) => total * number, 1);
        break;
      case 'constant-pi': result = Math.PI; break;
      case 'constant-e': result = Math.E; break;
      default: return;
    }
    if (!Number.isFinite(result)) throw new Error('Invalid result');
    const formatted = formatNumber(result);
    addHistory(`${name}(${formatNumber(input)})`, formatted);
    expression = formatted;
    render();
  } catch (error) {
    resultElement.textContent = error.message;
  }
}

document.querySelector('#keypad').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.action === 'clear') { expression = ''; render(); return; }
  if (button.dataset.action === 'delete') { expression = expression.slice(0, -1); render(); return; }
  if (button.dataset.action === 'equals') { evaluate(); return; }
  if (button.dataset.function) { applyFunction(button.dataset.function); return; }
  append(button.dataset.value);
});

historyList.addEventListener('click', event => {
  const button = event.target.closest('[data-expression]');
  if (button) { expression = button.dataset.expression; render(); }
});

document.querySelector('#clear-history').addEventListener('click', () => {
  history.length = 0;
  historyList.innerHTML = '<p class="empty-history">Your calculations will appear here.</p>';
});

document.addEventListener('keydown', event => {
  if (/^[0-9.]$/.test(event.key) || ['+', '-', '*', '/', '%', '^', '(', ')'].includes(event.key)) append(event.key);
  else if (event.key === 'Enter' || event.key === '=') evaluate();
  else if (event.key === 'Backspace') { expression = expression.slice(0, -1); render(); }
  else if (event.key === 'Escape') { expression = ''; render(); }
});

render();