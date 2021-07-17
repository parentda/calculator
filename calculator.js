const Calculator = {
  bottomDisplayText: "",
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

const tokenArray = [];

const displayTop = document.querySelector("#display-top");
const displayBottom = document.querySelector("#display-bottom");

const numberButtons = document.querySelectorAll("[data-type='number']");
const operatorButtons = document.querySelectorAll("[data-type='operator']");
const parenthesisButtons = document.querySelectorAll(
  "[data-type='parenthesis']"
);

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
    updateBottomDisplay(buttonValue);
  });
});

operatorButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    let buttonValue;
    if (event.target.localName === "sup") {
      buttonValue = event.target.parentElement.getAttribute("data-value");
    } else {
      buttonValue = event.target.getAttribute("data-value");
    }
    createToken("operator", buttonValue);
    updateBottomDisplay(buttonValue);
  });
});

parenthesisButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const buttonValue = event.target.textContent;
    createToken("parenthesis", buttonValue);
    updateBottomDisplay(buttonValue);
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

function parseTokenArray(array) {
  const outputQueue = [];
  const operatorStack = [];
  while (array.length) {
    const currrentToken = array;
  }
}

function evaluateParsedArray(array) {}

function updateBottomDisplay(character) {
  Calculator.bottomDisplayText += `${character}`;
  displayBottom.textContent = Calculator.bottomDisplayText;
}
