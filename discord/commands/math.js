//From https://github.com/smogon/pokemon-showdown/server/chat-plugins/calculator.ts

"use strict";

const OPERATORS = {
	"^": {
		precedence: 4,
		associativity: "Right",
	},
	"/": {
		precedence: 3,
		associativity: "Left",
	},
	"*": {
		precedence: 3,
		associativity: "Left",
	},
	"+": {
		precedence: 2,
		associativity: "Left",
	},
	"-": {
		precedence: 2,
		associativity: "Left",
	},
};

module.exports = {
	desc: "Calculates an arithmetical expression.",
	longDesc: "Calculates an arithmetical question. Supports PEMDAS (Parenthesis, Exponents, Multiplication, Division, Addition and Subtraction), pi and e.",
	usage: "<arithmetical question>",
	aliases: ["calc", "calculate", "calculator"],
	async process(message, args) {
		try {
			const result = solveRPN(parseMathematicalExpression(args.join(",")));
			message.channel.send(result);
		} catch (e) {
			message.channel.send(e.message);
		}
		return true;
	},
};

function parseMathematicalExpression(infix) {
	// Shunting-yard Algorithm -- https://en.wikipedia.org/wiki/Shunting-yard_algorithm
	const outputQueue = [];
	const operatorStack = [];
	infix = infix.replace(/\s+/g, "");
	infix = infix.split(/([+\-*/^()])/);
	infix = infix.filter(token => token);
	let isExprExpected = true;
	for (const token of infix) {
		if (isExprExpected && "+-".includes(token)) {
			if (token === "-") operatorStack.push("negative");
		} else if ("^*/+-".includes(token)) {
			if (isExprExpected) throw new SyntaxError(`Got "${token}" where an expression should be`);
			const op = OPERATORS[token];
			let prevToken = operatorStack[operatorStack.length - 1];
			let prevOp = OPERATORS[prevToken];
			while ("^*/+-".includes(prevToken) && (
				op.associativity === "Left" ? op.precedence <= prevOp.precedence : op.precedence < prevOp.precedence
			)) {
				outputQueue.push(operatorStack.pop());
				prevToken = operatorStack[operatorStack.length - 1];
				prevOp = OPERATORS[prevToken];
			}
			operatorStack.push(token);
			isExprExpected = true;
		} else if (token === "(") {
			if (!isExprExpected) throw new SyntaxError(`Got "(" where an operator should be`);
			operatorStack.push(token);
			isExprExpected = true;
		} else if (token === ")") {
			if (isExprExpected) throw new SyntaxError(`Got ")" where an expression should be`);
			while (operatorStack.length && operatorStack[operatorStack.length - 1] !== "(") {
				outputQueue.push(operatorStack.pop());
			}
			operatorStack.pop();
			isExprExpected = false;
		} else {
			if (!isExprExpected) throw new SyntaxError(`Got "${token}" where an operator should be`);
			outputQueue.push(token);
			isExprExpected = false;
		}
	}
	if (isExprExpected) throw new SyntaxError(`Input ended where an expression should be`);
	while (operatorStack.length > 0) {
		const token = operatorStack.pop();
		if (token === "(") continue;
		outputQueue.push(token);
	}
	return outputQueue;
}

function solveRPN(rpn) {
	const resultStack = [];
	for (const token of rpn) {
		if (token === "negative") {
			if (!resultStack.length) throw new SyntaxError(`Unknown syntax error`);
			resultStack.push(-resultStack.pop());
		} else if (!"^*/+-".includes(token)) {
			let number = Number(token);
			if (isNaN(number) && Math[token.toUpperCase()]) {
				number = Math[token.toUpperCase()];
			}
			if (isNaN(number) && token !== "NaN") {
				throw new SyntaxError(`Unrecognized token ${token}`);
			}
			resultStack.push(number);
		} else {
			if (resultStack.length < 2) throw new SyntaxError(`Unknown syntax error`);
			const a = resultStack.pop();
			const b = resultStack.pop();
			switch (token) {
			case "+":
				resultStack.push(a + b);
				break;
			case "-":
				resultStack.push(b - a);
				break;
			case "*":
				resultStack.push(a * b);
				break;
			case "/":
				resultStack.push(b / a);
				break;
			case "^":
				resultStack.push(b ** a);
				break;
			}
		}
	}
	if (resultStack.length !== 1) throw new SyntaxError(`Unknown syntax error`);
	return resultStack.pop();
}
