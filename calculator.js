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
const evaluateButton = document.querySelector("[data-type='evaluate']");

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

evaluateButton.addEventListener("click", () => {
  const parsedArray = parseTokenArray(tokenArray);
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

  console.log(outputQueue);
  // console.log(`Output Queue: `);
  // console.log(outputQueue);
  // console.log(`Operator Stack: `);
  // console.log(operatorStack);
}

function evaluateParsedArray(array) {}

function updateBottomDisplay(character) {
  Calculator.bottomDisplayText += `${character}`;
  displayBottom.textContent = Calculator.bottomDisplayText;
}
