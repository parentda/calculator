const Calculator = {
  currentID: 0,
  currentIndex: -1,
  justEvaluated: false,
  currentButton: undefined,
  tokenArray: [],
  display: {
    currentIndex: 0,
    indexFromEnd: 0,
    returnIndex: [],
    stringArray: [],
    stringExpression: "",
    topDisplayText: "",
    bottomDisplayText: "",
  },
  ANS: "0",
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

const buttons = document.querySelectorAll("button");

buttons.forEach((button) => {
  const buttonFunction = window[button.getAttribute("data-type")];
  button.addEventListener("click", () => {
    buttonFunction(button);
  });
});

window.addEventListener("keydown", (event) => {
  const key = event.key;
  const button = document.querySelector(`button[data-key~="${key}"]`);
  if (button) {
    button.classList.add("key-press");
    Calculator.currentButton = button;
    const buttonFunction = window[button.getAttribute("data-type")];
    buttonFunction(button);
  }
});

window.addEventListener("keyup", () => {
  const activeButtons = document.querySelectorAll(".key-press");
  activeButtons.forEach((button) => {
    button.classList.remove("key-press");
  });
  Calculator.currentButton = undefined;
});

function number(button) {
  const buttonValue = button.textContent;
  const lastToken = Calculator.tokenArray[Calculator.currentIndex];
  if (Calculator.justEvaluated) {
    lastToken.value = buttonValue;
    stringifyTokenArray();
  } else if (lastToken && lastToken.type === "number") {
    if (
      (buttonValue === "0" && lastToken.value === "0") ||
      lastToken.value === "ANS"
    ) {
      // do nothing
    } else if (buttonValue !== "0" && lastToken.value === "0") {
      lastToken.value = buttonValue;
      stringifyTokenArray();
    } else {
      lastToken.value += buttonValue;
      stringifyTokenArray();
    }
  } else if (Calculator.tokenArray.length && lastToken.value === ")") {
    while (
      !Calculator.powerLevels.openParentheses[
        Calculator.powerLevels.currentPowerLevel
      ] &&
      Calculator.powerLevels.currentPowerLevel > 0
    ) {
      Calculator.powerLevels.currentPowerLevel -= 1;
      Calculator.currentIndex += 1;
    }
    implicitMultiply();
    createToken("number", buttonValue, Calculator.currentIndex, true, true);
  } else {
    createToken("number", buttonValue, Calculator.currentIndex, true, true);
  }
}

function operator(button) {
  let buttonValue;
  const lastToken = Calculator.tokenArray[Calculator.currentIndex];

  if (button.localName === "sup") {
    buttonValue = button.parentElement.getAttribute("data-value");
  } else {
    buttonValue = button.getAttribute("data-value");
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
      createToken("operator", buttonValue, Calculator.currentIndex, true, true);
    } else {
      createToken("operator", buttonValue, Calculator.currentIndex, true, true);
    }
  }
}

function unaryOperator(button) {
  const buttonValue = button.getAttribute("data-value");
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
    stringifyTokenArray();
  } else if (lastToken.type === "number") {
    if (secondLastToken && secondLastToken.notation === "prefix") {
      deleteToken(Calculator.currentIndex - 1);
      stringifyTokenArray();
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
}

function parenthesis(button) {
  const buttonValue = button.textContent;
  const lastToken = Calculator.tokenArray[Calculator.currentIndex];

  if (buttonValue === "(") {
    if (
      Calculator.justEvaluated ||
      (Calculator.tokenArray.length === 1 && lastToken.value === "0")
    ) {
      deleteToken(Calculator.currentIndex);
      createToken(
        "parenthesis",
        buttonValue,
        Calculator.currentIndex,
        true,
        true
      );
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
      stringifyTokenArray();
    } else {
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
      createToken(
        "parenthesis",
        buttonValue,
        Calculator.currentIndex,
        true,
        true
      );
    }
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
}

function evaluate(button) {
  if (!Calculator.tokenArray.length) {
    return;
  }

  let lastIndex = Calculator.tokenArray.length - 1;
  while (!Calculator.tokenArray[lastIndex].visibility) {
    if (Calculator.tokenArray[lastIndex].precedence > 30) {
      break;
    } else {
      lastIndex -= 1;
    }
  }
  if (
    Calculator.tokenArray[lastIndex].type === "operator" ||
    Calculator.tokenArray[lastIndex].value === "("
  ) {
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

  resetCalc();
  Calculator.display.topDisplayText = `&lrm;${Calculator.display.stringExpression} =&lrm;`;
  displayTop.innerHTML = Calculator.display.topDisplayText;
  initializeTokenArray("number", Calculator.ANS);
  stringifyTokenArray();
  Calculator.justEvaluated = true;
}

function backspace(button) {
  let maxID;
  if (Calculator.tokenArray.length) {
    maxID = Calculator.tokenArray.reduce((a, b) => (a.id > b.id ? a : b)).id;
  }
  for (let i = Calculator.tokenArray.length - 1; i >= 0; i -= 1) {
    if (Calculator.tokenArray[i].id === maxID) {
      if (
        Calculator.tokenArray[i].type === "number" &&
        Calculator.tokenArray[i].value.length > 1 &&
        Calculator.tokenArray[i].value !== "ANS"
      ) {
        Calculator.tokenArray[i].value = Calculator.tokenArray[i].value.slice(
          0,
          -1
        );
        break;
      } else {
        Calculator.currentIndex = i;
        const deletedToken = deleteToken(Calculator.currentIndex)[0];
        if (deletedToken.value === ")" && deletedToken.visibility) {
          Calculator.powerLevels.openParentheses[deletedToken.powerLevel] += 1;
          Calculator.openParentheses += 1;
        } else if (deletedToken.value === "(" && deletedToken.visibility) {
          Calculator.powerLevels.openParentheses[deletedToken.powerLevel] -= 1;
          Calculator.openParentheses -= 1;
        }
        if (Calculator.tokenArray[Calculator.currentIndex]) {
          Calculator.powerLevels.currentPowerLevel =
            Calculator.tokenArray[Calculator.currentIndex].powerLevel;
        }
        while (
          Calculator.tokenArray[Calculator.currentIndex] &&
          Calculator.tokenArray[Calculator.currentIndex].value === ")" &&
          !Calculator.tokenArray[Calculator.currentIndex].visibility
        ) {
          Calculator.currentIndex -= 1;
        }
      }
    }
  }
  if (!Calculator.tokenArray.length) {
    initializeTokenArray("number", "0");
  }
  stringifyTokenArray();
}

function reset(button) {
  resetCalc();
  Calculator.display.topDisplayText = `&lrm;ANS = ${Calculator.ANS}&lrm;`;
  displayTop.innerHTML = Calculator.display.topDisplayText;
  initializeTokenArray("number", "0");
  stringifyTokenArray();
  Calculator.justEvaluated = true;
}

function decimal(button) {
  const buttonValue = button.textContent;
  const lastToken = Calculator.tokenArray[Calculator.currentIndex];
  if (
    lastToken &&
    lastToken.type === "number" &&
    (lastToken.value.includes(".") || lastToken.value === "ANS")
  ) {
    // do nothing
  } else if (
    lastToken &&
    lastToken.type === "number" &&
    !lastToken.value.includes(".")
  ) {
    lastToken.value += buttonValue;
    stringifyTokenArray();
  } else {
    createToken(
      "number",
      `0${buttonValue}`,
      Calculator.currentIndex,
      true,
      true
    );
  }
}

function answer(button) {
  const buttonValue = button.textContent;
  const lastToken = Calculator.tokenArray[Calculator.currentIndex];
  if (Calculator.justEvaluated) {
    lastToken.value = buttonValue;
    stringifyTokenArray();
  } else if (lastToken && lastToken.type === "number") {
    if (lastToken.value === "0") {
      lastToken.value = buttonValue;
      stringifyTokenArray();
    }
  } else if (Calculator.tokenArray.length && lastToken.value === ")") {
    while (
      !Calculator.powerLevels.openParentheses[
        Calculator.powerLevels.currentPowerLevel
      ] &&
      Calculator.powerLevels.currentPowerLevel > 0
    ) {
      Calculator.powerLevels.currentPowerLevel -= 1;
      Calculator.currentIndex += 1;
    }
    implicitMultiply();
    createToken("number", buttonValue, Calculator.currentIndex, true, true);
  } else {
    createToken("number", buttonValue, Calculator.currentIndex, true, true);
  }
}

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
  const deletedToken = Calculator.tokenArray.splice(index, 1);
  Calculator.currentIndex -= 1;
  return deletedToken;
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
        const num1 =
          array[currentIndex - 2].value === "ANS"
            ? +Calculator.ANS
            : +array[currentIndex - 2].value;
        const num2 =
          array[currentIndex - 1].value === "ANS"
            ? +Calculator.ANS
            : +array[currentIndex - 1].value;

        array[currentIndex - 2].value = token.compute(num1, num2);
        currentIndex -= 2;
        array.splice(currentIndex + 1, 2);
      }
      if (token.notation === "prefix") {
        const num1 =
          array[currentIndex - 1].value === "ANS"
            ? +Calculator.ANS
            : +array[currentIndex - 1].value;
        array[currentIndex - 1].value = token.compute(num1);
        currentIndex -= 1;
        array.splice(currentIndex + 1, 1);
      }
    }
    currentIndex += 1;
  }
  if (array[array.length - 1].value === "ANS") {
    array[array.length - 1].value = Calculator.ANS;
  }
  return array[array.length - 1].value.toString();
}

function implicitMultiply() {
  createToken("operator", "*", Calculator.currentIndex, false, false);
}

function resetCalc() {
  Calculator.currentID = 0;
  Calculator.currentIndex = -1;
  Calculator.tokenArray = [];
  Calculator.display.stringArray = [];
  Calculator.display.currentIndex = 0;
  Calculator.powerLevels.currentPowerLevel = 0;
  Calculator.powerLevels.openParentheses = [];
  Calculator.openParentheses = 0;
}

function displayStringArray() {
  if (Calculator.justEvaluated) {
    Calculator.display.topDisplayText = `&lrm;ANS = ${Calculator.ANS}&lrm;`;
    displayTop.innerHTML = Calculator.display.topDisplayText;
  }
  Calculator.display.stringExpression = `&lrm;${Calculator.display.stringArray.join(
    ""
  )}&lrm;`;
  displayBottom.innerHTML = Calculator.display.stringExpression;
  Calculator.justEvaluated = false;
}

function stringifyTokenArray() {
  Calculator.display.currentIndex = 0;
  Calculator.display.indexFromEnd = 0;
  Calculator.display.returnIndex = [];
  Calculator.display.stringArray = [];
  Calculator.tokenArray.forEach((token, index) => {
    if (token.value === "^" || token.value === "&#x0221A;") {
      Calculator.display.returnIndex.push(Calculator.display.indexFromEnd);
      if (token.value === "&#x0221A;") {
        while (
          Calculator.display.stringArray[
            Calculator.display.stringArray.length -
              1 +
              Calculator.display.indexFromEnd
          ] === "</sup>"
        ) {
          Calculator.display.indexFromEnd -= 1;
        }
        if (
          Calculator.display.stringArray[
            Calculator.display.stringArray.length -
              1 +
              Calculator.display.indexFromEnd
          ] === ")"
        ) {
          let unbalancedParentheses = 1;
          while (unbalancedParentheses) {
            Calculator.display.indexFromEnd -= 1;
            if (
              Calculator.display.stringArray[
                Calculator.display.stringArray.length -
                  1 +
                  Calculator.display.indexFromEnd
              ] === ")"
            ) {
              unbalancedParentheses += 1;
            } else if (
              Calculator.display.stringArray[
                Calculator.display.stringArray.length -
                  1 +
                  Calculator.display.indexFromEnd
              ] === "("
            ) {
              unbalancedParentheses -= 1;
            }
          }
          Calculator.display.indexFromEnd -= 1;
          if (Calculator.display.indexFromEnd === 0) {
            Calculator.display.stringArray.push(token.value);
          } else {
            Calculator.display.stringArray.splice(
              Calculator.display.indexFromEnd,
              0,
              token.value
            );
          }
        } else {
          Calculator.display.indexFromEnd -= 1;
          if (Calculator.display.indexFromEnd === 0) {
            Calculator.display.stringArray.push(token.value);
          } else {
            Calculator.display.stringArray.splice(
              Calculator.display.indexFromEnd,
              0,
              token.value
            );
          }
        }
        Calculator.display.indexFromEnd -= 1;
      }
      if (Calculator.display.indexFromEnd === 0) {
        Calculator.display.stringArray.push("<sup>");
      } else {
        Calculator.display.stringArray.splice(
          Calculator.display.indexFromEnd,
          0,
          "<sup>"
        );
      }
      if (Calculator.display.indexFromEnd === 0) {
        Calculator.display.stringArray.push("</sup>");
      } else {
        Calculator.display.stringArray.splice(
          Calculator.display.indexFromEnd,
          0,
          "</sup>"
        );
      }
      Calculator.display.indexFromEnd -= 1;

      if (
        Calculator.tokenArray[index + 2] &&
        !Calculator.tokenArray[index + 2].visibility
      ) {
        Calculator.display.stringArray.splice(
          Calculator.display.indexFromEnd,
          0,
          Calculator.tempCharacter
        );
      }
    } else if (token.visibility) {
      if (
        Calculator.tokenArray[index - 1] &&
        ((Calculator.tokenArray[index - 1].value === "(" &&
          Calculator.tokenArray[index - 1].visibility) ||
          ((token.type === "number" || token.value === "(") &&
            Calculator.tokenArray[index - 1].precedence === 30) ||
          (token.value === "(" &&
            !Calculator.tokenArray[index - 1].visibility) ||
          token.value === ")" ||
          (!Calculator.tokenArray[index - 1].visibility &&
            token.powerLevel === Calculator.tokenArray[index - 1].powerLevel))
      ) {
        // do nothing
      } else if (Calculator.display.indexFromEnd === 0) {
        Calculator.display.stringArray.push(" ");
      } else {
        Calculator.display.stringArray.splice(
          Calculator.display.indexFromEnd,
          0,
          " "
        );
      }

      if (Calculator.display.indexFromEnd === 0) {
        Calculator.display.stringArray.push(token.value);
      } else {
        Calculator.display.stringArray.splice(
          Calculator.display.indexFromEnd,
          0,
          token.value
        );
      }
    } else if (
      Calculator.tokenArray[index + 1] &&
      token.powerLevel > Calculator.tokenArray[index + 1].powerLevel
    ) {
      if (Calculator.display.returnIndex.length) {
        Calculator.display.indexFromEnd = Calculator.display.returnIndex.pop();
      }
    }
  });

  displayStringArray();
}

function initializeTokenArray(type, value) {
  createToken(type, value, Calculator.currentIndex, true, true);
}

initializeTokenArray("number", "0");
Calculator.justEvaluated = true;
