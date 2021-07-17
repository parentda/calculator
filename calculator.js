const Calculator = {
  displayText: "",
  operators: {
    "-": {
      value: "-",
      notation: "infix",
      precedence: 10,
      associativity: "left",
      compute: (num1, num2) => num1 - num2,
    },

    "+": {
      value: "+",
      notation: "infix",
      precedence: 10,
      associativity: "left",
      compute: (num1, num2) => num1 + num2,
    },

    "*": {
      value: "*",
      notation: "infix",
      precedence: 20,
      associativity: "left",
      compute: (num1, num2) => num1 * num2,
    },

    "/": {
      value: "/",
      notation: "infix",
      precedence: 20,
      associativity: "left",
      compute: (num1, num2) => num1 / num2,
    },

    "u-": {
      value: "u-",
      notation: "prefix",
      precedence: 30,
      associativity: "left",
      compute: (num) => -num,
    },

    "^": {
      value: "^",
      notation: "infix",
      precedence: 40,
      associativity: "right",
      compute: (num1, num2) => num1 ** num2,
    },

    root: {
      value: "root",
      notation: "infix",
      precedence: 40,
      associativity: "right",
      compute: (num1, num2) => num1 ** (1 / num2),
    },
  },
};

const displayTop = document.querySelector("#display-top");
const displayBottom = document.querySelector("#display-bottom");

const tokenArray = [];

const numberButtons = document.querySelectorAll("[data-type='number']");
numberButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const buttonValue = event.target.textContent;
    if (
      tokenArray.length &&
      tokenArray[tokenArray.length - 1].type === "number"
    ) {
      tokenArray[tokenArray.length - 1].value += buttonValue;
    } else {
      createToken("number", buttonValue);
    }
    updateDisplay(buttonValue);
  });
});

const operatorButtons = document.querySelectorAll("[data-type='operator']");
operatorButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const buttonValue = event.target.getAttribute("data-value");
    createToken("operator", buttonValue);
    updateDisplay(buttonValue);
  });
});

const parenthesisButtons = document.querySelectorAll(
  "[data-type='parenthesis']"
);
parenthesisButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const buttonValue = event.target.textContent;
    createToken("parenthesis", buttonValue);
    updateDisplay(buttonValue);
  });
});

function createToken(tokenType, tokenValue) {
  let token;
  switch (tokenType) {
    case "operator":
      token = Calculator.operators[tokenValue];
      token.type = "operator";
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

function updateDisplay(character) {
  Calculator.displayText += `${character}`;
  displayBottom.textContent = Calculator.displayText;
}
