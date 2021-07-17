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

const numberButtons = document.querySelectorAll("[data-type='number']");
numberButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const tokenType = event.target.getAttribute("data-type");
    const tokenValue = +event.target.textContent;
    createToken(tokenType, tokenValue);
  });
});

const operatorButtons = document.querySelectorAll("[data-type='operator']");
operatorButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const tokenType = event.target.getAttribute("data-type");
    const tokenValue = event.target.getAttribute("data-value");
    createToken(tokenType, tokenValue);
  });
});

const tokenArray = [];

function createToken(tokenType, tokenValue) {
  let token;
  switch (tokenType) {
    case "operator":
      token = operators[tokenValue];
      break;

    default:
      token = {
        type: tokenType,
        value: tokenValue,
      };
      break;
  }
  tokenArray.push(token);
}

function deleteToken() {}

function parseTokenArray(array) {}

function evaluateParsedArray(array) {}
