const displayElement = document.querySelector("#display");
const expressionElement = document.querySelector("#expression");
const calculatorKeys = document.querySelector(".keypad");

const operatorSymbols = {
  add: "+",
  subtract: "\u2212",
  multiply: "\u00d7",
  divide: "\u00f7"
};

let currentValue = "0";
let storedValue = null;
let selectedOperator = null;
let waitingForValue = false;
let justCalculated = false;

function updateDisplay() {
  displayElement.textContent = currentValue;
  expressionElement.textContent = selectedOperator && storedValue !== null
    ? `${formatNumber(storedValue)} ${operatorSymbols[selectedOperator]}`
    : "\u00a0";
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "Error";
  return number.toLocaleString("en-US", { maximumFractionDigits: 10, useGrouping: false });
}

function resetCalculator() {
  currentValue = "0";
  storedValue = null;
  selectedOperator = null;
  waitingForValue = false;
  justCalculated = false;
  updateDisplay();
}

function showError() {
  currentValue = "Error";
  storedValue = null;
  selectedOperator = null;
  waitingForValue = true;
  justCalculated = true;
  updateDisplay();
}

function inputNumber(number) {
  if (currentValue === "Error" || waitingForValue || justCalculated) {
    currentValue = number;
    waitingForValue = false;
    justCalculated = false;
  } else if (currentValue === "0") {
    currentValue = number;
  } else if (currentValue.length < 16) {
    currentValue += number;
  }
  updateDisplay();
}

function inputDecimal() {
  if (currentValue === "Error" || waitingForValue || justCalculated) {
    currentValue = "0.";
    waitingForValue = false;
    justCalculated = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }
  updateDisplay();
}

function calculate(left, operator, right) {
  const firstNumber = Number(left);
  const secondNumber = Number(right);
  let result;

  if (!Number.isFinite(firstNumber) || !Number.isFinite(secondNumber)) return null;

  switch (operator) {
    case "add":
      result = firstNumber + secondNumber;
      break;
    case "subtract":
      result = firstNumber - secondNumber;
      break;
    case "multiply":
      result = firstNumber * secondNumber;
      break;
    case "divide":
      if (secondNumber === 0) return null;
      result = firstNumber / secondNumber;
      break;
    default:
      return null;
  }

  return Number.isFinite(result) ? formatNumber(result) : null;
}

function chooseOperator(operator) {
  if (currentValue === "Error") return;

  if (selectedOperator && waitingForValue) {
    selectedOperator = operator;
    updateDisplay();
    return;
  }

  if (selectedOperator && storedValue !== null) {
    const result = calculate(storedValue, selectedOperator, currentValue);
    if (result === null) {
      showError();
      return;
    }
    currentValue = result;
  }

  storedValue = currentValue;
  selectedOperator = operator;
  waitingForValue = true;
  justCalculated = false;
  updateDisplay();
}

function performCalculation() {
  if (!selectedOperator || storedValue === null || currentValue === "Error") return;

  const left = storedValue;
  const operator = selectedOperator;
  const right = waitingForValue ? storedValue : currentValue;
  const result = calculate(left, operator, right);

  if (result === null) {
    showError();
    return;
  }

  expressionElement.textContent = `${formatNumber(left)} ${operatorSymbols[operator]} ${formatNumber(right)} =`;
  currentValue = result;
  storedValue = null;
  selectedOperator = null;
  waitingForValue = false;
  justCalculated = true;
  displayElement.textContent = currentValue;
}

function deleteLast() {
  if (currentValue === "Error" || waitingForValue || justCalculated) return;
  currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
  if (currentValue === "-") currentValue = "0";
  updateDisplay();
}

function toggleSign() {
  if (currentValue === "Error" || waitingForValue) return;
  currentValue = currentValue.startsWith("-") ? currentValue.slice(1) : `-${currentValue}`;
  if (currentValue === "-0") currentValue = "0";
  updateDisplay();
}

function applyPercent() {
  if (currentValue === "Error" || waitingForValue) return;
  const percentage = Number(currentValue) / 100;
  currentValue = Number.isFinite(percentage) ? formatNumber(percentage) : "0";
  updateDisplay();
}

function handleAction(action) {
  switch (action) {
    case "clear":
      resetCalculator();
      break;
    case "delete":
      deleteLast();
      break;
    case "decimal":
      inputDecimal();
      break;
    case "equals":
      performCalculation();
      break;
    case "toggle-sign":
      toggleSign();
      break;
    case "percent":
      applyPercent();
      break;
  }
}

calculatorKeys.addEventListener("click", (event) => {
  const key = event.target.closest("button");
  if (!key) return;

  if (key.dataset.number !== undefined) inputNumber(key.dataset.number);
  if (key.dataset.operator) chooseOperator(key.dataset.operator);
  if (key.dataset.action) handleAction(key.dataset.action);
});

document.addEventListener("keydown", (event) => {
  const { key } = event;
  if (/^[0-9]$/.test(key)) inputNumber(key);
  else if (key === ".") inputDecimal();
  else if (key === "+") chooseOperator("add");
  else if (key === "-") chooseOperator("subtract");
  else if (key === "*") chooseOperator("multiply");
  else if (key === "/") chooseOperator("divide");
  else if (key === "Enter" || key === "=") handleAction("equals");
  else if (key === "Escape") handleAction("clear");
  else if (key === "Backspace") handleAction("delete");
  else if (key === "%") handleAction("percent");
  else return;

  event.preventDefault();
});

updateDisplay();
