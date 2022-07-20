import Big from "./big.mjs";

let View = {
    inputScreen: document.getElementById("input"),
    outputScreen: document.getElementById("output"),
    displayInput: function(value) {    
        this.outputScreen.innerHTML = "";
        this.inputScreen.innerHTML += value;
    },
    displayOutput: function(value) {
        this.outputScreen.innerHTML = value;
    },
    displayDeletion: function() {
        this.inputScreen.innerHTML = this.inputScreen.innerHTML.slice(0, -1);
        this.outputScreen.innerHTML = "";
    },
    clearScreen: function() {
        this.inputScreen.innerHTML = "";
        this.outputScreen.innerHTML = "";  
    },
    displaySyntaxError: function() {
        document.getElementById("output").innerHTML ="SYNTAX ERROR!";
    }
}

let Calculation = {
    validate: function(infix) {
        let parenthesis = [];
        let numDot = 0;
        for (let i = 0; i < infix.length; i++) {
            let char = infix[i];
            let prev = infix[i - 1];
            let next = infix[i + 1];
            switch (char) {
                case "(":
                    if (next == ")") {
                        return false;
                    }
                    parenthesis.push(char);
                    break;
                case ")":
                    if (parenthesis.length == 0 || prev == "(") {
                        return false;
                    } else {
                        parenthesis.pop();
                    }
                    break;
                case "+": 
                case "-":
                case "*":
                case "/":
                    numDot = 0;
                    if (!Number.isInteger(parseInt(prev)) && prev != ")") {
                        return false;
                    }
                    if (!Number.isInteger(parseInt(next)) && next != "(") {
                        return false;
                    }
                    break;
                case ".":
                    numDot++;
                    if (numDot == 2 || !Number.isInteger(parseInt(prev)) || !Number.isInteger(parseInt(next))) {
                        return false;
                    }
                    break;
                default:
                    if (prev == ")" || next == "(") {
                        return false;
                    }
                    break;
            }
        }
        if (parenthesis.length != 0) {
            return false;
        }
        return true;
    },

    posfixConvert: function(infix) {
        let posfix = [];
        let stack = [];
        for (let i = 0; i < infix.length; i++) {
            let char = infix[i];
            switch (char) {
                case "(":
                    stack.push(char);
                    break;
                case ")":
                    while (stack[stack.length - 1] != "(") {
                        posfix.push(stack.pop());
                    }
                    stack.pop();
                    break;
                case "+":
                case "-":
                    while (stack[stack.length - 1] != "(" && stack.length != 0) {
                        posfix.push(stack.pop());
                    }
                    stack.push(char);
                    break;
                case "*":
                case "/":
                    let last = stack[stack.length - 1];
                    while (last != "+" && last != "-" && last != "(" && stack.length != 0) {
                        posfix.push(stack.pop());
                        last = stack[stack.length - 1];
                    }
                    stack.push(char);
                    break;
                default:
                    let isFloat = false;
                    let numberStr = "";
                    let decimalPart = 0.1;
                    for (let j = i; j < infix.length; j++) {
                        if ((Number.isInteger(parseInt(infix[j])) || infix[j] == ".")) {
                            if (infix[j] == ".") {
                                isFloat = true;
                            }
                            if (j == infix.length - 1) {
                                i = j;
                            }
                            numberStr += infix[j];
                        } else {
                            i = j - 1;
                            break;
                        }
                    }   
                    if (isFloat) {
                        posfix.push(parseFloat(numberStr));
                    } else {
                        posfix.push(parseInt(numberStr));
                    }
            }
        }
        while (stack.length != 0) {
            posfix.push(stack.pop());
        }
        return posfix;
    },

    calculate: function(posfix) {
        let stack = [];
        for (let i = 0; i < posfix.length; i++) {
            if (Number.isInteger(parseInt(posfix[i]))) {
                stack.push(posfix[i]);
            } else {
                let b = stack.pop();
                let a = new Big(stack.pop());
                switch (posfix[i]) {
                    case "+":
                        stack.push(parseFloat(a.plus(b).valueOf()));
                        break;
                    case "-":
                        stack.push(parseFloat(a.minus(b).valueOf()));
                        break;
                    case "*":
                        stack.push(parseFloat(a.times(b).valueOf()));
                        break;
                    case "/":
                        if (b == 0) {
                            return "ERROR";
                        }
                        stack.push(parseFloat(a.div(b).valueOf()));     
                }
            }
        }
        return stack.pop();
    }
}

function proceedInput() {
    let allInputBtn = document.getElementsByClassName("input");
    let deleteBtn = document.getElementById("delete");
    let clearBtn = document.getElementById("clear");
    let ansBtn = document.getElementById("ans");
    let equalBtn = document.getElementById("equal");
    for (let i = 0; i < allInputBtn.length; i++) {
        allInputBtn[i].onclick = function(eventObj) {
            let input = document.getElementById("input").innerHTML;
            let button = eventObj.target;
            if (input.length < 19) {
                View.displayInput(button.value);
            }
        };
    }
    deleteBtn.onclick = function() {        
        View.displayDeletion();
    }
    clearBtn.onclick = function() {         
        View.clearScreen();
    }
    ansBtn.onclick = function() {
        let output = document.getElementById("output").innerHTML;
        if (Number.isInteger(parseInt(output))) {
            View.clearScreen();
            View.displayInput(output);
        }
    }
    equalBtn.onclick = function() {
        let input = document.getElementById("input").innerHTML;
        if (input == "") {
            return;
        }
        if (Calculation.validate(input)) {
            let posfix = Calculation.posfixConvert(input);
            let ans = String(Calculation.calculate(posfix));
            while (ans.length > 19) {
                ans = ans.slice(0, -1);
            }
            View.displayOutput(ans);
        } else {
            View.displaySyntaxError();
        }
    }
}

window.onload = proceedInput;
