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
