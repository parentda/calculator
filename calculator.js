const Calculator = {
  currentID: 0,
  currentIndex: -1,
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
  tempCharacter: "&#9633;",
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
      value: "&#xd7;",
      notation: "infix",
      precedence: 20,
      associativity: "left",
      compute: (num1, num2) => num1 * num2,
    },

    "/": {
      value: "&#xf7;",
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
      value: "&#x0221A;",
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
const backspaceButton = document.querySelector("[data-type='backspace']");

numberButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const buttonValue = event.target.textContent;
    const lastToken = Calculator.tokenArray[Calculator.currentIndex];

    if (lastToken && lastToken.type === "number") {
      if (buttonValue === "0" && lastToken.value === "0") {
        // do nothing
      } else {
        lastToken.value += buttonValue;
        stringifyTokenArray();
      }
    } else if (Calculator.tokenArray.length && lastToken.value === ")") {
      implicitMultiply();
      createToken("number", buttonValue, Calculator.currentIndex, true, true);
    } else {
      createToken("number", buttonValue, Calculator.currentIndex, true, true);
    }
  });
});

operatorButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    let buttonValue;
    const lastToken = Calculator.tokenArray[Calculator.currentIndex];

    if (event.target.localName === "sup") {
      buttonValue = event.target.parentElement.getAttribute("data-value");
    } else {
      buttonValue = event.target.getAttribute("data-value");
    }

    if (
      lastToken &&
      (lastToken.type === "number" || lastToken.value === ")") // && lastToken.visibility))
    ) {
      if (buttonValue === "^" || buttonValue === "root") {
        if (buttonValue === "^") {
          createToken(
            "operator",
            buttonValue,
            Calculator.currentIndex,
            false,
            false
          );
        } else if (buttonValue === "root") {
          createToken(
            "operator",
            buttonValue,
            Calculator.currentIndex,
            true,
            false
          );
        }
        Calculator.powerLevels.currentPowerLevel += 1;
        createToken("parenthesis", "(", Calculator.currentIndex, false, false);
        createToken("parenthesis", ")", Calculator.currentIndex, false, true);
        Calculator.currentIndex -= 1;
      } else if (
        Calculator.powerLevels.currentPowerLevel > 0 &&
        !Calculator.powerLevels.openParentheses[
          Calculator.powerLevels.currentPowerLevel
        ]
      ) {
        while (
          !Calculator.powerLevels.openParentheses[
            Calculator.powerLevels.currentPowerLevel
          ] &&
          Calculator.powerLevels.currentPowerLevel > 0
        ) {
          Calculator.powerLevels.currentPowerLevel -= 1;
          Calculator.currentIndex += 1;
        }
        createToken(
          "operator",
          buttonValue,
          Calculator.currentIndex,
          true,
          true
        );
      } else {
        createToken(
          "operator",
          buttonValue,
          Calculator.currentIndex,
          true,
          true
        );
      }
    }
  });
});

unaryOperatorButton.addEventListener("click", (event) => {
  const buttonValue = event.target.getAttribute("data-value");
  const lastToken = Calculator.tokenArray[Calculator.currentIndex];
  const secondLastToken = Calculator.tokenArray[Calculator.currentIndex - 1];

  if (
    !lastToken ||
    (lastToken.type === "operator" && lastToken.notation === "infix") ||
    lastToken.value === "("
  ) {
    createToken("operator", buttonValue, Calculator.currentIndex, true, true);
  } else if (lastToken.value === ")") {
    implicitMultiply();
    createToken("operator", buttonValue, Calculator.currentIndex, true, true);
  } else if (lastToken.notation === "prefix") {
    deleteToken(Calculator.currentIndex);
  } else if (lastToken.type === "number") {
    if (secondLastToken && secondLastToken.notation === "prefix") {
      deleteToken(Calculator.currentIndex - 1);
    } else {
      createToken(
        "operator",
        buttonValue,
        Calculator.currentIndex - 1,
        true,
        true
      );
    }
  }
});

parenthesisButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const buttonValue = event.target.textContent;
    const lastToken = Calculator.tokenArray[Calculator.currentIndex];

    if (buttonValue === "(") {
      if (
        Calculator.powerLevels.currentPowerLevel > 0 &&
        !Calculator.powerLevels.openParentheses[
          Calculator.powerLevels.currentPowerLevel
        ] &&
        Calculator.tokenArray[Calculator.currentIndex].value !== "("
      ) {
        while (
          !Calculator.powerLevels.openParentheses[
            Calculator.powerLevels.currentPowerLevel
          ] &&
          Calculator.powerLevels.currentPowerLevel > 0
        ) {
          Calculator.powerLevels.currentPowerLevel -= 1;
          Calculator.currentIndex += 1;
        }
      }
      if (
        lastToken &&
        (lastToken.type === "number" || lastToken.value === ")")
      ) {
        implicitMultiply();
      }

      if (
        !Calculator.powerLevels.openParentheses[
          Calculator.powerLevels.currentPowerLevel
        ]
      ) {
        Calculator.powerLevels.openParentheses[
          Calculator.powerLevels.currentPowerLevel
        ] = 0;
      }
      Calculator.powerLevels.openParentheses[
        Calculator.powerLevels.currentPowerLevel
      ] += 1;
      Calculator.openParentheses += 1;
      // Calculator.openParentheses += 1;
      createToken(
        "parenthesis",
        buttonValue,
        Calculator.currentIndex,
        true,
        true
      );
    } else if (
      buttonValue === ")" &&
      Calculator.powerLevels.openParentheses[
        Calculator.powerLevels.currentPowerLevel
      ] > 0 &&
      lastToken.value !== "(" &&
      lastToken.type !== "operator"
    ) {
      createToken(
        "parenthesis",
        buttonValue,
        Calculator.currentIndex,
        true,
        true
      );
      Calculator.powerLevels.openParentheses[
        Calculator.powerLevels.currentPowerLevel
      ] -= 1;
      Calculator.openParentheses -= 1;
      if (
        !Calculator.powerLevels.openParentheses[
          Calculator.powerLevels.currentPowerLevel
        ] &&
        Calculator.powerLevels.currentPowerLevel > 0
      ) {
        Calculator.powerLevels.currentPowerLevel -= 1;
        Calculator.currentIndex += 1;
      }
    } else if (
      buttonValue === ")" &&
      !Calculator.powerLevels.openParentheses[
        Calculator.powerLevels.currentPowerLevel
      ] &&
      Calculator.openParentheses &&
      lastToken.value !== "(" &&
      lastToken.type !== "operator"
    ) {
      while (
        !Calculator.powerLevels.openParentheses[
          Calculator.powerLevels.currentPowerLevel
        ] &&
        Calculator.powerLevels.currentPowerLevel > 0
      ) {
        Calculator.powerLevels.currentPowerLevel -= 1;
        Calculator.currentIndex += 1;
      }
      createToken(
        "parenthesis",
        buttonValue,
        Calculator.currentIndex,
        true,
        true
      );
      Calculator.powerLevels.openParentheses[
        Calculator.powerLevels.currentPowerLevel
      ] -= 1;
      Calculator.openParentheses -= 1;
    }
    // Calculator.powerLevels.openParentheses[
    //   Calculator.powerLevels.currentPowerLevel
    // ] -= 1;
    // createToken("parenthesis", buttonValue, 0, true);
  });
});

evaluateButton.addEventListener("click", () => {
  if (!Calculator.tokenArray.length) {
    return;
  }
  const openParentheses = Calculator.powerLevels.openParentheses.reduce(
    (a, b) => a + b,
    0
  );
  for (let i = 0; i < openParentheses; i += 1) {
    createToken("parenthesis", ")", Calculator.currentIndex, true, true);
  }
  const parsedArray = parseTokenArray(Calculator.tokenArray);
  Calculator.ANS = evaluateParsedArray(parsedArray);

  Calculator.currentID = 0;
  Calculator.currentIndex = -1;
  Calculator.tokenArray = [];
  Calculator.display.topDisplayText = Calculator.ANS;
  Calculator.display.bottomDisplayText = "";
  Calculator.display.stringArray = [];
  Calculator.display.stringExpression = "";
  Calculator.display.currentIndex = 0;
  Calculator.ANS = undefined;
  Calculator.powerLevels.currentPowerLevel = 0;
  Calculator.powerLevels.openParentheses = [];
  Calculator.openParentheses = 0;
  displayTop.textContent = Calculator.display.topDisplayText;
  displayBottom.textContent = Calculator.display.bottomDisplayText;
});

backspaceButton.addEventListener("click", () => {
  let maxID;
  if (Calculator.tokenArray.length) {
    maxID = Calculator.tokenArray.reduce((a, b) => (a.id > b.id ? a : b)).id;
  }
  for (let i = Calculator.tokenArray.length - 1; i >= 0; i -= 1) {
    if (Calculator.tokenArray[i].id === maxID) {
      if (
        Calculator.tokenArray[i].type === "number" &&
        Calculator.tokenArray[i].value.length > 1
      ) {
        Calculator.tokenArray[i].value = Calculator.tokenArray[i].value.slice(
          0,
          -1
        );
        stringifyTokenArray();
      } else {
        Calculator.currentIndex = i;
        deleteToken(Calculator.currentIndex);
      }
    }
  }
});

resetButton.addEventListener("click", reset);

decimalButton.addEventListener("click", (event) => {
  const buttonValue = event.target.textContent;
  const lastToken = Calculator.tokenArray[Calculator.currentIndex];

  if (
    lastToken &&
    lastToken.type === "number" &&
    !lastToken.value.includes(".")
  ) {
    lastToken.value += buttonValue;
    stringifyTokenArray();
  } else if (
    lastToken &&
    lastToken.type === "number" &&
    lastToken.value.includes(".")
  ) {
    // do nothing
  } else {
    createToken("number", buttonValue, Calculator.currentIndex, true, true);
  }
});

answerButton.addEventListener("click", () => {
  if (Calculator.ANS) {
    createToken("number", Calculator.ANS, Calculator.currentIndex, true, true);
  }
});

function createToken(tokenType, tokenValue, index, visibility, incrementID) {
  let token = {};
  switch (tokenType) {
    case "operator":
      token = {
        ...Calculator.operators[tokenValue],
      };
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
  if (incrementID) {
    Calculator.currentID += 1;
  }

  Calculator.tokenArray.splice(index + 1, 0, token);
  Calculator.currentIndex += 1;
  stringifyTokenArray();
}

function deleteToken(index) {
  Calculator.tokenArray.splice(index, 1);
  Calculator.currentIndex -= 1;
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
  createToken("operator", "*", Calculator.currentIndex, false, false);
}

function reset() {
  Calculator.currentID = 0;
  Calculator.currentIndex = -1;
  Calculator.tokenArray = [];
  Calculator.display.topDisplayText = "";
  Calculator.display.bottomDisplayText = "";
  Calculator.display.stringArray = [];
  Calculator.display.stringExpression = "";
  Calculator.display.currentIndex = 0;
  Calculator.ANS = undefined;
  Calculator.powerLevels.currentPowerLevel = 0;
  Calculator.powerLevels.openParentheses = [];
  Calculator.openParentheses = 0;
  displayTop.textContent = Calculator.display.topDisplayText;
  displayBottom.textContent = Calculator.display.bottomDisplayText;
}

function displayStringArray() {
  Calculator.display.stringExpression = Calculator.display.stringArray.join("");
  displayBottom.innerHTML = Calculator.display.stringExpression;
}

function stringifyTokenArray() {
  Calculator.display.currentIndex = 0;
  let stringExpressionArray = [];
  Calculator.tokenArray.forEach((token, index) => {
    if (token.value === "^" || token.value === "&#x0221A;") {
      if (token.value === "&#x0221A;") {
        Calculator.display.currentIndex -= 1;
        stringExpressionArray.splice(
          Calculator.display.currentIndex,
          0,
          token.value
        );
      }
      stringExpressionArray.splice(Calculator.display.currentIndex, 0, "<sup>");
      Calculator.display.currentIndex += 1;
      stringExpressionArray.splice(
        Calculator.display.currentIndex,
        0,
        "</sup>"
      );

      if (
        Calculator.tokenArray[index + 2] &&
        !Calculator.tokenArray[index + 2].visibility
      ) {
        stringExpressionArray.splice(
          Calculator.display.currentIndex,
          0,
          Calculator.tempCharacter
        );
        Calculator.display.currentIndex += 1;
      }
    } else if (token.visibility) {
      if (token.powerLevel === 0) {
        Calculator.display.currentIndex = stringExpressionArray.length;
      }
      if (
        Calculator.tokenArray[index - 1] &&
        ((Calculator.tokenArray[index - 1].value === "(" &&
          Calculator.tokenArray[index - 1].visibility) ||
          (token.type === "number" &&
            Calculator.tokenArray[index - 1].precedence === 30) ||
          (token.value === "(" &&
            !Calculator.tokenArray[index - 1].visibility) ||
          token.value === ")" ||
          (!Calculator.tokenArray[index - 1].visibility &&
            token.powerLevel === Calculator.tokenArray[index - 1].powerLevel))
      ) {
        // do nothing
      } else {
        stringExpressionArray.splice(Calculator.display.currentIndex, 0, " ");
        Calculator.display.currentIndex += 1;
      }
      stringExpressionArray.splice(
        Calculator.display.currentIndex,
        0,
        token.value
      );
      Calculator.display.currentIndex += 1;
    } else if (
      Calculator.tokenArray[index + 1] &&
      token.powerLevel > Calculator.tokenArray[index + 1].powerLevel
    ) {
      Calculator.display.currentIndex += 1;
    }
  });
  Calculator.display.stringArray = stringExpressionArray;
  displayStringArray();
}
