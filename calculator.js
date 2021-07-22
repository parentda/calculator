const Calculator = {
  currentID: 0,
  currentIndex: 0,
  tokenArray: [],
  display: {
    currentIndex: 0,
    stringArray: [],
    stringExpression: "",
    topDisplayText: "",
    bottomDisplayText: "",
  },
  ANS: undefined,
  powerLevels: {
    currentPowerLevel: 0,
    openParentheses: [],
  },
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
      value: "&#9633;",
      notation: "infix",
      precedence: 40,
      associativity: "right",
      compute: (num1, num2) => num1 ** num2,
    },

    root: {
      value: ["&#9633;", "&#x0221A;"],
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
const unaryOperatorButton = document.querySelector(
  "[data-type='unary-operator']"
);
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

    if (lastToken && lastToken.type === "number") {
      if (buttonValue === "0" && lastToken.value === "0") {
        // do nothing
      } else {
        lastToken.value += buttonValue;
        stringifyTokenArray();
      }
    } else if (Calculator.tokenArray.length && lastToken.value === ")") {
      implicitMultiply();
      createToken("number", buttonValue, 0, true);
    } else {
      createToken("number", buttonValue, 0, true);
    }
  });
});

operatorButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    let buttonValue;
    const lastToken = Calculator.tokenArray[Calculator.tokenArray.length - 1];

    if (event.target.localName === "sup") {
      buttonValue = event.target.parentElement.getAttribute("data-value");
    } else {
      buttonValue = event.target.getAttribute("data-value");
    }

    if (
      lastToken &&
      (lastToken.type === "number" ||
        (lastToken.value === ")" && lastToken.visibility))
    ) {
      if (buttonValue === "^" || buttonValue === "root") {
        Calculator.powerLevels.currentPowerLevel += 1;
        createToken("operator", buttonValue, 0, true);
        createToken("parenthesis", "(", 0, false);
        createToken("parenthesis", ")", 0, false);
      } else {
        createToken("operator", buttonValue, 0, true);
      }
    }
  });
});

unaryOperatorButton.addEventListener("click", (event) => {
  const buttonValue = event.target.getAttribute("data-value");
  const lastToken = Calculator.tokenArray[Calculator.tokenArray.length - 1];
  const secondLastToken =
    Calculator.tokenArray[Calculator.tokenArray.length - 2];

  if (
    !lastToken ||
    (lastToken.type === "operator" && lastToken.notation === "infix") ||
    lastToken.value === "("
  ) {
    createToken("operator", buttonValue, 0, true);
  } else if (lastToken.value === ")") {
    implicitMultiply();
    createToken("operator", buttonValue, 0, true);
  } else if (lastToken.notation === "prefix") {
    deleteToken(0);
  } else if (lastToken.type === "number") {
    if (secondLastToken && secondLastToken.notation === "prefix") {
      deleteToken(1);
    } else {
      createToken("operator", buttonValue, 1, true);
    }
  }
});

parenthesisButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const buttonValue = event.target.textContent;
    const lastToken = Calculator.tokenArray[Calculator.tokenArray.length - 1];

    if (buttonValue === "(") {
      if (
        lastToken &&
        (lastToken.type === "number" || lastToken.value === ")")
      ) {
        implicitMultiply();
      }
      Calculator.openParentheses += 1;
      createToken("parenthesis", buttonValue, 0, true);
    } else if (
      buttonValue === ")" &&
      Calculator.openParentheses > 0 &&
      lastToken.value !== "(" &&
      lastToken.type !== "operator"
    ) {
      Calculator.openParentheses -= 1;
      createToken("parenthesis", buttonValue, 0, true);
    }
  });
});

evaluateButton.addEventListener("click", () => {
  if (!Calculator.tokenArray.length) {
    return;
  }
  while (Calculator.openParentheses > 0) {
    createToken("parenthesis", ")", 0, true);
    Calculator.openParentheses -= 1;
  }
  const parsedArray = parseTokenArray(Calculator.tokenArray);
  Calculator.ANS = evaluateParsedArray(parsedArray);

  Calculator.currentID = 0;
  Calculator.tokenArray = [];
  Calculator.display.topDisplayText = Calculator.ANS;
  Calculator.display.bottomDisplayText = "";
  Calculator.display.stringArray = [];
  Calculator.display.stringExpression = "";
  Calculator.display.currentIndex = -1;
  Calculator.ANS = undefined;
  Calculator.openParentheses = 0;
  displayTop.textContent = Calculator.display.topDisplayText;
  displayBottom.textContent = Calculator.display.bottomDisplayText;
});

resetButton.addEventListener("click", reset);

decimalButton.addEventListener("click", (event) => {
  const buttonValue = event.target.textContent;
  const lastToken = Calculator.tokenArray[Calculator.tokenArray.length - 1];
  const stringToken =
    Calculator.display.stringArray[
      Calculator.display.stringArray.findIndex(
        (element) => element.id === lastToken.id
      )
    ];

  if (
    lastToken &&
    lastToken.type === "number" &&
    !lastToken.value.includes(".")
  ) {
    lastToken.value += buttonValue;
    // stringToken.value += buttonValue;
    stringifyTokenArray();
    // displayStringArray();
  } else if (
    lastToken &&
    lastToken.type === "number" &&
    lastToken.value.includes(".")
  ) {
    // do nothing
  } else {
    createToken("number", buttonValue, 0, true);
  }
});

answerButton.addEventListener("click", () => {
  if (Calculator.ANS) {
    createToken("number", Calculator.ANS, 0, true);
  }
});

function createToken(tokenType, tokenValue, positionFromEnd, visibility) {
  let token;
  switch (tokenType) {
    case "operator":
      token = Calculator.operators[tokenValue];
      token.type = "operator";
      token.id = Calculator.currentID;
      token.visibility = visibility;
      token.powerLevel = Calculator.powerLevels.currentPowerLevel;
      break;

    default:
      token = {
        type: tokenType,
        value: tokenValue,
        id: Calculator.currentID,
        visibility: visibility,
        powerLevel: Calculator.powerLevels.currentPowerLevel,
      };
      break;
  }
  Calculator.currentID += 1;

  Calculator.tokenArray.splice(
    Calculator.tokenArray.length - positionFromEnd,
    0,
    token
  );

  stringifyTokenArray();
}

function deleteToken(positionFromEnd) {
  const deletedToken = Calculator.tokenArray.splice(
    Calculator.tokenArray.length - 1 - positionFromEnd,
    1
  );
  stringifyTokenArray();
  // subtractStringArray(deletedToken[0]);
}

function shuntingYardAlgorithm(token, outQueue, opStack) {
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
  array.forEach((token) => {
    shuntingYardAlgorithm(token, outputQueue, operatorStack);
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

function implicitMultiply() {
  createToken("operator", "*", 0, false);
}

function reset() {
  Calculator.currentID = 0;
  Calculator.tokenArray = [];
  Calculator.display.topDisplayText = "";
  Calculator.display.bottomDisplayText = "";
  Calculator.display.stringArray = [];
  Calculator.display.stringExpression = "";
  Calculator.display.currentIndex = -1;
  Calculator.ANS = undefined;
  Calculator.openParentheses = 0;
  displayTop.textContent = Calculator.display.topDisplayText;
  displayBottom.textContent = Calculator.display.bottomDisplayText;
}

function addStringArray(token, positionFromEnd) {
  if (token.visibility) {
    // properly space numbers, operators, and brackets in the expression string representation
    let bufferChar = "";
    if (
      Calculator.display.stringArray.length &&
      ((token.type === "number" &&
        Calculator.display.stringArray[Calculator.display.currentIndex]
          .precedence < 30) ||
        (token.precedence === 30 &&
          Calculator.display.stringArray[Calculator.display.currentIndex]
            .precedence < 30) ||
        (token.type === "operator" &&
          token.precedence < 30 &&
          Calculator.display.stringArray[Calculator.display.currentIndex]
            .type === "number") ||
        (token.value === "(" &&
          Calculator.display.stringArray[Calculator.display.currentIndex]
            .precedence < 30) ||
        (token.type === "operator" &&
          token.precedence < 30 &&
          Calculator.display.stringArray[Calculator.display.currentIndex]
            .value === ")"))
    ) {
      bufferChar = " ";
    } else if (
      Calculator.display.stringArray.length &&
      token.precedence === 30 &&
      Calculator.display.stringArray[Calculator.display.currentIndex].type ===
        "number"
    ) {
      Calculator.display.stringArray[Calculator.display.currentIndex].value =
        Calculator.display.stringArray[
          Calculator.display.currentIndex
        ].value.trim();
      bufferChar = " ";
    }

    // properly format exponents
    if (token.value.length === 3) {
      //this is a test
    }

    // properly format roots
    else if (token.value.length === 4) {
    }

    const tempArray = [];
    const stringArrayToken = {};
    tempArray[0] = stringArrayToken;
    stringArrayToken.type = token.type;
    stringArrayToken.id = token.id;
    stringArrayToken.value = bufferChar + token.value;
    stringArrayToken.notation = token.notation;
    stringArrayToken.precedence = token.precedence;

    Calculator.display.stringArray.splice(
      Calculator.display.currentIndex + 1 - positionFromEnd,
      0,
      ...tempArray
    );
    Calculator.display.currentIndex += 1;
    displayStringArray();
  }
}

function subtractStringArray(token) {
  while (
    Calculator.display.stringArray.findIndex(
      (element) => element.id === token.id
    ) >= 0
  ) {
    const stringTokenIndex = Calculator.display.stringArray.findIndex(
      (element) => element.id === token.id
    );
    Calculator.display.stringArray.splice(stringTokenIndex, 1);
    Calculator.display.currentIndex = stringTokenIndex;
  }
  displayStringArray();
}

function displayStringArray() {
  Calculator.display.stringExpression = Calculator.display.stringArray.join("");
  displayBottom.innerHTML = Calculator.display.stringExpression;
}

function stringifyTokenArray() {
  let stringExpressionArray = [];
  Calculator.tokenArray.forEach((token) => {
    // if (token.visibility) {
    stringExpressionArray.push(token.value);
    // }
  });
  Calculator.display.stringArray = stringExpressionArray;
  displayStringArray();
}
