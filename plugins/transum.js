document.querySelectorAll("#MainTablep").forEach(function (element) {
  const match = (element.textContent || "").match(/(-?\d*\.?\d+)\s*([+\-×÷])\s*(-?\d*\.?\d+)/);

  if (match) {
    let result;
    const num1 = parseFloat(match[1]);
    const operator = match[2];
    const num2 = parseFloat(match[3]);

    switch (operator) {
      case "+":
        result = num1 + num2;
        break;
      case "-":
        result = num1 - num2;
        break;
      case "×": // Multiplication symbol
        result = num1 * num2;
        break;
      case "÷": // Division symbol
        result = num2 !== 0 ? num1 / num2 : "Error";
        break;
      default:
        result = "Invalid operator";
    }

    if (typeof result === "number") {
      result = parseFloat(result.toPrecision(15)); // Ensure precision
    }

    const parent = element.parentElement;
    if (parent) {
      const inputField = parent.querySelector("input.Answer_box");
      if (inputField) {
        inputField.value = result;
      }
    }
  }
});

// If `checkAnswers` is defined, call it
if (typeof checkAnswers === "function") {
  checkAnswers();
}
