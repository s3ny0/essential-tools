const { type } = require("express/lib/response");


function displayNumber(value) {
    let display = document.getElementById("display");

    // Prevent multiple decimals in one number
    if (value === "." && display.innerHTML.includes(".")) {
        const parts = display.innerHTML.split(/[\+\-\*\/]/);
        if (parts[parts.length - 1].includes(".")) {
            return;
        }
    }

    // If the current display value is 0 or if the last input was a result, reset the display
    if (display.innerHTML === "0" || display.dataset.isResult) {
        // Handle case where operator follows immediately after "="
        if (/[+\-*/]/.test(value)) {
            display.dataset.isResult = ""; // Clear the result flag
        } else {
            display.innerHTML = value;
            delete display.dataset.isResult;
            return;
        }
    }

    // Handle consecutive operators
    if (/[+\-*/]$/.test(display.innerHTML) && /[+\-*/]/.test(value)) {
        if (value === '-' && /[-+]$/.test(display.innerHTML)) {
            display.innerHTML += value; // Allow negative sign after operator
        } else {
            display.innerHTML = display.innerHTML.slice(0, -1) + value; // Replace last operator with the new one
        }
    } else {
        display.innerHTML += value;
    }
}

function clearScreen() {
    let display = document.getElementById("display");
    display.innerHTML = "0";
}

function calculate() {
    let display = document.getElementById("display");
    let input = display.innerHTML;

    // Regular expression to match the input with possible operations including decimal numbers
    const pattern = /^-?\d+(\.\d+)?([+\-*/]-?\d+(\.\d+)?)*$/;

    if (pattern.test(input)) {
        let result;
        try {
            // Evaluate the expression directly
            result = eval(input.replace(/([+\-*/])+/g, '$1')); // Replace multiple operators with the last one
        } catch (error) {
            result = "Error";
        }

        display.innerHTML = result;
        display.dataset.isResult = "true";
    } else {
        display.innerHTML = "Invalid Input";
    }
}

/* Event listeners for buttons (assuming you have buttons with these IDs)
document.getElementById("clear").addEventListener("click", clearScreen);
document.getElementById("equals").addEventListener("click", calculate);
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        calculate();
    }
});*/


// Example event listener for number and operator buttons
document.querySelectorAll(".number, .operator").forEach(button => {
    button.addEventListener("click", function() {
        displayNumber(button.innerHTML);
    });
});
