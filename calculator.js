function add(num1, num2) {
  return num1 + num2;
}

function subtract(num1, num2) {
  return num1 - num2;
}

function multiply(num1, num2) {
  return num1 * num2;
}

function divide(num1, num2) {
  return num1 / num2;
}

function power(num1, num2) {
  return num1 ** num2;
}

function root(num1, num2) {
  return num1 ** (1 / num2);
}

function negate(num) {
  return -num;
}

const operators = {
  "-": {
    type: "operator",
    value: "-",
    notation: "infix",
    precedence: 10,
    associativity: "left",
    compute: (num1, num2) => num1 - num2,
  },

  "+": {
    type: "operator",
    value: "+",
    notation: "infix",
    precedence: 10,
    associativity: "left",
    compute: (num1, num2) => num1 + num2,
  },

  "*": {
    type: "operator",
    value: "*",
    notation: "infix",
    precedence: 20,
    associativity: "left",
    compute: (num1, num2) => num1 * num2,
  },

  "/": {
    type: "operator",
    value: "/",
    notation: "infix",
    precedence: 20,
    associativity: "left",
    compute: (num1, num2) => num1 / num2,
  },

  "u-": {
    type: "operator",
    value: "u-",
    notation: "prefix",
    precedence: 30,
    associativity: "left",
    compute: (num) => -num,
  },

  "^": {
    type: "operator",
    value: "^",
    notation: "infix",
    precedence: 40,
    associativity: "right",
    compute: (num1, num2) => num1 ** num2,
  },

  root: {
    type: "operator",
    value: "root",
    notation: "infix",
    precedence: 40,
    associativity: "right",
    compute: (num1, num2) => num1 ** (1 / num2),
  },
};

const tokenArray = [];

function createToken(type, value) {}

function parseTokenArray(array) {}

function evaluateParsedArray(array) {}
