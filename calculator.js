const Calculator = {
  topDisplayText: "",
  bottomDisplayText: "",
  tokenArray: [],
  ANS: undefined,
  openParentheses: 0,
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
      value: "-",
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

const numberButtons = document.querySelectorAll("[data-type='number']");
const decimalButton = document.querySelector("[data-type='decimal']");
const operatorButtons = document.querySelectorAll("[data-type='operator']");
const parenthesisButtons = document.querySelectorAll(
  "[data-type='parenthesis']"
);
const evaluateButton = document.querySelector("[data-type='evaluate']");
const resetButton = document.querySelector("[data-type='reset']");
const answerButton = document.querySelector("[data-type='answer']");

numberButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const buttonValue = event.target.textContent;
    const lastToken = Calculator.tokenArray[Calculator.tokenArray.length - 1];
    if (Calculator.tokenArray.length && lastToken.type === "number") {
      lastToken.value += buttonValue;
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
    const lastToken = Calculator.tokenArray[Calculator.tokenArray.length - 1];
    if (buttonValue === "(") {
      Calculator.openParentheses += 1;
      createToken("parenthesis", buttonValue);
      updateBottomDisplay(buttonValue);
    } else if (
      buttonValue === ")" &&
      Calculator.openParentheses > 0 &&
      lastToken.value !== "("
    ) {
      Calculator.openParentheses -= 1;
      createToken("parenthesis", buttonValue);
      updateBottomDisplay(buttonValue);
    }
  });
});

evaluateButton.addEventListener("click", () => {
  while (Calculator.openParentheses > 0) {
    createToken("parenthesis", ")");
    Calculator.openParentheses -= 1;
  }
  const parsedArray = parseTokenArray(Calculator.tokenArray);
  Calculator.ANS = evaluateParsedArray(parsedArray);
  updateTopDisplay(Calculator.ANS);
  Calculator.tokenArray = [];
  Calculator.bottomDisplayText = "";
  displayBottom.textContent = Calculator.bottomDisplayText;
});

resetButton.addEventListener("click", reset);

decimalButton.addEventListener("click", (event) => {
  const buttonValue = event.target.textContent;
  const lastToken = Calculator.tokenArray[Calculator.tokenArray.length - 1];
  if (
    Calculator.tokenArray.length &&
    lastToken.type === "number" &&
    !lastToken.value.includes(".")
  ) {
    lastToken.value += buttonValue;
    updateBottomDisplay(buttonValue);
  } else if (
    Calculator.tokenArray.length &&
    lastToken.type === "number" &&
    lastToken.value.includes(".")
  ) {
    // do nothing
  } else {
    createToken("number", buttonValue);
    updateBottomDisplay(buttonValue);
  }
});

answerButton.addEventListener("click", () => {
  if (Calculator.ANS) {
    createToken("number", Calculator.ANS);
    updateBottomDisplay("ANS");
  }
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
  Calculator.tokenArray.push(token);
}

function deleteToken() {}

function shuntingYardAlgorithm(token, index, outQueue, opStack) {
  if (token.type === "number") {
    outQueue.push(token);
  } else if (token.type === "operator") {
    let topOp = opStack[opStack.length - 1];
    while (
      topOp &&
      topOp.value !== "(" &&
      ((token.associativity === "left" &&
        token.precedence <= topOp.precedence) ||
        (token.associativity === "right" &&
          token.precedence < topOp.precedence))
    ) {
      outQueue.push(opStack.pop());
      topOp = opStack[opStack.length - 1];
    }
    opStack.push(token);
  } else if (token.type === "parenthesis") {
    if (token.value === "(") {
      opStack.push(token);
    } else if (token.value === ")") {
      let topOp = opStack[opStack.length - 1];
      while (topOp && topOp.value !== "(") {
        outQueue.push(opStack.pop());
        topOp = opStack[opStack.length - 1];
      }
      if (topOp.value === "(") {
        opStack.pop(token);
      }
    }
  }
}

function parseTokenArray(array) {
  const outputQueue = [];
  const operatorStack = [];
  array.forEach((token, index) => {
    shuntingYardAlgorithm(token, index, outputQueue, operatorStack);
  });
  while (operatorStack.length) {
    outputQueue.push(operatorStack.pop());
  }
  return outputQueue;
}

function evaluateParsedArray(array) {
  let currentIndex = 0;

  while (array.length > 1) {
    let token = array[currentIndex];
    if (token.type === "operator") {
      if (token.notation === "infix") {
        array[currentIndex - 2].value = token.compute(
          +array[currentIndex - 2].value,
          +array[currentIndex - 1].value
        );
        currentIndex -= 2;
        array.splice(currentIndex + 1, 2);
      }
      if (token.notation === "prefix") {
        array[currentIndex - 1].value = token.compute(
          +array[currentIndex - 1].value
        );
        currentIndex -= 1;
        array.splice(currentIndex + 1, 1);
      }
    }
    currentIndex += 1;
  }
  return array[array.length - 1].value;
}

function updateBottomDisplay(character) {
  Calculator.bottomDisplayText += `${character}`;
  displayBottom.textContent = Calculator.bottomDisplayText;
}

function updateTopDisplay(character) {
  Calculator.topDisplayText += `${character}`;
  displayTop.textContent = Calculator.topDisplayText;
}

function reset() {
  Calculator.tokenArray = [];
  Calculator.topDisplayText = "";
  Calculator.bottomDisplayText = "";
  Calculator.ANS = undefined;
  displayTop.textContent = Calculator.topDisplayText;
  displayBottom.textContent = Calculator.bottomDisplayText;
}
