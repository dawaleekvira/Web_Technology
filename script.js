/* =========================================================
   VINTAGE MINIMALIST CALCULATOR
   JavaScript functionality
   ========================================================= */


/* ---------------------------------------------------------
   1. GET HTML ELEMENTS
   --------------------------------------------------------- */

const display = document.getElementById("display");
const historyDisplay = document.getElementById("historyDisplay");

const numberButtons = document.querySelectorAll("[data-number]");
const operationButtons = document.querySelectorAll("[data-operation]");

const clearButton = document.querySelector('[data-action="clear"]');
const equalsButton = document.querySelector('[data-action="equals"]');
const decimalButton = document.querySelector('[data-action="decimal"]');
const signButton = document.querySelector('[data-action="sign"]');
const percentButton = document.querySelector('[data-action="percent"]');
const backspaceButton = document.querySelector('[data-action="backspace"]');


/* ---------------------------------------------------------
   2. CALCULATOR STATE
   ---------------------------------------------------------

   These variables represent the current state of the
   calculator.

   currentOperand  → number currently being entered
   previousOperand → first number in the calculation
   operation       → selected operator
   overwrite       → whether the next number replaces
                     the current result
--------------------------------------------------------- */

let currentOperand = "0";
let previousOperand = null;
let operation = null;
let overwrite = false;


/*
   Used for repeated "=" presses.

   Example:

   5 + 2 = 7
   = → 9
   = → 11

   The calculator remembers the last operation.
*/
let lastOperation = null;
let lastOperand = null;


/* ---------------------------------------------------------
   3. DISPLAY UPDATE
   --------------------------------------------------------- */

function updateDisplay() {

    /*
        Update the main calculator display.

        textContent is used because this is an <output>
        element rather than an <input>.
    */
    display.textContent = currentOperand;


    /*
        Build the operation history.

        Example:

        12 +
        12 + 5
    */

    if (previousOperand !== null && operation !== null) {

        historyDisplay.textContent =
            `${formatDisplayNumber(previousOperand)} ${getOperationSymbol(operation)}`;

    } else {

        historyDisplay.textContent = "\u00A0";
    }
}


/* ---------------------------------------------------------
   4. FORMAT NUMBERS
   --------------------------------------------------------- */

function formatDisplayNumber(value) {

    /*
        Keep Error visible.
    */
    if (value === "Error") {
        return "Error";
    }


    /*
        Remove unnecessary leading zeroes.

        Example:

        00012 → 12
    */
    if (typeof value === "string" && value.includes(".")) {

        const [integerPart, decimalPart] = value.split(".");

        const cleanInteger =
            integerPart === ""
                ? "0"
                : String(Number(integerPart));

        return `${cleanInteger}.${decimalPart}`;
    }


    return String(value);
}


/* ---------------------------------------------------------
   5. OPERATOR SYMBOLS
   --------------------------------------------------------- */

function getOperationSymbol(operator) {

    const symbols = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷"
    };

    return symbols[operator] || operator;
}


/* ---------------------------------------------------------
   6. INPUT NUMBERS
   --------------------------------------------------------- */

function inputNumber(number) {

    /*
        If the calculator currently shows an error,
        start fresh.
    */
    if (currentOperand === "Error") {
        resetCalculator();
    }


    /*
        After "=" or an operation result, typing a new
        number starts a new number.
    */
    if (overwrite) {

        currentOperand = number;

        overwrite = false;

        updateDisplay();

        return;
    }


    /*
        Prevent unnecessary leading zeroes.

        Example:

        0005 → 5
    */
    if (currentOperand === "0") {

        currentOperand = number;

    } else {

        currentOperand += number;
    }


    updateDisplay();
}


/* ---------------------------------------------------------
   7. DECIMAL POINT
   --------------------------------------------------------- */

function inputDecimal() {

    /*
        If an error exists, start a new calculation.
    */
    if (currentOperand === "Error") {
        resetCalculator();
    }


    /*
        If the next input should overwrite the result,
        start with 0.
    */
    if (overwrite) {

        currentOperand = "0.";

        overwrite = false;

        updateDisplay();

        return;
    }


    /*
        Prevent multiple decimal points.

        Example:

        3..2  ❌

        3.2   ✓
    */
    if (!currentOperand.includes(".")) {

        currentOperand += ".";

    }


    updateDisplay();
}


/* ---------------------------------------------------------
   8. SELECT OPERATION
   --------------------------------------------------------- */

function chooseOperation(nextOperation) {

    /*
        Ignore operations if calculator is in Error state.
    */
    if (currentOperand === "Error") {
        return;
    }


    /*
        If an operation already exists and the user enters
        another operator, calculate the existing operation
        first.

        Example:

        5 + 3 ×

        First calculate:

        5 + 3 = 8

        Then continue with:

        8 ×
    */
    if (operation !== null && previousOperand !== null && !overwrite) {

        calculate(false);
    }


    previousOperand = currentOperand;

    operation = nextOperation;

    overwrite = true;

    updateDisplay();
}


/* ---------------------------------------------------------
   9. CALCULATE
   --------------------------------------------------------- */

function calculate(saveForRepeat = true) {

    /*
        Do nothing if there is no operation.
    */
    if (
        operation === null ||
        previousOperand === null
    ) {
        return;
    }


    /*
        Prevent calculation if the user selected an
        operation but has not entered the second number.
    */
    if (overwrite && !lastOperation) {
        return;
    }


    const first = Number(previousOperand);
    const second = Number(currentOperand);

    let result;


    /* Perform selected operation */
    switch (operation) {

        case "+":
            result = first + second;
            break;

        case "-":
            result = first - second;
            break;

        case "*":
            result = first * second;
            break;

        case "/":

            /*
                Division by zero is invalid.

                Instead of Infinity, show Error.
            */
            if (second === 0) {

                currentOperand = "Error";

                previousOperand = null;

                operation = null;

                overwrite = true;

                lastOperation = null;

                lastOperand = null;

                updateDisplay();

                return;
            }

            result = first / second;

            break;

        default:
            return;
    }


    /*
        Fix JavaScript floating-point precision.

        Example:

        0.1 + 0.2

        JavaScript normally gives:

        0.30000000000000004

        We round the result to a maximum of
        8 decimal places.
    */
    result = roundResult(result);


    /*
        Save the operation for repeated "=" presses.
    */
    if (saveForRepeat) {

        lastOperation = operation;

        lastOperand = second;
    }


    /*
        Update calculator state.
    */
    currentOperand = String(result);

    previousOperand = null;

    operation = null;

    overwrite = true;


    updateDisplay();
}


/* ---------------------------------------------------------
   10. ROUNDING / FLOATING-POINT FIX
   --------------------------------------------------------- */

function roundResult(number) {

    /*
        Convert the number to a maximum of
        8 decimal places.

        Example:

        0.30000000000000004
        ↓
        0.3
    */
    const rounded =
        Number.parseFloat(number.toFixed(8));


    /*
        Avoid displaying Infinity or NaN.
    */
    if (!Number.isFinite(rounded)) {

        return "Error";
    }


    return rounded;
}


/* ---------------------------------------------------------
   11. REPEATED EQUALS
   --------------------------------------------------------- */

function repeatCalculation() {

    /*
        If there is no previous calculation,
        do nothing.
    */
    if (
        lastOperation === null ||
        lastOperand === null
    ) {
        return;
    }


    const first = Number(currentOperand);
    const second = Number(lastOperand);

    let result;


    switch (lastOperation) {

        case "+":
            result = first + second;
            break;

        case "-":
            result = first - second;
            break;

        case "*":
            result = first * second;
            break;

        case "/":

            if (second === 0) {

                currentOperand = "Error";

                lastOperation = null;

                lastOperand = null;

                overwrite = true;

                updateDisplay();

                return;
            }

            result = first / second;

            break;

        default:
            return;
    }


    result = roundResult(result);

    currentOperand = String(result);

    overwrite = true;

    updateDisplay();
}


/* ---------------------------------------------------------
   12. CLEAR
   --------------------------------------------------------- */

function resetCalculator() {

    /*
        Clear all calculator state.
    */
    currentOperand = "0";

    previousOperand = null;

    operation = null;

    overwrite = false;

    lastOperation = null;

    lastOperand = null;


    updateDisplay();
}


/* ---------------------------------------------------------
   13. SIGN TOGGLE
   --------------------------------------------------------- */

function toggleSign() {

    if (currentOperand === "Error") {
        return;
    }


    /*
        Do not change zero to -0.
    */
    if (Number(currentOperand) === 0) {
        return;
    }


    if (currentOperand.startsWith("-")) {

        currentOperand =
            currentOperand.substring(1);

    } else {

        currentOperand =
            "-" + currentOperand;
    }


    updateDisplay();
}


/* ---------------------------------------------------------
   14. PERCENTAGE
   --------------------------------------------------------- */

function calculatePercentage() {

    if (currentOperand === "Error") {
        return;
    }


    /*
        Convert:

        50 → 0.5
    */
    const number =
        Number(currentOperand) / 100;


    currentOperand =
        String(roundResult(number));


    updateDisplay();
}


/* ---------------------------------------------------------
   15. BACKSPACE
   --------------------------------------------------------- */

function backspace() {

    if (
        currentOperand === "Error" ||
        overwrite
    ) {
        return;
    }


    /*
        Remove the final character.

        Example:

        123 → 12
        12  → 1
        1   → 0
    */
    if (currentOperand.length > 1) {

        currentOperand =
            currentOperand.slice(0, -1);

    } else {

        currentOperand = "0";
    }


    /*
        Prevent "-0".
    */
    if (currentOperand === "-") {

        currentOperand = "0";
    }


    updateDisplay();
}


/* ---------------------------------------------------------
   16. BUTTON EVENTS
   ---------------------------------------------------------

   This is the main event-handling section.

   The practical teaches:

   User action
        ↓
   Event
        ↓
   Event listener
        ↓
   Function
        ↓
   DOM update
--------------------------------------------------------- */


/*
    Number button click events
*/
numberButtons.forEach(button => {

    button.addEventListener("click", () => {

        inputNumber(button.dataset.number);

    });

});


/*
    Operator button click events
*/
operationButtons.forEach(button => {

    button.addEventListener("click", () => {

        chooseOperation(button.dataset.operation);

    });

});


/*
    Decimal button
*/
decimalButton.addEventListener("click", () => {

    inputDecimal();

});


/*
    Clear button
*/
clearButton.addEventListener("click", () => {

    resetCalculator();

});


/*
    Equals button
*/
equalsButton.addEventListener("click", () => {

    if (
        operation !== null &&
        previousOperand !== null
    ) {

        calculate(true);

    } else {

        /*
            If there is no new operation,
            repeat the previous calculation.
        */
        repeatCalculation();
    }

});


/*
    Sign button
*/
signButton.addEventListener("click", () => {

    toggleSign();

});


/*
    Percentage button
*/
percentButton.addEventListener("click", () => {

    calculatePercentage();

});


/*
    Backspace button
*/
backspaceButton.addEventListener("click", () => {

    backspace();

});


/* ---------------------------------------------------------
   17. KEYBOARD EVENTS
   ---------------------------------------------------------

   The PDF specifically introduces:

   document.addEventListener("keydown", ...)
   event.key

   Keyboard support:
   0-9 → numbers
   .   → decimal
   +   → addition
   -   → subtraction
   *   → multiplication
   /   → division
   Enter / = → calculate
   Backspace → delete
   Escape → clear
--------------------------------------------------------- */

document.addEventListener("keydown", event => {

    const key = event.key;


    /*
        Number keys
    */
    if (
        key >= "0" &&
        key <= "9"
    ) {

        inputNumber(key);

        return;
    }


    /*
        Decimal
    */
    if (key === ".") {

        inputDecimal();

        return;
    }


    /*
        Operators
    */
    if (
        key === "+" ||
        key === "-" ||
        key === "*" ||
        key === "/"
    ) {

        chooseOperation(key);

        return;
    }


    /*
        Enter or = → Calculate
    */
    if (
        key === "Enter" ||
        key === "="
    ) {

        if (
            operation !== null &&
            previousOperand !== null
        ) {

            calculate(true);

        } else {

            repeatCalculation();
        }

        return;
    }


    /*
        Backspace → Delete last digit
    */
    if (key === "Backspace") {

        backspace();

        return;
    }


    /*
        Escape → Clear calculator
    */
    if (key === "Escape") {

        resetCalculator();

        return;
    }


    /*
        % keyboard support
    */
    if (key === "%") {

        calculatePercentage();

        return;
    }
});


/* ---------------------------------------------------------
   18. INITIALIZE CALCULATOR
   --------------------------------------------------------- */

updateDisplay();